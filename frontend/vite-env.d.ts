/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_DOMAIN: string
  readonly NEXT_PUBLIC_API_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
