export interface AppConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

const KEY = 'movie-planner-config-v1';

export function loadConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    if (!parsed.token || !parsed.owner || !parsed.repo) return null;
    return {
      token: parsed.token,
      owner: parsed.owner,
      repo: parsed.repo,
      branch: parsed.branch || 'main',
    };
  } catch {
    return null;
  }
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem(KEY);
}
