export {};

declare global {
  interface Window {
    nudgeAPI: {
      readClipboard: () => Promise<string>;
      writeClipboard: (text: string) => Promise<{ success: boolean; reason?: string }>;
      fetchBoostProxy: (payload: {
        boostProxyUrl?: string;
        licenseKey?: string;
        customApiKey?: string;
        apiProvider?: string;
        prompt: string;
      }) => Promise<BoostProxyResponse>;
      generateImage: (payload: {
        prompt: string;
        tier: string;
        width?: number;
        height?: number;
        licenseKey?: string;
        customApiKey?: string;
        style?: string;
        lighting?: string;
        angle?: string;
        format?: string;
        referenceFile?: string;
      }) => Promise<ImageGenerationResponse>;
      generateVideo: (payload: {
        prompt: string;
        quality?: any;
        referenceFile?: string;
        referenceVideo?: string;
        vipMode?: string;
        vipFile?: string;
        licenseKey?: string;
        customApiKey?: string;
        style?: string;
        lighting?: string;
        angle?: string;
      }) => Promise<any>;
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      setOpacity: (opacity: number) => Promise<void>;
      setAlwaysOnTop: (isAlwaysOnTop: boolean) => Promise<void>;
      selectDirectory: () => Promise<string | null>;
      selectFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
      savePromptToFile: (payload: { directory: string; filename: string; content: string }) => Promise<{ success: boolean; path?: string; reason?: string }>;
      downloadImage: (payload: { url: string; directory: string; filename: string }) => Promise<{ success: boolean; path?: string; reason?: string }>;
      storeSecret: (key: string, value: string) => Promise<boolean>;
      getSecret: (key: string) => Promise<string>;
      onProgress?: (callback: (data: { status: string; percent: number; elapsed_seconds: number }) => void) => () => void;
    };
  }
}

export type ImageTier = "1" | "1.5" | "2";

export type BoostProxyResponse =
  | {
      success: true;
      used_this_month?: number;
      remaining?: number;
      result: {
        comment?: string;
        structured?: string;
        advanced?: string;
      };
    }
  | {
      success: false;
      reason: string;
      status?: number;
      message?: string;
    };

export type ImageGenerationResponse =
  | {
      success: true;
      tier: ImageTier;
      imageUrl: string;
    }
  | {
      success: false;
      reason: string;
      message?: string;
    };
