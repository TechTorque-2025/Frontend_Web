// src/config/runtime.ts
// Runtime configuration that can be overridden by Kubernetes

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      NEXT_PUBLIC_API_BASE_URL?: string;
    };
  }
}

export function getRuntimeConfig() {
  // In browser, use runtime config if available
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
    return window.__RUNTIME_CONFIG__;
  }
  
  // Fallback to build-time env vars (for development)
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  };
}

export const config = getRuntimeConfig();
