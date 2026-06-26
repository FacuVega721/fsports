/**
 * Cliente mínimo de Claude API para generar informes de scouting.
 * Aislado a propósito (no se importa todavía desde ningún endpoint).
 */
import { buildSystemPrompt, buildUserPrompt, CLAUDE_REPORT_PARAMS, type PlayerPromptInput } from './prompt';

export interface ClaudeEnv {
  ANTHROPIC_API_KEY: string;
}

interface AnthropicResponse {
  content: { type: string; text?: string }[];
}

export async function generateScoutingReport(
  env: ClaudeEnv,
  input: PlayerPromptInput,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      ...CLAUDE_REPORT_PARAMS,
      system: buildSystemPrompt(input.locale),
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Claude API error ${res.status}: ${detalle}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const texto = data.content.find((b) => b.type === 'text')?.text;
  if (!texto) throw new Error('Claude API: respuesta sin texto');
  return texto;
}
