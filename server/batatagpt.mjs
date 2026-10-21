import { isIP } from 'node:net';
import { randomUUID } from 'node:crypto';

const MAX_BODY_BYTES = 96 * 1024;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 8000;
const MAX_TOTAL_CHARS = 60000;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const UPSTREAM_TIMEOUT_MS = 55000;
const SYSTEM_PROMPT = 'Você é BatataGPT, o assistente do BatataHub. Seja útil, claro e amigável. Responda em português brasileiro, a menos que a pessoa peça outro idioma. Ajude com escrita, estudo, programação e ideias. Admita incertezas. Não invente acesso à internet, arquivos, ferramentas, ações ou limites de uso que você não conhece. Você usa uma base de modelo aberta executada pela Groq; o site e a API são do BatataGPT. Não afirme ter sido treinado do zero para este projeto. Formate respostas em Markdown: use títulos quando ajudarem, negrito, listas e tabelas bem formadas; coloque código em blocos cercados por crases com a linguagem. Responda somente com a resposta útil ao usuário, sem expor raciocínio interno.';
const BASE_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

function failure(status, message, headers = {}) {
  return Response.json({ error: { message } }, {
    status,
    headers: { ...BASE_HEADERS, ...headers },
  });
}

function configuration(env = {}) {
  if (typeof env.GROQ_API_KEY !== 'string' || !env.GROQ_API_KEY.trim()) return null;
  const model = env.GROQ_MODEL || DEFAULT_MODEL;
  if (typeof model !== 'string' || !model.trim() || model.length > 200) return null;
  return { key: env.GROQ_API_KEY.trim(), model: model.trim() };
}

export function handleHealth(request, env = {}) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return failure(405, 'Use GET para consultar o serviço.', { Allow: 'GET, HEAD' });
  }
  const response = Response.json({ configured: !!configuration(env), mode: 'online', provider: 'groq', model: 'batatagpt' }, { headers: BASE_HEADERS });
  return request.method === 'HEAD' ? new Response(null, response) : response;
}

// This guard is deliberately best-effort: each warm Vercel instance has its
// own counters, which reset on scaling/redeployment. It is not a global quota.
// For a strict public budget, add persistent rate limiting or Vercel Firewall.
export function createRateLimiter({ now = Date.now, perMinute = 6, perHour = 60, concurrentPerIp = 2, concurrentTotal = 12, maxEntries = 2000 } = {}) {
  const clients = new Map();
  let active = 0;
  return {
    acquire(ip) {
      const time = now();
      for (const [key, entry] of clients) {
        if (!entry.active && time - entry.hourStart >= 3600000) clients.delete(key);
      }
      let entry = clients.get(ip);
      if (!entry) {
        if (clients.size >= maxEntries) return { retryAfter: 60 };
        entry = { minuteStart: time, hourStart: time, minuteCount: 0, hourCount: 0, active: 0 };
        clients.set(ip, entry);
      }
      if (time - entry.minuteStart >= 60000) {
        entry.minuteStart = time;
        entry.minuteCount = 0;
      }
      if (time - entry.hourStart >= 3600000) {
        entry.hourStart = time;
        entry.hourCount = 0;
      }
      if (entry.active >= concurrentPerIp || active >= concurrentTotal) return { retryAfter: 10 };
      if (entry.minuteCount >= perMinute) return { retryAfter: Math.max(1, Math.ceil((entry.minuteStart + 60000 - time) / 1000)) };
      if (entry.hourCount >= perHour) return { retryAfter: Math.max(1, Math.ceil((entry.hourStart + 3600000 - time) / 1000)) };
      entry.minuteCount++;
      entry.hourCount++;
      entry.active++;
      active++;
      let released = false;
      return {
        release() {
          if (released) return;
          released = true;
          entry.active--;
          active--;
        },
      };
    },
  };
}

const rateLimiter = createRateLimiter();

