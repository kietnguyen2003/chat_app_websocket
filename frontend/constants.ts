
type EnvConfig = Partial<{
  VITE_API_BASE_URL: string;
  NEXT_PUBLIC_API_DOMAIN: string;
  VITE_API_DOMAIN: string;
}>;

const trimEnvValue = (value?: string) => value?.trim();

const inferProtocol = (value: string) => {
  if (value.startsWith('localhost') || value.startsWith('127.0.0.1')) {
    return 'http';
  }

  return 'https';
};

const normalizeBaseUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${inferProtocol(value)}://${value}`;
};

export const resolveApiBaseUrl = (env: EnvConfig) => {
  const explicitBaseUrl = trimEnvValue(env.VITE_API_BASE_URL);
  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl);
  }

  const nextPublicApiDomain = trimEnvValue(env.NEXT_PUBLIC_API_DOMAIN);
  if (nextPublicApiDomain) {
    return normalizeBaseUrl(nextPublicApiDomain);
  }

  const viteApiDomain = trimEnvValue(env.VITE_API_DOMAIN);
  if (viteApiDomain) {
    return normalizeBaseUrl(viteApiDomain);
  }

  return 'http://localhost:8080';
};

const runtimeEnv = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env
  : {};

export const API_BASE_URL = resolveApiBaseUrl(runtimeEnv);
