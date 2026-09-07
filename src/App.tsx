import { useState, useMemo, useEffect, useRef } from "react";
import { Copy, Settings, Image as ImageIcon, Video, Star, Download, Play, X, RefreshCw, Edit, Plus, History, LayoutTemplate, HelpCircle, MessageSquare, Zap } from "lucide-react";
import { STYLE_PRESETS, LIGHTING_PRESETS, ANGLE_PRESETS, MODEL_PRESETS, CATEGORY_PRESETS, FORMAT_PRESETS } from "./config/promptPresets";

const TRANSLATIONS: Record<string, any> = {
  uk: {
    createVideoBtn: "+ Створити відео",
    templates: "Шаблони", media: "Медіа", history: "Історія", settings: "Налаштування", help: "Допомога",
    balance: "Ваш баланс", tariff: "Тариф",
    style: "СТИЛЬ", lighting: "ОСВІТЛЕННЯ", angle: "РАКУРС",
    myPrompt: "МОЙ ЗАПРОС",
    boost: "BOOST",
    structurizerTitle: "Prompt Structurizer (Powered by Gemini)",
    directorPrompt: "GEMINI DIRECTOR'S PROMPT",
    copy: "КОПІЮВАТИ",
    generationImage: "ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ",
    generationVideo: "ГЕНЕРАЦІЯ ВІДЕО",
    clear: "Очистити",
    create: "Створити",
    remainingBoost: "ОСТАЛОСЬ BOOST",
    geminiAnalysisComplete: "Gemini analysis complete",
    readyToGenerate: "ready to generate",
    tryAgain: "Ще раз",
    edit: "Редактор",
    resultGen: "РЕЗУЛЬТАТ ГЕНЕРАЦІЇ",
    download: "Скачати",
    continueVideo: "Продовжити відео",
    continueCount: "Продовжень використано",
    errorVeo: "Доступ до Veo не підтверджено",
    switchToLuma: "Переключитись на Luma (Vertex)",
    lumaFallback: "Продовження через Luma (Veo недоступний)",
    waitingInput: "Очікування вводу...",
    myPromptPlaceholder: "Ваш запит..."
  },
  ru: {
    createVideoBtn: "+ Создать видео",
    templates: "Шаблоны", media: "Медиа", history: "История", settings: "Настройки", help: "Помощь",
    balance: "Ваш баланс", tariff: "Тариф",
    style: "СТИЛЬ", lighting: "ОСВЕЩЕНИЕ", angle: "РАКУРС",
    myPrompt: "МОЙ ЗАПРОС",
    boost: "BOOST",
    structurizerTitle: "Prompt Structurizer (Powered by Gemini)",
    directorPrompt: "GEMINI DIRECTOR'S PROMPT",
    copy: "КОПИРОВАТЬ",
    generationImage: "ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ",
    generationVideo: "ГЕНЕРАЦИЯ ВИДЕО",
    clear: "Очистить",
    create: "Сгенерировать",
    remainingBoost: "ОСТАЛОСЬ BOOST",
    geminiAnalysisComplete: "Gemini analysis complete",
    readyToGenerate: "готово к генерации",
    tryAgain: "Еще раз",
    edit: "Редактор",
    resultGen: "РЕЗУЛЬТАТ ГЕНЕРАЦИИ",
    download: "Скачать",
    continueVideo: "Продолжить видео",
    continueCount: "Продолжений использовано",
    errorVeo: "Доступ к Veo не подтверждён",
    switchToLuma: "Переключиться на Luma (Vertex)",
    lumaFallback: "Продолжение через Luma (Veo недоступен)",
    waitingInput: "Ожидание ввода...",
    myPromptPlaceholder: "Ваш запрос..."
  },
  en: {
    createVideoBtn: "+ Create Video",
    templates: "Templates", media: "Media", history: "History", settings: "Settings", help: "Help",
    balance: "Your Balance", tariff: "Tariff",
    style: "STYLE", lighting: "LIGHTING", angle: "ANGLE",
    myPrompt: "MY PROMPT",
    boost: "BOOST",
    structurizerTitle: "Prompt Structurizer (Powered by Gemini)",
    directorPrompt: "GEMINI DIRECTOR'S PROMPT",
    copy: "COPY",
    generationImage: "IMAGE GENERATION",
    generationVideo: "VIDEO GENERATION",
    clear: "Clear",
    create: "Create",
    remainingBoost: "REMAINING BOOST",
    geminiAnalysisComplete: "Gemini analysis complete",
    readyToGenerate: "ready to generate",
    tryAgain: "Try Again",
    edit: "Edit",
    resultGen: "GENERATION RESULT",
    download: "Download",
    continueVideo: "Continue Video",
    continueCount: "Continuations used",
    errorVeo: "Access to Veo unconfirmed",
    switchToLuma: "Switch to Luma (Vertex)",
    lumaFallback: "Continuing via Luma (Veo unavailable)",
    waitingInput: "Waiting for input...",
    myPromptPlaceholder: "Your prompt..."
  },
  es: {
    createVideoBtn: "+ Crear Video",
    templates: "Plantillas", media: "Medios", history: "Historial", settings: "Ajustes", help: "Ayuda",
    balance: "Su Saldo", tariff: "Tarifa",
    style: "ESTILO", lighting: "ILUMINACIÓN", angle: "ÁNGULO",
    myPrompt: "MI PROMPT",
    boost: "BOOST",
    structurizerTitle: "Prompt Structurizer (Powered by Gemini)",
    directorPrompt: "GEMINI DIRECTOR'S PROMPT",
    copy: "COPIAR",
    generationImage: "GENERACIÓN DE IMÁGENES",
    generationVideo: "GENERACIÓN DE VIDEO",
    clear: "Limpiar",
    create: "Generar",
    remainingBoost: "BOOST RESTANTE",
    geminiAnalysisComplete: "Análisis de Gemini completo",
    readyToGenerate: "listo para generar",
    tryAgain: "Intentar de nuevo",
    edit: "Editar",
    resultGen: "RESULTADO DE GENERACIÓN",
    download: "Descargar",
    continueVideo: "Continuar video",
    continueCount: "Continuaciones usadas",
    errorVeo: "Acceso a Veo no confirmado",
    switchToLuma: "Cambiar a Luma (Vertex)",
    lumaFallback: "Continuando vía Luma (Veo no disponible)",
    waitingInput: "Esperando entrada...",
    myPromptPlaceholder: "Su prompt..."
  }
};

