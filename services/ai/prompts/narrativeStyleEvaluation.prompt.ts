/**
 * @fileoverview Prompt de Avaliação de Estilo Narrativo
 *
 * Este módulo contém o prompt responsável por avaliar a descrição de estilo
 * narrativo fornecida pelo usuário e identificar elementos faltantes para
 * criar uma direção narrativa completa.
 *
 * @module prompts/narrativeStyleEvaluation
 *
 * @description
 * O prompt analisa a descrição inicial do usuário e verifica se contém
 * informações suficientes sobre os seguintes elementos narrativos:
 *
 * 1. **Voz Narrativa (POV)** - primeira pessoa, terceira limitada, onisciente
 * 2. **Tom/Atmosfera** - sombrio, esperançoso, tenso, humorístico, etc.
 * 3. **Ritmo/Cadência** - frases curtas, prosa florida, misto
 * 4. **Referências de Estilo** - autores, obras, filmes que inspiram
 * 5. **Técnicas Literárias** - show don't tell, metáforas, etc.
 * 6. **Foco Sensorial** - detalhes visuais, sonoros, táteis
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
 * Parâmetros para construir o prompt de avaliação de estilo narrativo.
 */
export interface NarrativeStyleEvaluationParams {
	/** Descrição inicial do estilo narrativo fornecida pelo usuário */
	initialDescription: string;
	/** Histórico de perguntas e respostas de refinamento */
	history: NarrativeStyleHistoryItem[];
	/** Idioma para as perguntas */
	language: Language;
}

/**
 * Resposta da avaliação de estilo narrativo.
 */
export interface NarrativeStyleEvaluationResponse {
	/** Se a descrição está completa o suficiente */
	isComplete: boolean;
	/** Próxima pergunta a fazer (se não estiver completo) */
	question?: string;
	/** Opções para a pergunta (sempre presente se houver pergunta) */
	options?: string[];
	/** Estilo final consolidado (quando completo) */
	finalStyle?: string;
	/** Elementos identificados na descrição */
	identifiedElements?: {
		pov?: string;
		tone?: string;
		cadence?: string;
		references?: string[];
		techniques?: string[];
		sensoryFocus?: string[];
	};
}

/**
 * Elementos narrativos que precisam ser identificados ou coletados.
 */
const NARRATIVE_ELEMENTS = {
	pov: 'Point of View / Narrative Voice',
	tone: 'Tone / Atmosphere',
	cadence: 'Rhythm / Cadence / Sentence Structure',
	references: 'Style References (authors, works, films)',
	techniques: 'Literary Techniques',
	sensoryFocus: 'Sensory Focus (visual, auditory, etc.)',
};

/**
 * Constrói o prompt para avaliar e refinar o estilo narrativo.
 */
export function buildNarrativeStyleEvaluationPrompt({
	initialDescription,
	history,
	language,
}: NarrativeStyleEvaluationParams): string {
	const langName = getLanguageName(language);

	const historyContext =
		history.length > 0
			? `\n\nREFINEMENT HISTORY:\n${history.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}`
			: '';

	return `
You are a narrative style consultant helping a player define their preferred writing style for an interactive RPG story.
Target Language for questions: ${langName}

INITIAL STYLE DESCRIPTION FROM PLAYER:
"${initialDescription}"
${historyContext}

NARRATIVE ELEMENTS TO EVALUATE:
1. POV (Point of View): First person, third person limited, third person omniscient
2. TONE: Dark, hopeful, tense, humorous, melancholic, epic, intimate, etc.
3. CADENCE: Short punchy sentences, flowing prose, varied rhythm, poetic
4. REFERENCES: Authors, books, films, games, or shows that inspire the style
5. TECHNIQUES: Show don't tell, metaphors, foreshadowing, internal monologue, etc.
6. SENSORY FOCUS: Visual details, sounds, smells, textures, emotions

INSTRUCTIONS:
1. Analyze the initial description and any refinement history to identify what elements are clearly defined.
2. Determine if ANY critical elements are missing or unclear.
3. Critical elements are: POV, TONE, and at least one of (CADENCE, REFERENCES, or TECHNIQUES).

IF ELEMENTS ARE MISSING:
- Ask ONE clear question about the most important missing element.
- ALWAYS provide 4-6 relevant options that match the universe/style described.
- Options should be concrete and evocative, not generic.
- The question should be conversational and helpful.

IF ALL CRITICAL ELEMENTS ARE PRESENT:
- Set isComplete to true.
- Generate a consolidated 'finalStyle' that combines:
  - The original description
  - All refinement answers
  - Formatted as clear narrative instructions

OPTION EXAMPLES BY ELEMENT:
- POV: "First person - intimate and personal", "Third person limited - close to protagonist", "Third person omniscient - godlike narrator"
- TONE: "Dark and gritty - morally ambiguous", "Hopeful but with tension", "Sardonic humor with serious undertones"
- CADENCE: "Short, punchy sentences for action", "Flowing prose with sensory details", "Varied rhythm - staccato in combat, lyrical in calm"
- REFERENCES: Suggest 4-6 authors/works that match the described style
- TECHNIQUES: "Heavy use of metaphor", "Show don't tell - action reveals character", "Internal monologue reveals motivation"

IMPORTANT RULES:
- Never ask about elements already clearly stated in the description or history.
- If the player mentioned a specific author/work, use that as anchor for suggestions.
- Maximum 3 refinement questions total. After 3 questions, consolidate what you have.
- Brief answers are valid. "Like Game of Thrones" tells you a lot about tone, violence level, and political intrigue.
- "I don't know" or "surprise me" are valid - use sensible defaults that match the rest.

ANTI-LOOP:
- Count questions in history. If there are 3+ questions already, set isComplete=true and generate finalStyle.
- Never ask the same question twice.
- If user gives minimal answer, accept it and move on.
`;
}

/**
 * JSON Schema para validação da resposta.
 */
export const narrativeStyleEvaluationSchema = {
	type: 'object',
	properties: {
		isComplete: {
			type: 'boolean',
			description: 'True when enough elements are defined to create a coherent style (POV + TONE + at least one other element), or after 3 refinement questions.',
		},
		question: {
			type: 'string',
			description: 'The next refinement question (only when isComplete is false).',
		},
		options: {
			type: 'array',
			items: { type: 'string' },
			description: 'REQUIRED when asking a question: 4-6 relevant options for the player. UI has built-in "Other" button for custom input.',
		},
		finalStyle: {
			type: 'string',
			description: 'Consolidated narrative style instructions (only when isComplete is true). Should be a structured brief covering POV, TONE, CADENCE, TECHNIQUES.',
		},
		identifiedElements: {
			type: 'object',
			description: 'Elements identified from the description and history.',
			properties: {
				pov: { type: 'string' },
				tone: { type: 'string' },
				cadence: { type: 'string' },
				references: { type: 'array', items: { type: 'string' } },
				techniques: { type: 'array', items: { type: 'string' } },
				sensoryFocus: { type: 'array', items: { type: 'string' } },
			},
		},
	},
	required: ['isComplete'],
};
