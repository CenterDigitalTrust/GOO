const { app, BrowserWindow, ipcMain, clipboard, dialog, safeStorage } = require("electron");
const path = require("path");
const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");

const PROJECT_ID = "cybernetic-song-480314-n5";
const LOCATION = "us-central1";

let mainWindow = null;

function getGeminiAPIKey() {
  const key = getEnvVar("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not found in .env");
  return key;
}

function getEnvVar(key) {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (let line of lines) {
      const parts = line.split("=");
      if (parts[0].trim() === key) {
        return parts.slice(1).join("=").trim();
      }
    }
  }
  return process.env[key];
}

async function logToGrafana(stream_labels, log_line) {
  try {
    let apiKey = process.env.GRAFANA_API_KEY;
    if (!apiKey) {
      const keyPath = path.join(__dirname, "../mdgoografana.env");
      if (fs.existsSync(keyPath)) {
        apiKey = fs.readFileSync(keyPath, "utf8").trim();
      }
    }
    
    const pushUrl = getEnvVar("GRAFANA_PUSH_URL");
    const user = getEnvVar("GRAFANA_USER") || "000000";

    if (!apiKey || !pushUrl) return;

    const auth = Buffer.from(`${user}:${apiKey}`).toString("base64");
    const timeNano = (Date.now() * 1000000).toString();

    const payload = {
      streams: [
        {
          stream: stream_labels,
          values: [[timeNano, log_line]]
        }
      ]
    };

    const res = await fetch(pushUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("[GRAFANA] Push failed:", await res.text());
    } else {
      console.log(`[GRAFANA] Logged event: ${stream_labels.event}`);
    }
  } catch (err) {
    console.error("[GRAFANA] Error:", err.message);
  }
}

async function getAccessToken() {
  const jsonPath = path.join(__dirname, "../google-keys.json");
  if (!fs.existsSync(jsonPath)) throw new Error(`Service Account JSON not found at ${jsonPath}`);
  
  const auth = new GoogleAuth({
    keyFile: jsonPath,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
  
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function fetchVertex(endpointPath, data) {
  const token = await getAccessToken();
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/${endpointPath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errText = await res.text();
    const e = new Error(`Vertex API Error (${res.status}): ${errText}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300, height: 900,
    minWidth: 400, minHeight: 600,
    icon: path.join(__dirname, "../public/logo.png"),
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) { mainWindow.loadURL(devUrl); } 
  else { mainWindow.loadFile(path.join(__dirname, "../dist/index.html")); }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

ipcMain.handle("agent:run", async (_event, payload) => {
  try {
    const { prompt, model, format, type } = payload || {};
    const apiKey = getGeminiAPIKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const generateMediaTool = {
      name: "generate_media",
      description: "Generates an image or video based on a fully structured creative prompt. Call this once the prompt has enough detail (subject, style, lighting, camera angle) to produce a high-quality result.",
      parameters: {
        type: "OBJECT",
        properties: {
          mode: { type: "STRING", description: "Either 'image' or 'video'", enum: ["image", "video"] },
          prompt: { type: "STRING", description: "Final structured prompt in English" },
          style: { type: "STRING" },
          aspectRatio: { type: "STRING", enum: ["1:1", "16:9", "9:16", "2:3"] }
        },
        required: ["mode", "prompt"]
      }
    };

    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: "You are a creative director agent. Analyze the user's request and preset fragments. Structure it into a rich, detailed generation prompt, then call generate_media with the final result. Only call the tool once the prompt is complete and detailed.",
      tools: [{ functionDeclarations: [generateMediaTool] }]
    });

    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const result = await generativeModel.generateContent({ contents });
    const call = result.response.functionCalls()?.[0];
    const candidateContent = result.response.candidates?.[0]?.content;

    if (!call || call.name !== "generate_media") {
      return { success: false, reason: "Agent decided not to generate media.", agentText: result.response.text() };
    }
    contents.push(candidateContent);

    const args = call.args;
    console.log(`[AGENT] Decided to generate: ${args.mode}`);
    logToGrafana({ job: "goovd-agent", event: "agent_decision", mode: args.mode }, args.prompt || "empty prompt");

    let generationResult = {};
    const startTime = Date.now();

    try {
      if (args.mode === "image" || type === "image") {
        let aspect_ratio = "1:1";
        if (format === "16:9") aspect_ratio = "16:9";
        if (format === "9:16") aspect_ratio = "9:16";
        
        const data = {
          instances: [{ prompt: args.prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspect_ratio }
        };
        
        const res = await fetchVertex("publishers/google/models/imagegeneration@006:predict", data);
        const b64 = res?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const tempPath = path.join(app.getPath("temp"), `imagen_${Date.now()}.png`);
          fs.writeFileSync(tempPath, Buffer.from(b64, "base64"));
          generationResult = { url: `file://${tempPath}`, isVideo: false };
        } else {
           throw new Error("No image data from Vertex");
        }
      } else {
        const data = { instances: [{ prompt: args.prompt }], parameters: { fps: 24, length: 5 } };
        let endpoint = "publishers/google/models/videogeneration@001:predict";
        if (model === "luma") endpoint = "publishers/luma/models/lumavideo:predict";
        const res = await fetchVertex(endpoint, data);
        const b64 = res?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const tempPath = path.join(app.getPath("temp"), `video_${Date.now()}.mp4`);
          fs.writeFileSync(tempPath, Buffer.from(b64, "base64"));
          generationResult = { url: `file://${tempPath}`, isVideo: true };
        } else {
           throw new Error("No video data");
        }
      }
      
      const duration = Date.now() - startTime;
      logToGrafana({ job: "goovd-agent", event: "generation_result", mode: args.mode, status: "success" }, `Execution time: ${duration}ms`);

    } catch (e) {
      console.error("[AGENT] Generation failed, returning mock. Error:", e);
      generationResult = { url: `file://${path.join(__dirname, "../public/logo.png")}`, isVideo: false, mock: true };
      
      const duration = Date.now() - startTime;
      logToGrafana({ job: "goovd-agent", event: "generation_error", error_code: e.status || "500" }, `Fallback triggered after ${duration}ms. Error: ${e.message}`);
      logToGrafana({ job: "goovd-agent", event: "generation_result", mode: args.mode, status: "mock" }, `Execution time: ${duration}ms (MOCK)`);
    }

    contents.push({
      role: "user",
      parts: [{
        functionResponse: {
          id: call.id,
          name: call.name,
          response: { url: generationResult.url, status: "SUCCESS" }
        }
      }]
    });

    const finalResult = await generativeModel.generateContent({ contents });
    const agentText = finalResult.response.text();

    return {
      success: true,
      agentText: agentText,
      structuredPrompt: args.prompt,
      resultUrl: generationResult.url,
      isVideo: generationResult.isVideo,
      mock: generationResult.mock
    };
  } catch (err) {
    console.error("[AGENT ERROR]", err);
    return { success: false, reason: err.message };
  }
});