function clientIp(request, env) {
  // Vercel overwrites this platform header to prevent client IP spoofing.
  // Outside Vercel, ignore proxy headers and share a local development bucket.
  if (env.VERCEL !== '1') return 'local';
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim();
  return ip && isIP(ip) ? ip : 'unknown';
}

async function readBody(request) {
  const length = request.headers.get('Content-Length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    throw Object.assign(new Error(), { status: 413 });
  }
  if (!request.body) throw new Error();
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw Object.assign(new Error(), { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

function validMessages(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) return false;
  let total = 0;
  for (let i = 0; i < body.messages.length; i++) {
    const message = body.messages[i];
    if (!message || message.role !== (i % 2 === 0 ? 'user' : 'assistant')) return false;
    if (typeof message.content !== 'string' || !message.content.trim() || message.content.length > MAX_MESSAGE_CHARS) return false;
    total += message.content.length;
  }
  return total <= MAX_TOTAL_CHARS && body.messages.at(-1).role === 'user';
}

function safeRetryAfter(value) {
  return /^\d+$/.test(value || '') && Number(value) >= 1 && Number(value) <= 3600 ? value : null;
}

// Keep only public answer deltas. Never relay upstream errors, credentials,
// reasoning fields, provider metadata, or arbitrary SSE events to the browser.
// An async generator advances only on pull, preserving downstream backpressure.
function normalizedStream(body, abort, cleanup) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const reader = body.getReader();
  const id = 'chatcmpl-' + randomUUID();
  const created = Math.floor(Date.now() / 1000);
  const encode = value => encoder.encode('data: ' + value + '\n\n');
  const chunk = (delta, finishReason = null) => JSON.stringify({
    id, object: 'chat.completion.chunk', created, model: 'batatagpt',
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  });
  let cancelled = false;
  let released = false;
  const closeReader = async () => {
    await reader.cancel().catch(() => {});
    if (!released) { released = true; reader.releaseLock(); }
  };
  const onAbort = () => { void reader.cancel().catch(() => {}); cleanup(); };
  abort.signal.addEventListener('abort', onAbort, { once: true });

  async function* events() {
    let pending = '';
    let finished = false;
    let finishReason = 'stop';
    try {
      yield encode(chunk({ role: 'assistant' }));
      while (!finished && !cancelled) {
        const { done, value } = await reader.read();
        if (abort.signal.aborted) throw new Error();
        pending += decoder.decode(value, { stream: !done });
        if (pending.length > 256 * 1024) throw new Error();
        let match;
        while ((match = /\r?\n\r?\n/.exec(pending))) {
          const event = pending.slice(0, match.index);
          pending = pending.slice(match.index + match[0].length);
          const data = event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
          if (!data) continue;
          if (data.trim() === '[DONE]') { finished = true; break; }
          const payload = JSON.parse(data);
          if (!payload || typeof payload !== 'object' || payload.error) throw new Error();
          if (['stop', 'length', 'content_filter', 'tool_calls', 'function_call'].includes(payload.choices?.[0]?.finish_reason)) finishReason = payload.choices[0].finish_reason;
          const content = payload.choices?.[0]?.delta?.content;
          if (typeof content === 'string' && content) yield encode(chunk({ content }));
        }
        if (done && !finished) throw new Error();
      }
      if (!cancelled) {
        yield encode(chunk({}, finishReason));
        yield encode('[DONE]');
      }
    } catch {
      if (!cancelled) yield encode(JSON.stringify({ error: { message: 'A resposta foi interrompida. Tente novamente.' } }));
    } finally {
      abort.signal.removeEventListener('abort', onAbort);
      cleanup();
      abort.abort();
      await closeReader();
    }
  }

  const iterator = events();
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },
    async cancel() {
      cancelled = true;
      cleanup();
      abort.abort();
      await closeReader();
      await iterator.return();
    },
  });
}

