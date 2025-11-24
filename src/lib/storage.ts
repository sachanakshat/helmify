// Browser storage utilities for caching infrastructure generation results

const STORAGE_KEY = 'helmify_iac_generation';

export interface CachedGeneration {
  terraform: { files: Record<string, string> };
  helmCharts: Array<{ name: string; files: Record<string, string> }>;
  timestamp: string;
  cloud: string;
  region: string;
}

export function saveGenerationToCache(data: {
  terraform?: { files: Record<string, string> };
  helmCharts?: Array<{ name: string; files: Record<string, string> }>;
  cloud: string;
  region: string;
}): void {
  try {
    const cached: CachedGeneration = {
      terraform: data.terraform || { files: {} },
      helmCharts: data.helmCharts || [],
      timestamp: new Date().toISOString(),
      cloud: data.cloud,
      region: data.region,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

export function getGenerationFromCache(): CachedGeneration | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedGeneration;
  } catch (error) {
    console.warn('Failed to read from cache:', error);
    return null;
  }
}

export function clearGenerationCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

