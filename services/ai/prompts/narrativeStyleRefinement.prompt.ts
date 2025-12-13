/**
 * @fileoverview Prompt de Refinamento Colaborativo de Estilo Narrativo
 *
 * Este módulo contém o prompt responsável por avaliar a descrição de estilo
 * narrativo fornecida pelo usuário e identificar elementos faltantes através
 * de perguntas interativas com opções.
 *
 * @module prompts/narrativeStyleRefinement
 *
 * @description
 * O prompt analisa a descrição inicial do usuário e verifica se contém
 * informações suficientes sobre os seguintes elementos narrativos:
 *
 * 1. **Cadência/Ritmo** - frases curtas vs prosa elaborada, nível de detalhe
 * 2. **Tom/Atmosfera** - sombrio, esperançoso, tenso, humorístico, etc.
 * 3. **Voz Narrativa (POV)** - primeira pessoa, terceira limitada, onisciente
 * 4. **Técnicas Literárias** - show don't tell, metáforas, foco sensorial
 *
 * O fluxo é colaborativo: a IA faz perguntas quando faltam informações
 * e gera opções relevantes baseadas no contexto fornecido.
 */

import { Language } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';

/**
 * Histórico de perguntas e respostas do refinamento de estilo.
 */
export interface NarrativeStyleHistoryItem {
	question: string;
	answer: string;
}

/**
 * Parâmetros para construir o prompt de refinamento de estilo narrativo.
 */
export interface NarrativeStyleRefinementParams {
	/** Descrição inicial do estilo narrativo fornecida pelo usuário */
	initialDescription: string;
	/** Histórico de perguntas e respostas de refinamento */
	history: NarrativeStyleHistoryItem[];
	/** Idioma para as perguntas */
	language: Language;
	/** Gênero do universo (opcional, para contextualizar opções) */
	genre?: string;
	/** Nome do universo (opcional, para contextualizar) */
	universeName?: string;
}

/**
 * Resposta da avaliação de estilo narrativo.
 */
export interface NarrativeStyleRefinementResponse {
	/** Se a descrição está completa o suficiente */
	isComplete: boolean;
	/** Próxima pergunta a fazer (se não estiver completo) */
	question?: string;
	/** Opções para a pergunta (4-6 opções relevantes) */
	options?: string[];
	/** Estilo final consolidado (quando completo) */
	finalStyle?: string;
}

/**
 * Constrói o prompt para avaliar e refinar o estilo narrativo.
 */
export function buildNarrativeStyleRefinementPrompt({
	initialDescription,
	history,
	language,
	genre,
	universeName,
}: NarrativeStyleRefinementParams): string {
	const langName = getLanguageName(language);

	const historyEntries = history
		.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
		.join('\n\n');
	const historySection = historyEntries ? `<history>\n${historyEntries}\n</history>` : '';

	const contextInfo = [
		genre ? `Genre: ${genre}` : null,
		universeName ? `Universe: ${universeName}` : null,
	]
		.filter(Boolean)
		.join(' | ');

	return `
<role>
You are a narrative style consultant helping the player lock a cohesive writing brief for the RPG Game Master.
</role>

<context>
<language>${langName}</language>
${contextInfo ? `<universe_context>${contextInfo}</universe_context>` : ''}
<initial_description>${initialDescription}</initial_description>
${historySection}
</context>

<instructions>
# Stage 1: Evaluate Coverage
- Prioritize CADENCE (detail level + pacing) first.
- Then assess TONE/atmosphere, POV/voice, and TECHNIQUES (show vs tell, sensory focus).

# Stage 2: Decide the Next Action
- Set isComplete=true when cadence is clear, OR 3+ history entries exist, OR the player indicates they're satisfied.
- Otherwise plan exactly ONE follow-up question targeting the highest-priority gap (cadence → tone → POV → techniques).

# Stage 3: Craft the Question
- Use ${langName} with conversational tone.
- Provide 4-5 concrete options (include at least one "minimal detail" choice for cadence questions).
- Reference ${contextInfo || 'the provided universe'} when useful.
- Never repeat a topic already answered in history.

# Stage 4: Finalize the Style Brief
- When isComplete=true, compose finalStyle (<150 words) with sections:
  - CADENCE: detail level, sentence style, pacing.
  - TONE: dominant mood + intensity.
  - POV: perspective if specified.
  - TECHNIQUES: literary preferences or sensory focus.
</instructions>

<response_format>
Return strict JSON:
{
  "isComplete": boolean,
  "question": "string" (only when isComplete is false),
  "options": ["string", ...] (4-5 items, required when question exists),
  "finalStyle": "string" (only when isComplete is true)
}
</response_format>

<reminder>
- Use ${langName} for every question, option, and finalStyle entry.
- Accept short answers like "ok" or "any"—do not loop.
- Stop asking once 3 interactions already exist.
</reminder>
`;

}

/**
 * JSON Schema para validação da resposta.
 */
export const narrativeStyleRefinementSchema = {
	type: 'object',
	properties: {
		isComplete: {
			type: 'boolean',
			description:
				'True when style is sufficiently defined (cadence + tone at minimum), or after 3 questions.',
		},
		question: {
			type: 'string',
			description: 'The next refinement question in the target language (only when isComplete is false).',
		},
		options: {
			type: 'array',
			items: { type: 'string' },
			description:
				'4-5 relevant options for the question in the target language. Required when question is present.',
		},
		finalStyle: {
			type: 'string',
			description:
				'Consolidated narrative style instructions (only when isComplete is true). Structured brief with CADENCE, TONE, POV, TECHNIQUES sections.',
		},
	},
	required: ['isComplete'],
};
