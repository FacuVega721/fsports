/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: string;
  readonly VITE_FOOTBALL_DATA_TOKEN?: string;
  readonly VITE_FOOTBALL_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
