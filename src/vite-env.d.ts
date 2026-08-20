/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT?: string;
  readonly VITE_ADSENSE_SLOT_INTRO?: string;
  readonly VITE_ADSENSE_SLOT_END?: string;
}
