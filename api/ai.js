/* Formula Vault — AI proxy (Vercel serverless)
   Provider API keys live in environment variables ONLY (never in the client bundle).
   The client POSTs OpenAI-style messages; this proxy streams the chosen provider's
   tokens back as newline-delimited JSON:
     {"delta":"..."} ... {"done":true}
   Errors: {"error":{"code":"AI_NO_KEY"|"AI_BAD_KEY"|..., "message":..., "provider":...}}
*/
export const config = { runtime: 'nodejs', maxDuration: 60 };

const MODELS = {
  groq: ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'],
  google: ['gemini-3.5-flash-lite', 'gemini-2.5-flash'],
  openrouter: ['deepseek/deepseek-chat-v3.1', 'meta-llama/llama-4-maverick']
};
const K = {
  groq: (process.env.GROQ_API_KEY || '').trim(),
  google: (process.env.GOOGLE_API_KEY || '').trim(),
  openrouter: (process.env.OPENROUTER_API_KEY || '').trim()
};
const ORDER = ['groq', 'openrouter', 'google'];
const LABEL = { groq: 'Groq', google: 'Google', openrouter: 'OpenRouter' };

function configured() { return ORDER.filter(p => K[p]); }

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  if (req.method !== 'POST') { writeErr(res, 'BAD_REQUEST', 'Use POST.'); return res.end(); }

  let body;
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) body = req.body;
    else if (Buffer.isBuffer(req.body)) body = JSON.parse(req.body.toString('utf8'));
    else body = JSON.parse(req.body || '{}');
  } catch (e) { writeErr(res, 'BAD_REQUEST', 'Invalid JSON body.'); return res.end(); }

  const messages = Array.isArray(body.messages)
    ? body.messages.filter(m => m && typeof m.content === 'string').slice(-16)
    : [];
  if (!messages.length) { writeErr(res, 'BAD_REQUEST', 'No messages provided.'); return res.end(); }
  const maxTokens = Math.min(Math.max(+(body.maxTokens || 1800) || 1800, 8), 4096);
  const provider = String(body.provider || 'auto');

  const sys = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const rest = messages.filter(m => m.role !== 'system');

  const order = provider === 'auto' ? configured() : (K[provider] ? [provider] : []);
  if (!order.length) { writeErr(res, 'AI_NO_KEY', 'No AI provider is configured on the server yet.'); return res.end(); }

  const aborted = new AbortController();
  req.on('close', () => { try { aborted.abort(); } catch (e) {} });

  let streamed = false;
  let lastErrors = [];

  for (const p of order) {
    let triedOne = false;
    for (const model of MODELS[p]) {
      triedOne = true;
      try {
        const got = await streamFor(p, model, sys, rest, maxTokens, aborted.signal, piece => {
          streamed = true;
          res.write(JSON.stringify({ delta: piece }) + '\n');
        });
        if (got) { res.write(JSON.stringify({ done: true }) + '\n'); return res.end(); }
      } catch (e) {
        if (e && e.name === 'AbortError') return res.end();
        const msg = (e && e.message) || String(e);
        const code = e && e.code;
        if (streamed) { writeErr(res, 'STREAM_FAIL', msg); return res.end(); }
        if (code === 'AI_BAD_KEY' || code === 'AI_EMPTY') {
          lastErrors.push(code + ': ' + msg);
          if (code === 'AI_BAD_KEY') break; // don't waste the next model of the same provider
        } else {
          lastErrors.push(msg);
        }
      }
    }
    if (triedOne && streamed) break;
  }

  const lastBad = lastErrors[lastErrors.length - 1] || 'No response';
  if (lastErrors.some(e => e.indexOf('AI_BAD_KEY') === 0)) {
    writeErr(res, 'AI_BAD_KEY', 'The site\'s API key was rejected. Check Vercel env vars.', order[order.length - 1]);
  } else {
    writeErr(res, 'ALL_FAILED', lastBad);
  }
  return res.end();
}

function writeErr(res, code, message, provider) {
  try { res.write(JSON.stringify({ error: { code, message, provider } }) + '\n'); } catch (e) {}
}

async function providerJsonError(res) {
  let em = '';
  try { const j = await res.json(); em = (j.error && (j.error.message || j.error.msg)) || ''; } catch (e) {}
  return em;
}

async function streamFor(p, model, sys, rest, maxTokens, signal, onDelta) {
  let url, init;

  if (p === 'groq' || p === 'openrouter') {
    url = p === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + K[p] };
    if (p === 'openrouter') { headers['HTTP-Referer'] = 'https://formulav.vercel.app'; headers['X-Title'] = 'Formula Vault'; }
    const msgs = sys ? [{ role: 'system', content: sys }].concat(rest) : rest;
    init = {
      method: 'POST', headers,
      body: JSON.stringify({ model, messages: msgs, stream: true, temperature: 0.55, max_tokens: maxTokens })
    };
  } else {
    url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model +
      ':streamGenerateContent?alt=sse&key=' + encodeURIComponent(K[p]);
    const contents = rest.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const c = { contents, generationConfig: { temperature: 0.55, maxOutputTokens: maxTokens } };
    if (sys) c.systemInstruction = { parts: [{ text: sys }] };
    init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) };
  }

  let up;
  try {
    up = await fetch(url, { ...init, signal });
  } catch (e) {
    const err = new Error(LABEL[p] + ' unreachable.');
    throw err;
  }

  if (!up.ok) {
    const em = await providerJsonError(up);
    if (up.status === 401 || up.status === 403) {
      const err = new Error(LABEL[p] + ' rejected the API key (' + up.status + '). ' + em).trim();
      err.code = 'AI_BAD_KEY';
      throw err;
    }
    const err = new Error(LABEL[p] + ' ' + up.status + (em ? ': ' + em : ''));
    throw err;
  }

  const reader = up.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let got = false;

  while (true) {
    const r = await reader.read();
    if (r.done) break;
    buf += dec.decode(r.value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
      if (!line || line.indexOf('data:') !== 0) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') { const had = got; return had; }
      let j;
      try { j = JSON.parse(payload); } catch (e) { continue; }
      let piece = '';
      if (p === 'google') {
        const cnd = j.candidates && j.candidates[0];
        if (cnd && cnd.content && cnd.content.parts) piece = cnd.content.parts.filter(pt => pt.text && !pt.thought).map(pt => pt.text).join('');
      } else {
        const d = j.choices && j.choices[0] && (j.choices[0].delta || j.choices[0].message);
        if (d && d.content) piece = d.content;
      }
      if (piece) { got = true; onDelta(piece); }
    }
  }
  if (!got) {
    const err = new Error(LABEL[p] + ' returned no text.');
    err.code = 'AI_EMPTY';
    throw err;
  }
  return got;
}