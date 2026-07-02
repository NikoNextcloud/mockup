/**
 * Vercel Serverless Function — Gemini API proxy.
 * The API key lives ONLY here (Vercel env var GEMINI_API_KEY), never in the browser.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY_MISSING',
      message: 'Add GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables',
    });
  }

  try {
    const { model, ...body } = req.body || {};
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Missing "model" in request body' });
    }

    // Allow only the free-tier models this app uses
    const allowedModels = ['gemini-2.5-flash', 'gemini-2.5-flash-image'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: `Model not allowed: ${model}` });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'PROXY_ERROR', message: String(err?.message || err) });
  }
}
