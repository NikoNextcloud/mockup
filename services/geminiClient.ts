/**
 * Thin client for the /api/gemini Vercel proxy.
 * No API key in the browser — the serverless function injects it.
 */

export interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: any;
}

export const callGemini = async (
  model: string,
  parts: GeminiPart[],
  options?: { imageOutput?: boolean }
): Promise<GeminiPart[]> => {
  const body: Record<string, any> = {
    model,
    contents: [{ parts }],
  };
  if (options?.imageOutput) {
    body.generationConfig = { responseModalities: ['IMAGE'] };
  }

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data: GeminiResponse = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || (data as any)?.message || (data as any)?.error || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  const outParts = data.candidates?.[0]?.content?.parts;
  if (!outParts || outParts.length === 0) {
    throw new Error('Empty response from Gemini');
  }
  return outParts;
};

export const extractText = (parts: GeminiPart[]): string =>
  parts.map((p) => p.text || '').filter(Boolean).join('\n');

export const extractImageDataUrl = (parts: GeminiPart[]): string | null => {
  for (const p of parts) {
    if (p.inlineData?.data) {
      return `data:${p.inlineData.mimeType || 'image/png'};base64,${p.inlineData.data}`;
    }
  }
  return null;
};
