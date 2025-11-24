import { SecretInput } from '../types';

export function parseDotEnv(raw: string): Record<string, string> {
  return raw
    .split('\n')
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      if (line.startsWith('#')) return acc;
      const [key, ...rest] = line.split('=');
      if (!key) return acc;
      acc[key.trim()] = rest.join('=').trim();
      return acc;
    }, {});
}

export function hydrateSecrets(
  envBlocks: Array<{ name: string; raw: string }>
): SecretInput[] {
  return envBlocks.map((block) => ({
    name: block.name,
    values: parseDotEnv(block.raw)
  }));
}