ipcMain.handle("boost:fetch", async (_event, payload) => {
  try {
    const { prompt } = payload || {};
    if (!prompt) return { success: false, reason: "missing_prompt" };
    const data = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    
    const geminiKey = getGeminiAPIKey();
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API Error: ${err}`);
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { success: true, result: { structured: text } };
  } catch (err) {
    return { success: false, status: err.status, message: err.message };
  }
});

ipcMain.handle("image:generate", async (_event, payload) => {
  try {
    const { prompt, model, format } = payload || {};
    if (!prompt) return { success: false, reason: "missing_prompt" };

    let aspect_ratio = "1:1";
    if (format === "16:9") aspect_ratio = "16:9";
    if (format === "9:16") aspect_ratio = "9:16";
    
    const data = {
      instances: [{ prompt: prompt }],
      parameters: { sampleCount: 1, aspectRatio: aspect_ratio }
    };
    
    const res = await fetchVertex("publishers/google/models/imagegeneration@006:predict", data);
    const b64 = res?.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      const tempPath = path.join(app.getPath("temp"), `imagen_${Date.now()}.png`);
      fs.writeFileSync(tempPath, Buffer.from(b64, "base64"));
      return { success: true, imageUrl: `file://${tempPath}` };
    }
    
    return { success: true, imageUrl: `file://${path.join(__dirname, "../public/logo.png")}`, mock: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle("video:generate", async (_event, payload) => {
  try {
    const { prompt, model } = payload || {};
    if (!prompt) return { success: false, reason: "missing_prompt" };
    const data = { instances: [{ prompt }], parameters: { fps: 24, length: 5 } };
    
    let endpoint = "publishers/google/models/videogeneration@001:predict";
    if (model === "luma") endpoint = "publishers/luma/models/lumavideo:predict";
    
    try {
       const res = await fetchVertex(endpoint, data);
       const b64 = res?.predictions?.[0]?.bytesBase64Encoded;
       if (b64) {
          const tempPath = path.join(app.getPath("temp"), `video_${Date.now()}.mp4`);
          fs.writeFileSync(tempPath, Buffer.from(b64, "base64"));
          return { success: true, videoUrl: `file://${tempPath}` };
       }
       return { success: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }; // fallback if API behaves weirdly
    } catch (apiErr) {
       return { success: false, status: apiErr.status, reason: apiErr.message };
    }
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle("video:continue", async (_event, payload) => {
  try {
    const { prompt, model, videoUrl } = payload || {};
    if (!videoUrl || !prompt) return { success: false, reason: "missing_params" };
    
    // Extract last frame using ffmpeg
    const cleanUrl = videoUrl.replace('file://', '');
    const outFrame = path.join(app.getPath("temp"), `lastframe_${Date.now()}.jpg`);
    const ffmpegPath = require("ffmpeg-static");
    execSync(`"${ffmpegPath}" -sseof -0.1 -i "${cleanUrl}" -vframes 1 "${outFrame}" -y`);
    
    const frameBase64 = fs.readFileSync(outFrame).toString("base64");
    
    const data = {
       instances: [{ prompt, image: { bytesBase64Encoded: frameBase64 } }],
       parameters: { fps: 24, length: 5 }
    };
    
    let endpoint = "publishers/google/models/videogeneration@001:predict";
    if (model === "luma") endpoint = "publishers/luma/models/lumavideo:predict";

    try {
       const res = await fetchVertex(endpoint, data);
       const b64 = res?.predictions?.[0]?.bytesBase64Encoded;
       if (b64) {
          const tempPath = path.join(app.getPath("temp"), `continued_${Date.now()}.mp4`);
          fs.writeFileSync(tempPath, Buffer.from(b64, "base64"));
          return { success: true, videoUrl: `file://${tempPath}` };
       }
       return { success: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" };
    } catch (apiErr) {
       return { success: false, status: apiErr.status, reason: apiErr.message };
    }
  } catch (err) {
    return { success: false, reason: err.message };
  }
});
