// Optional: contextual explanation of an answer through the Anthropic API.
// Only called when the player taps "Pourquoi ?". Without ANTHROPIC_API_KEY the function
// answers 503 and the app silently keeps its static explanations.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5';

const json = (status, body) => ({
  statusCode: status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { explanation: null, error: 'ANTHROPIC_API_KEY not configured' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'invalid JSON' });
  }
  const { question, choiceId, items } = payload;
  if (!question || !Array.isArray(items)) return json(400, { error: 'question and items required' });

  const chosen = question.choices?.find((c) => c.id === choiceId);
  const correct = question.choices?.find((c) => c.id === question.correctId);
  const client = new Anthropic();
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      output_config: { effort: 'low' },
      system:
        'Tu es un coach theorycraft pour The Binding of Isaac: Repentance. Réponds en français, ' +
        'en 2 ou 3 phrases maximum, concrètes et orientées gameplay (pourquoi ce choix, dans quelle ' +
        'situation l’autre option serait meilleure). Appuie-toi uniquement sur les données fournies ' +
        '(descriptions Platinum God, stats, tags). Pas de listes, pas de titres.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            question: question.prompt,
            type: question.type,
            situation: question.situation,
            hp: question.hp,
            player_choice: chosen?.label ?? String(choiceId),
            correct_answer: correct?.label ?? String(question.correctId),
            was_correct: choiceId === question.correctId,
            static_explanations: question.explanations,
            items,
          }),
        },
      ],
    });
    if (res.stop_reason === 'refusal') return json(200, { explanation: null });
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    return json(200, { explanation: text || null });
  } catch (err) {
    console.error('explain failed', err?.status, err?.message);
    return json(502, { explanation: null, error: 'upstream error' });
  }
};
