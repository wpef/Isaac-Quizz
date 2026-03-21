const TYPES = ['PICK_BEST', 'ICON_QUIZ', 'KNOWLEDGE'];
let typeIndex = 0;

export default async (req) => {
  const url = new URL(req.url);
  const diff = url.searchParams.get('diff') || 'normal';

  const type = TYPES[typeIndex % TYPES.length];
  typeIndex++;

  const difficultyPrompt = {
    normal: 'Use well-known items that most players would recognize.',
    hard: 'Include some less common items. Questions should require good game knowledge.',
    expert: 'Use obscure items, synergies, and transformations. Questions should challenge experts.',
  }[diff] || 'Use well-known items that most players would recognize.';

  const typePrompts = {
    PICK_BEST: `Generate a PICK_BEST question: the player must choose the best item among 3 choices for a given situation (e.g. "You're low on HP, which item helps most?").`,
    ICON_QUIZ: `Generate an ICON_QUIZ question: the player sees 3 item icons and must pick the one matching a given item name.`,
    KNOWLEDGE: `Generate a KNOWLEDGE question: ask a factual question about an item effect and give 3 item choices (e.g. "Which item gives spectral tears?").`,
  };

  const systemPrompt = `You are an expert on The Binding of Isaac: Repentance. Generate quiz questions about the game's items.
Rules:
- Items must use their REAL collectible IDs from the game (1-732).
- Each item must have a real name matching its real ID.
- Provide exactly 3 item choices.
- ${difficultyPrompt}
- Respond ONLY with valid JSON, no markdown, no extra text.

JSON format:
{
  "type": "${type}",
  "situation": "short flavor text describing the scenario",
  "hp": ${Math.floor(Math.random() * 6) + 1},
  "question": "the question text",
  "items": [
    {"id": <number>, "name": "<item name>"},
    {"id": <number>, "name": "<item name>"},
    {"id": <number>, "name": "<item name>"}
  ],
  "correct_id": <number>,
  "explanation": "short explanation of why this is correct"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `${typePrompts[type]}\n\nDifficulty: ${diff}`,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: 'Anthropic API error', details: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Invalid response format' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const question = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(question), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/question',
};
