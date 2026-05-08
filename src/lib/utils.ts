import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Eğer projeyi custom domaın'e deploy ettiysek (Firebase Hosting), API çağrıları için Cloud Run sunucu adresine git
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('run.app')) {
      return `https://karl-s-n-1001236491636.europe-west2.run.app${cleanPath}`;
    }
  }
  return cleanPath;
}

export function isDevOrPreview(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.includes('run.app');
  }
  return true;
}
