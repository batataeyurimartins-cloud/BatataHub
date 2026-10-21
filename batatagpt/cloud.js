export async function* cloudReply(messages, signal, request = fetch) {
  const response = await request('/api/batatagpt/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages }), signal
  });
  if (!response.ok) {
    let message = 'Não foi possível obter uma resposta da IA. Tente novamente.';
    try { const data = await response.json(); if (typeof data.error?.message === 'string') message = data.error.message; } catch {}
    throw new Error(message);
  }
  if (!response.body || !response.headers.get('Content-Type')?.includes('text/event-stream')) throw Error('A conexão com a IA retornou uma resposta inválida.');
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = '', finished = false;
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      if (pending.length > 262144) throw Error('A resposta excedeu o tamanho permitido.');
      let match;
      while ((match = /\r?\n\r?\n/.exec(pending))) {
        const event = pending.slice(0, match.index); pending = pending.slice(match.index + match[0].length);
        const data = event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data) continue;
        if (data.trim() === '[DONE]') { finished = true; break; }
        const payload = JSON.parse(data);
        if (payload.error) throw Error(payload.error.message || 'A resposta foi interrompida.');
        const content = payload.choices?.[0]?.delta?.content;
        if (typeof content === 'string') yield content;
      }
      if (done && !finished) throw Error('A conexão foi interrompida antes do fim da resposta.');
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export function contextFor(messages) {
  let recent = messages.slice(-20).map(({ role, content }) => ({ role, content: content.slice(0, 8000) }));
  if (recent[0]?.role === 'assistant') recent.shift();
  while (recent.length > 2 && recent.reduce((n, m) => n + m.content.length, 0) > 50000) recent.splice(0, 2);
  return recent;
}
