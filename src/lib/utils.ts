import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeviceId(): string {
  let deviceId = localStorage.getItem('karlisin_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('karlisin_device_id', deviceId);
  }
  return deviceId;
}

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // We can just rely on the current origin. If it's on Firebase Hosting, 
  // firebase.json rewrites handle /api/* to the correct Cloud Run service.
  // We don't need to hardcode a stale cloud run URL.
  return cleanPath;
}

export function isDevOrPreview(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.includes('run.app');
  }
  return true;
}
