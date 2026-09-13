// Optional contextual explanation from the Netlify function. Silent fallback: null.
export async function fetchExplanation(question, choiceId, items) {
  if (typeof fetch !== 'function') return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const payload = {
      question: {
        type: question.type,
        prompt: question.prompt,
        situation: question.situation || null,
        hp: question.hp || null,
        correctId: question.correctId,
        choices: question.choices.map((c) => ({ id: c.id, label: c.label })),
        explanations: question.explanations,
      },
      choiceId,
      items: question.pedestals.map((id) => {
        const it = items.get(id);
        return it ? { id: it.id, name: it.name, quality: it.quality, description: it.description.slice(0, 700), stats: it.stats, tags: it.tags } : null;
      }).filter(Boolean),
    };
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.explanation === 'string' && data.explanation.trim() ? data.explanation.trim() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
