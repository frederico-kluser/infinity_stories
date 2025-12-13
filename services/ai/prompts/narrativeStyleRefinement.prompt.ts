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

	const historyContext =
		history.length > 0
			? `\n\nREFINEMENT HISTORY (already answered):\n${history.map((h, i) => `${i + 1}. Q: ${h.question}\n   A: ${h.answer}`).join('\n\n')}`
			: '';

	const contextInfo = [
		genre ? `Genre: ${genre}` : null,
		universeName ? `Universe: ${universeName}` : null,
	]
		.filter(Boolean)
		.join(' | ');

	return `You are a narrative style consultant helping a player define their preferred writing style for an interactive RPG story.

TARGET LANGUAGE FOR ALL OUTPUT: ${langName}
${contextInfo ? `CONTEXT: ${contextInfo}` : ''}

PLAYER'S INITIAL STYLE DESCRIPTION:
"${initialDescription}"
${historyContext}

=== ELEMENTS TO EVALUATE (in priority order) ===

1. **CADENCE/DETAIL LEVEL** (MOST IMPORTANT for user experience)
   - How detailed should descriptions be? (minimal/moderate/rich)
   - Sentence length preference (short and punchy / varied / flowing)
   - Pacing speed (fast action-focused / balanced / slow and immersive)

2. **TONE/ATMOSPHERE**
   - Overall mood (dark, hopeful, tense, humorous, epic, intimate, etc.)
   - Emotional intensity level

3. **POV/VOICE** (only if unclear)
   - Narrative perspective (first person, third limited, third omniscient)

4. **TECHNIQUES** (only if user seems interested in craft)
   - Show don't tell preference
   - Sensory focus priorities

=== DECISION RULES ===

**MARK AS COMPLETE (isComplete: true) when:**
- User has clearly expressed CADENCE preference (detail level + pacing), OR
- History has 3+ questions already answered, OR
- User explicitly says they're satisfied or wants to proceed

**ASK A QUESTION (isComplete: false) when:**
- CADENCE/detail level is unclear (this is the PRIORITY question), OR
- TONE is completely unspecified AND cadence is clear, OR
- Less than 3 questions have been asked AND important info is missing

=== QUESTION GUIDELINES ===

1. Ask ONE question at a time about the most important missing element
2. ALWAYS provide 4-5 concrete options in the target language
3. Options must be:
   - Specific and actionable (not vague like "normal" or "balanced")
   - Relevant to the genre/universe if provided
   - Include at least one "minimal detail" option for users tired of verbose narration
4. Question should be conversational, not technical
5. NEVER ask about something already answered in history

=== OPTION EXAMPLES BY ELEMENT ===

For CADENCE (adapt to ${langName}):
- "Frases curtas e diretas, foco na ação, poucos detalhes descritivos"
- "Descrições moderadas, equilíbrio entre ação e ambientação"
- "Prosa rica e imersiva, descrições sensoriais detalhadas"
- "Ritmo cinematográfico: cortes rápidos em ação, pausas em momentos dramáticos"

For TONE (adapt to ${langName}):
- "Sombrio e tenso, com momentos de alívio"
- "Aventureiro e otimista"
- "Realista com toques de humor seco"
- "Épico e grandioso"

=== FINAL STYLE FORMAT ===

When isComplete is true, generate finalStyle as a structured brief with these sections:
- CADENCE: [detail level, sentence style, pacing]
- TONE: [primary mood, intensity]
- POV: [perspective, if specified]
- TECHNIQUES: [any specific preferences mentioned]

Keep finalStyle under 150 words. Be specific and actionable.

=== ANTI-LOOP RULES ===

- If history has 3+ items, ALWAYS set isComplete=true and generate finalStyle
- Never repeat a question from history
- If user gives minimal answer like "ok" or "any", accept it and move on
- Brief answers are valid: "like Game of Thrones" tells you tone, violence level, etc.

=== RESPONSE FORMAT ===

Respond with valid JSON only:
{
  "isComplete": boolean,
  "question": "string (only if isComplete is false)",
  "options": ["string array with 4-5 options (only if question is present)"],
  "finalStyle": "string (only if isComplete is true)"
}`;
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