export async function handleChat(request, env = {}, dependencies = {}) {
  if (request.method !== 'POST') return failure(405, 'Use POST para conversar.', { Allow: 'POST' });
  // Use the platform's Web Request URL. Do not reconstruct an origin from
  // attacker-controlled Host or X-Forwarded-* request headers.
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return failure(403, 'Origem não autorizada.');
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return failure(415, 'Envie a mensagem em JSON.');
  }
  const config = configuration(env);
  if (!config) return failure(503, 'O BatataGPT está temporariamente indisponível. Tente novamente mais tarde.');
  let payload;
  try { payload = await readBody(request); }
  catch (error) {
    return failure(error.status === 413 ? 413 : 400, error.status === 413 ? 'A conversa excede o tamanho permitido.' : 'Mensagem inválida.');
  }
  if (!validMessages(payload)) return failure(400, 'Envie até 24 mensagens alternadas de usuário e assistente, terminando com usuário. Cada mensagem pode ter até 8.000 caracteres.');
  if (payload.stream !== undefined && payload.stream !== true) return failure(400, 'Esta conversa usa respostas em streaming.');
  if (request.signal.aborted) return failure(499, 'A conversa foi cancelada.');
  const permit = (dependencies.limiter || rateLimiter).acquire(clientIp(request, env));
  if (!permit.release) return failure(429, 'Muitas mensagens ao mesmo tempo. Aguarde um pouco e tente novamente.', { 'Retry-After': String(permit.retryAfter) });

  const abort = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; abort.abort(); permit.release(); }, dependencies.timeoutMs ?? UPSTREAM_TIMEOUT_MS);
  const onAbort = () => { abort.abort(); permit.release(); };
  request.signal.addEventListener('abort', onAbort, { once: true });
  if (request.signal.aborted) onAbort();
  const cleanup = () => {
    clearTimeout(timeout);
    request.signal.removeEventListener('abort', onAbort);
    permit.release();
  };
  try {
    const fetchUpstream = dependencies.fetch || globalThis.fetch.bind(globalThis);
    const response = await fetchUpstream(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', Authorization: 'Bearer ' + config.key },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...payload.messages.map(message => ({ role: message.role, content: message.content }))],
        stream: true,
        ...(/^openai\/gpt-oss-(20b|120b)$/.test(config.model) ? { max_completion_tokens: 2048, reasoning_effort: 'low', include_reasoning: false } : { max_tokens: 2048 }),
        temperature: 0.7,
      }),
      signal: abort.signal,
      redirect: 'manual',
    });
    if (abort.signal.aborted) {
      await response.body?.cancel().catch(() => {});
      throw new Error();
    }
    if (!response.ok || !response.body || !response.headers.get('Content-Type')?.toLowerCase().includes('text/event-stream')) {
      cleanup();
      abort.abort();
      await response.body?.cancel().catch(() => {});
      if (response.status === 429) {
        const retryAfter = safeRetryAfter(response.headers.get('Retry-After'));
        return failure(429, 'O limite de uso do BatataGPT foi atingido. Aguarde um pouco e tente novamente.', retryAfter ? { 'Retry-After': retryAfter } : {});
      }
      // Log status only; an upstream body or thrown exception can contain keys.
      (dependencies.log || console.error)('[BatataGPT] Provider response unavailable:', response.status);
      return failure(502, 'Não foi possível obter uma resposta do BatataGPT. Tente novamente mais tarde.');
    }
    return new Response(normalizedStream(response.body, abort, cleanup), {
      headers: { ...BASE_HEADERS, 'Content-Type': 'text/event-stream; charset=utf-8', 'X-Accel-Buffering': 'no' },
    });
  } catch {
    cleanup();
    abort.abort();
    if (request.signal.aborted) return failure(499, 'A conversa foi cancelada.');
    if (timedOut) return failure(504, 'O BatataGPT demorou para responder. Tente novamente.');
    (dependencies.log || console.error)('[BatataGPT] Provider connection unavailable.');
    return failure(502, 'Não foi possível conectar ao BatataGPT. Tente novamente mais tarde.');
  }
}
