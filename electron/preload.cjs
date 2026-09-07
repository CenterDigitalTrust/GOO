const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nudgeAPI", {
  agentRun: (payload) => ipcRenderer.invoke("agent:run", payload),
  readClipboard: () => ipcRenderer.invoke("clipboard:read"),
  writeClipboard: (text) => ipcRenderer.invoke("clipboard:write", text),
  boostFetch: (payload) => ipcRenderer.invoke("boost:fetch", payload),
  imageGenerate: (payload) => ipcRenderer.invoke("image:generate", payload),
  videoGenerate: (payload) => ipcRenderer.invoke("video:generate", payload),
  videoContinue: (payload) => ipcRenderer.invoke("video:continue", payload),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  setOpacity: (opacity) => ipcRenderer.invoke("window:opacity", opacity),
  setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.invoke("window:alwaysOnTop", isAlwaysOnTop),
  selectDirectory: () => ipcRenderer.invoke("dialog:selectDirectory"),
  selectFile: (options) => ipcRenderer.invoke("dialog:selectFile", options),
  savePromptToFile: (payload) => ipcRenderer.invoke("file:savePrompt", payload),
  downloadImage: (payload) => ipcRenderer.invoke("file:downloadImage", payload),
  downloadMedia: (url, outputDir) => ipcRenderer.invoke("file:downloadMedia", url, outputDir),
  storeSecret: (key, value) => ipcRenderer.invoke("safe-storage:set", key, value),
  getSecret: (key) => ipcRenderer.invoke("safe-storage:get", key),
  onProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("generation:progress", handler);
    return () => ipcRenderer.removeListener("generation:progress", handler);
  },
});
