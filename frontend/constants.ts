
const explicitBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();
const apiDomain = import.meta.env.NEXT_PUBLIC_API_DOMAIN?.trim();

const inferProtocol = (value: string) => {
  if (value.startsWith("localhost") || value.startsWith("127.0.0.1")) {
    return "http";
  }
  return "https";
};

export const API_BASE_URL = explicitBaseURL
  ? explicitBaseURL
  : apiDomain
    ? `${inferProtocol(apiDomain)}://${apiDomain}`
    : "http://localhost:8080";