const GOOGLE_BLUE = "#4285F4";
const GOOGLE_RED = "#EA4335";
const GOOGLE_YELLOW = "#FBBC05";
const GOOGLE_GREEN = "#34A853";

export default function App() {
  const [lang, setLang] = useState("ru");
  const t = TRANSLATIONS[lang];

  const [activeStyle, setActiveStyle] = useState("");
  const [activeLighting, setActiveLighting] = useState("");
  const [activeAngle, setActiveAngle] = useState("");
  
  const [rawPrompt, setRawPrompt] = useState("");
  const [structuredPrompt, setStructuredPrompt] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  
  const [activeModel, setActiveModel] = useState("imagen3_hq");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeFormat, setActiveFormat] = useState("square");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [lumaFallback, setLumaFallback] = useState(false);
  const [continuationCount, setContinuationCount] = useState(0);

  const [agentStatus, setAgentStatus] = useState("");
  const [agentMessage, setAgentMessage] = useState("");

  const isVideo = activeModel === "vertex_veo" || activeModel === "luma";

  // Build Final Prompt String
  const buildFinalPrompt = (base: string) => {
    const frags = [];
    if (activeStyle) frags.push(STYLE_PRESETS.find(x => x.id === activeStyle)?.promptFragment);
    if (activeLighting) frags.push(LIGHTING_PRESETS.find(x => x.id === activeLighting)?.promptFragment);
    if (activeAngle) frags.push(ANGLE_PRESETS.find(x => x.id === activeAngle)?.promptFragment);
    if (activeCategory) frags.push(CATEGORY_PRESETS.find(x => x.id === activeCategory)?.promptFragment);
    
    const context = frags.filter(Boolean).join(". ");
    return context ? `${context}. ${base}` : base;
  };

  useEffect(() => {
    setFinalPrompt(buildFinalPrompt(structuredPrompt || rawPrompt));
  }, [activeStyle, activeLighting, activeAngle, activeCategory, structuredPrompt, rawPrompt]);

  const handleBoost = async () => {
    if (!rawPrompt) return;
    setIsBoosting(true);
    setAgentStatus("Structuring prompt...");
    try {
      // @ts-ignore
      const res = await window.nudgeAPI?.boostFetch({ prompt: `Enhance the following prompt with richer sensory detail, camera movement description and lighting nuance while preserving original subject and intent exactly: ${rawPrompt}` });
      if (res?.success) {
        setStructuredPrompt(res.result.structured);
      }
    } catch (e) {
      console.error(e);
    }
    setIsBoosting(false);
    setAgentStatus("");
  };

  const handleAgentRun = async () => {
    if (!rawPrompt && !structuredPrompt && !finalPrompt) return;
    setIsGenerating(true);
    setIsBoosting(true);
    setAgentStatus("Agent is analyzing and generating...");
    setAgentMessage("");
    setErrorStatus(null);
    setLumaFallback(false);
    
    try {
      const p = finalPrompt || buildFinalPrompt(rawPrompt);
      const payload = {
        prompt: p,
        model: activeModel,
        format: FORMAT_PRESETS.find(x => x.id === activeFormat)?.aspectRatio || "1:1",
        type: isVideo ? "video" : "image"
      };

      // @ts-ignore
      const res = await window.nudgeAPI?.agentRun(payload);
      if (res?.success) {
        if (res.structuredPrompt) setStructuredPrompt(res.structuredPrompt);
        if (res.resultUrl) setResultUrl(res.resultUrl);
        if (res.agentText) setAgentMessage(res.agentText);
        setContinuationCount(0);
      } else {
        setErrorStatus(res?.reason || "Agent failed");
        if (res?.agentText) setAgentMessage(res.agentText);
      }
    } catch (e) {
      console.error(e);
      setErrorStatus("Internal Error");
    }
    
    setIsGenerating(false);
    setIsBoosting(false);
    setAgentStatus("");
  };

  const handleContinue = async () => {
    if (continuationCount >= 3) return;
    setIsGenerating(true);
    try {
      // @ts-ignore
      const res = await window.nudgeAPI?.videoContinue({
        prompt: `Continue seamlessly from the provided final frame. Maintain exact visual continuity: same subject, same lighting setup, same color grading and same camera style as the previous segment. New action: ${rawPrompt}`,
        model: activeModel === "vertex_veo" && lumaFallback ? "luma" : activeModel,
        videoUrl: resultUrl
      });
      if (res?.success) {
        setResultUrl(res.videoUrl);
        setContinuationCount(prev => prev + 1);
      } else if (res?.status === 403 && activeModel === "vertex_veo") {
        setLumaFallback(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const PresetPill = ({ item, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active 
          ? 'border-[#4285F4] text-[#4285F4] bg-[#4285F4]/10' 
          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {item[`label_${lang}`] || item.label_en}
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-[#F7F8FA] text-slate-800 font-sans overflow-x-auto overflow-y-hidden">
      
      {/* SIDEBAR */}
      <div className="w-[200px] h-full border-r border-slate-200 flex flex-col justify-between shrink-0 bg-[#F7F8FA]">
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-col items-center justify-center mb-6 gap-3">
            <img src="logo.png" alt="VD GOO" className="h-10 object-contain" />
            
            {/* LANGUAGE SELECTOR */}
            <div className="flex gap-1">
               {["en", "es", "ru", "uk"].map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-[#4285F4] text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                     {l}
                  </button>
               ))}
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 text-[#4285F4] font-bold border border-slate-200 bg-white rounded-xl py-3 shadow-sm hover:shadow-md transition-shadow">
            <Star size={16}/> {t.createVideoBtn}
          </button>
          
          <div className="flex flex-col gap-1 mt-4 text-sm font-medium text-slate-600">
            <button className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-[#4285F4] shadow-sm"><Video size={16}/> {t.videoGenNav}</button>
            <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"><ImageIcon size={16}/> {t.imageGenNav}</button>
            <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"><MessageSquare size={16}/> {t.myProjects}</button>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">{t.tariff} <span className="font-bold text-slate-700">GOO Pro</span> ✨</div>
        </div>
      </div>

      {/* MIDDLE: Structurizer */}
      <div className="w-[380px] h-full border-r border-slate-200 flex flex-col p-6 overflow-y-auto bg-white shrink-0">
        <div className="flex justify-between items-center mb-6">
           <h2 className="font-bold text-lg text-slate-700">{t.structurizerTitle}</h2>
           <Settings size={18} className="text-slate-400 cursor-pointer hover:text-slate-600"/>
        </div>
        <div className="flex flex-col gap-6">
           <div>
            <div className="text-xs font-bold text-slate-700 mb-3">{t.style}</div>
            <div className="flex flex-wrap gap-2">
               {STYLE_PRESETS.map(p => <PresetPill key={p.id} item={p} active={activeStyle === p.id} onClick={() => setActiveStyle(p.id === activeStyle ? "" : p.id)} />)}
            </div>
           </div>

           <div>
            <div className="text-xs font-bold text-slate-700 mb-3">{t.lighting}</div>
            <div className="flex flex-wrap gap-2">
               {LIGHTING_PRESETS.map(p => <PresetPill key={p.id} item={p} active={activeLighting === p.id} onClick={() => setActiveLighting(p.id === activeLighting ? "" : p.id)} />)}
            </div>
           </div>

           <div>
            <div className="text-xs font-bold text-slate-700 mb-3">{t.angle}</div>
            <div className="flex flex-wrap gap-2">
               {ANGLE_PRESETS.map(p => <PresetPill key={p.id} item={p} active={activeAngle === p.id} onClick={() => setActiveAngle(p.id === activeAngle ? "" : p.id)} />)}
            </div>
           </div>
        </div>
        
        <div className="mt-8 flex-1 flex flex-col">
          <div className="flex flex-col flex-1">
            <div className="text-xs font-bold text-[#4285F4] mb-3 uppercase">{t.myPrompt}</div>
            <textarea 
              value={rawPrompt}
              onChange={e => setRawPrompt(e.target.value)}
              placeholder={t.waitingInput}
              className="w-full h-[120px] bg-[#F7F8FA] border border-slate-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#4285F4] transition-colors"
            />
            <button 
              onClick={handleBoost}
              disabled={isBoosting}
              className="mt-4 w-full bg-[#4285F4] hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Zap size={16}/> {isBoosting ? "..." : "BOOST"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Output & Setup */}
      <div className="flex-1 min-w-[600px] h-full flex flex-col bg-[#F7F8FA] overflow-y-auto p-6 relative">
         {/* TOP PREVIEW */}
         <div className="flex flex-row gap-6 mb-6">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col relative shadow-sm min-h-[250px]">
               <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                  {t.directorPrompt}
               </div>
               <textarea 
                 value={structuredPrompt}
                 onChange={e => setStructuredPrompt(e.target.value)}
                 placeholder={t.waitingInput}
                 className="flex-1 w-full bg-transparent resize-none text-sm text-slate-700 outline-none focus:border-[#4285F4] border border-transparent rounded p-2 transition-colors min-h-[100px]"
               />
               <button onClick={handleBoost} disabled={isBoosting} className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#4285F4] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                  <Star size={14}/> CREATE PROMPT
               </button>
            </div>
            
            <div className="w-[450px] aspect-video bg-white rounded-2xl border-4 p-1 shadow-md shrink-0 flex flex-col relative"
                 style={{ borderImage: "linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853) 1" }}>
               <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-slate-200 border-t-[#4285F4] rounded-full animate-spin"></div>
                       <div className="animate-pulse text-[#4285F4] font-bold text-sm">Generating in Vertex AI...</div>
                    </div>
                  ) : resultUrl ? (
                    isVideo ? <video src={resultUrl} controls className="w-full h-full object-cover"/> : <img src={resultUrl} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="text-slate-400">{t.resultGen}</div>
                  )}
               </div>
               {resultUrl && (
                 <button className="absolute -bottom-4 right-4 flex items-center gap-2 bg-[#34A853] text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg hover:bg-green-600 transition-colors z-10">
                    <Download size={16}/> {t.download}
                 </button>
               )}
            </div>
         </div>

         {/* BOTTOM CONTROLS */}
         <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between">
               <div className="text-xs font-bold text-slate-700 uppercase">{isVideo ? t.generationVideo : t.generationImage}</div>
               <button onClick={() => { setRawPrompt(""); setStructuredPrompt(""); setFinalPrompt(""); setAgentMessage(""); }} className="bg-[#EA4335] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-600 transition-colors shadow-sm">
                  <X size={14}/> {t.clear}
               </button>
            </div>
            
            <textarea 
               value={finalPrompt}
               onChange={e => setFinalPrompt(e.target.value)}
               placeholder={t.waitingInput}
               className="w-full text-sm text-slate-600 p-4 bg-[#F7F8FA] rounded-xl border border-slate-200 min-h-[60px] resize-y focus:outline-none focus:border-[#4285F4] transition-colors"
            />

            {agentStatus && (
               <div className="flex items-center gap-2 text-sm text-[#4285F4] font-bold">
                 <div className="w-4 h-4 border-2 border-slate-200 border-t-[#4285F4] rounded-full animate-spin"></div>
                 {agentStatus}
               </div>
            )}
            
            {agentMessage && (
               <div className="text-sm p-4 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 rounded-xl font-medium">
                 {agentMessage}
               </div>
            )}
            
            <div className="flex flex-wrap gap-4 items-center justify-between">
               <div className="flex flex-wrap gap-2">
                  {MODEL_PRESETS.map(p => (
                    <button key={p.id} onClick={() => setActiveModel(p.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeModel === p.id ? 'bg-[#4285F4] text-white border-[#4285F4]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {(p as any)[`label_${lang}`] || p.label_en}
                    </button>
                  ))}
               </div>
               <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESETS.map(p => <PresetPill key={p.id} item={p} active={activeCategory === p.id} onClick={() => setActiveCategory(p.id === activeCategory ? "" : p.id)} />)}
               </div>
            </div>
            
            {errorStatus && (
               <div className="bg-[#EA4335]/10 text-[#EA4335] text-sm p-3 rounded-lg border border-[#EA4335]/20 flex justify-between items-center flex-wrap gap-2">
                  <span>{errorStatus}</span>
                  {activeModel === "vertex_veo" && (
                    <button onClick={() => { setActiveModel("luma"); setErrorStatus(null); }} className="px-3 py-1 bg-white text-[#EA4335] font-bold rounded-lg border border-[#EA4335]/30 hover:bg-red-50 text-xs">
                       {t.switchToLuma}
                    </button>
                  )}
               </div>
            )}
            
            {lumaFallback && (
               <div className="bg-[#FBBC05]/10 text-[#FBBC05] text-sm p-3 rounded-lg border border-[#FBBC05]/20 font-medium">
                  {t.lumaFallback}
               </div>
            )}

            <div className="flex flex-row justify-between items-end mt-4 gap-4">
               <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                     <div className="text-[10px] font-bold text-slate-400 uppercase">{t.remainingBoost}</div>
                     <div className="flex gap-1">
                        <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-xs">VD</div>
                        <div className="w-10 h-6 bg-[#4285F4]/10 rounded flex items-center justify-center text-xs text-[#4285F4] font-bold">GOO</div>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-row items-center gap-3">
                  <div className="text-xs text-[#34A853] font-medium mr-4 flex items-center gap-2">
                     <div className="w-4 h-4 rounded-full bg-[#34A853]/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#34A853]"></div></div>
                     {t.geminiAnalysisComplete}<br/><span className="text-slate-500">{activeModel} {t.readyToGenerate}</span>
                  </div>
                  
                  <button onClick={handleAgentRun} disabled={isGenerating} className="bg-[#4285F4] hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 justify-center">
                     <Star size={16}/> {isGenerating ? "..." : t.create}
                  </button>
                  
                  {resultUrl && (
                     <>
                        <button onClick={handleAgentRun} disabled={isGenerating} className="bg-[#34A853] hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all justify-center">
                           <RefreshCw size={16}/> {t.tryAgain}
                        </button>
                        <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all justify-center">
                           <Edit size={16}/> {t.edit}
                        </button>
                     </>
                  )}
                  
                  {/* Continue Video Button is ALWAYS visible now, but disabled if not a video or generated */}
                  <div className="flex flex-col items-center">
                     <button onClick={handleContinue} disabled={!resultUrl || !isVideo || isGenerating || continuationCount >= 3} className="bg-[#34A853] hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:bg-slate-300">
                        <Play size={16}/> {t.continueVideo}
                     </button>
                     {resultUrl && isVideo && <span className="text-[10px] text-slate-500 mt-1">{t.continueCount}: {continuationCount}/3</span>}
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
               {FORMAT_PRESETS.map(f => (
                 <button key={f.id} onClick={() => setActiveFormat(f.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${activeFormat === f.id ? 'border-[#4285F4] text-[#4285F4] bg-[#4285F4]/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                   {(f as any)[`label_${lang}`] || f.label_en}
                 </button>
               ))}
            </div>
         </div>
         
      </div>
    </div>
  );
}
