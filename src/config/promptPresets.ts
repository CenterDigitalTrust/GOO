export const STYLE_PRESETS = [
  { id: "cinematic", label_uk: "Кінематографічний", label_en: "Cinematic", label_ru: "Кинематографичный", label_es: "Cinemático", promptFragment: "Cinematic composition, anamorphic lens flare, shallow depth of field, film-grade color grading" },
  { id: "macro", label_uk: "Макро", label_en: "Macro", label_ru: "Макро", label_es: "Macro", promptFragment: "Extreme macro shot, high magnification, visible micro-texture and fine detail, shallow focal plane" },
  { id: "3d", label_uk: "3D", label_en: "3D", label_ru: "3D", label_es: "3D", promptFragment: "3D rendered, CGI, physically-based rendering, studio-quality ray-traced lighting" },
  { id: "minimalism", label_uk: "Мінімалізм", label_en: "Minimalism", label_ru: "Минимализм", label_es: "Minimalismo", promptFragment: "Minimalist composition, negative space, single subject focus, clean uncluttered background" },
  { id: "cyberpunk", label_uk: "Кіберпанк", label_en: "Cyberpunk", label_ru: "Киберпанк", label_es: "Ciberpunk", promptFragment: "Cyberpunk aesthetic, neon accent lighting, futuristic urban environment, high contrast night scene" }
];

export const LIGHTING_PRESETS = [
  { id: "studio", label_uk: "Студійне", label_en: "Studio", label_ru: "Студийное", label_es: "Estudio", promptFragment: "Studio lighting setup, softbox key light, controlled even illumination, no harsh shadows" },
  { id: "neon", label_uk: "Неонове", label_en: "Neon", label_ru: "Неоновое", label_es: "Neón", promptFragment: "Neon lighting, saturated colored glow, reflective surfaces, moody atmosphere" },
  { id: "natural", label_uk: "Природне", label_en: "Natural", label_ru: "Естественное", label_es: "Natural", promptFragment: "Natural daylight, soft ambient light, realistic color temperature, gentle diffused shadows" },
  { id: "dramatic", label_uk: "Драматичне", label_en: "Dramatic", label_ru: "Драматичное", label_es: "Dramático", promptFragment: "Dramatic chiaroscuro lighting, strong directional light source, deep shadows, high contrast" }
];

export const ANGLE_PRESETS = [
  { id: "closeup", label_uk: "Крупний план", label_en: "Close-up", label_ru: "Крупный план", label_es: "Primer plano", promptFragment: "Close-up shot, subject fills the frame, sharp focus on primary detail" },
  { id: "wideangle", label_uk: "Широкий кут", label_en: "Wide-angle", label_ru: "Широкий угол", label_es: "Gran angular", promptFragment: "Wide-angle shot, full scene and environment visible, expansive framing" },
  { id: "topdown", label_uk: "Зверху", label_en: "Top-down", label_ru: "Сверху", label_es: "Desde arriba", promptFragment: "Top-down overhead angle, bird's-eye view, flat lay composition" },
  { id: "lowangle", label_uk: "Знизу", label_en: "Low-angle", label_ru: "Снизу", label_es: "Desde abajo", promptFragment: "Low-angle shot, camera positioned below subject looking upward, emphasizes scale" }
];

export const MODEL_PRESETS = [
  { id: "imagen3_fast", label_uk: "Imagen 3 (Швидко)", label_en: "Imagen 3 (Fast)", label_ru: "Imagen 3 (Fast)", label_es: "Imagen 3 (Fast)" },
  { id: "imagen3_hq", label_uk: "Imagen 3 (High Quality)", label_en: "Imagen 3 (High Quality)", label_ru: "Imagen 3 (High Quality)", label_es: "Imagen 3 (High Quality)" },
  { id: "vertex_veo", label_uk: "Vertex Video (Veo)", label_en: "Vertex Video (Veo)", label_ru: "Vertex Video (Veo)", label_es: "Vertex Video (Veo)" },
  { id: "luma", label_uk: "Luma (Vertex)", label_en: "Luma (Vertex)", label_ru: "Luma (Vertex)", label_es: "Luma (Vertex)" }
];

export const CATEGORY_PRESETS = [
  { id: "ecommerce", label_uk: "Е-комерція", label_en: "E-commerce", label_ru: "E-commerce", label_es: "E-commerce", promptFragment: "Hyper-realistic commercial product photography. Object perfectly centered on a pure white studio background. Deep textures, natural color. Ultra-sharp focus, 8k resolution, premium catalog aesthetic" },
  { id: "lifestyle", label_uk: "Лайфстайл", label_en: "Lifestyle", label_ru: "Лайфстайл", label_es: "Lifestyle", promptFragment: "Lifestyle photography, natural candid moment, warm authentic tones, real-world environment, subject interacting naturally with product/scene" },
  { id: "aerial", label_uk: "Аерозйомка", label_en: "Aerial Shot", label_ru: "Аэрофотосъемка", label_es: "Aerial Shot", promptFragment: "Aerial drone shot, high altitude perspective, wide landscape or cityscape coverage, smooth implied camera motion" }
];

export const FORMAT_PRESETS = [
  { id: "square", label_uk: "1:1 Квадрат", label_en: "1:1 Square", label_ru: "1:1 Квадрат", label_es: "1:1 Cuadrado", aspectRatio: "1:1" },
  { id: "pinterest", label_uk: "Pinterest", label_en: "Pinterest", label_ru: "Pinterest", label_es: "Pinterest", aspectRatio: "2:3" },
  { id: "youtube", label_uk: "YouTube", label_en: "YouTube", label_ru: "YouTube", label_es: "YouTube", aspectRatio: "16:9" },
  { id: "tiktok", label_uk: "TikTok/Instagram", label_en: "TikTok/Instagram", label_ru: "TikTok/Instagram", label_es: "TikTok/Instagram", aspectRatio: "9:16" }
];
