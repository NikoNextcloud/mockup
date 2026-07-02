/**
 * Runtime API key management (localStorage) — works on static hosting like GitHub Pages.
 * The user provides their own free Gemini API key from https://aistudio.google.com/apikey
 */

const STORAGE_KEY = 'gemini_api_key';

export const getStoredApiKey = (): string | null => {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim().length > 10 ? key.trim() : null;
  } catch {
    return null;
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable (private mode etc.) — ignore
  }
};

export const clearStoredApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const hasApiKey = (): boolean => !!getStoredApiKey();
