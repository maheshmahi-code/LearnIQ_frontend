/**
 * AI Service - Doubt solver with SSE streaming
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://learniq-backend-1.onrender.com/api';

export const streamDoubtSolver = async (payload, onChunk) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/doubt-solver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.error) throw new Error(data.error);
          if (data.chunk) onChunk(data.chunk);
        } catch (err) {
          if (err.message !== 'Unexpected end of JSON input') {
            throw err;
          }
        }
      }
    }
  }
};


