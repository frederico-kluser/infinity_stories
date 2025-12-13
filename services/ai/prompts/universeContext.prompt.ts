/**
 * @fileoverview Prompt de Geração de Contexto do Universo
 *
 * Este módulo contém o prompt responsável por gerar um contexto narrativo
 * profundo e detalhado para um novo universo de RPG. Este contexto é gerado
 * uma única vez na criação do universo e serve como referência permanente
 * para todas as interações narrativas subsequentes.
 *
 * @module prompts/universeContext
 *
 * @description
 * O Universe Context Prompt é usado para criar um documento rico contendo:
 *
 * - **Comunicação** - Como as pessoas falam, expressões idiomáticas, formalidade
 * - **Gírias e Jargões** - Termos específicos do universo por grupo social
 * - **Sistema Monetário** - Nome da moeda, valores, economia básica
 * - **Cultura e Costumes** - Saudações, despedidas, gestos, etiqueta
 * - **Estrutura Social** - Classes, hierarquias, grupos de poder
 * - **Elementos Únicos** - Tecnologia, magia, religião, política
 * - **Tom Narrativo** - Estilo de escrita adequado ao universo
 *
 * Este contexto é incluído em todos os prompts que usam heavyContext para
 * garantir consistência narrativa durante toda a gameplay.
 *
 * @example
 * ```typescript
 * import { buildUniverseContextPrompt } from './prompts/universeContext.prompt';
 *
 * const prompt = buildUniverseContextPrompt({
 *   universeName: 'Star Wars',
 *   universeType: 'existing',
 *   language: 'pt'
 * });
 * ```
 */

import { Language, NarrativeStyleMode } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { NarrativeGenre, GENRE_PRESETS } from './narrativeStyles';

/**
 * Parâmetros para construir o prompt de geração de contexto do universo.
 *
 * @interface UniverseContextPromptParams
 * @property {string} universeName - Nome do universo (ex: "Star Wars", "Senhor dos Anéis")
 * @property {string} universeType - Tipo do universo ('original' ou 'existing')
 * @property {Language} language - Idioma para geração do contexto ('en', 'pt', 'es')
 * @property {NarrativeGenre} [genre] - Gênero narrativo para estilo específico
 */
export interface UniverseContextPromptParams {
  /** Nome do universo onde a história se passa */
  universeName: string;
  /** Tipo do universo: 'original' para criações do usuário, 'existing' para franquias */
  universeType: 'original' | 'existing';
  /** Idioma no qual o contexto deve ser gerado */
  language: Language;
  /** Gênero narrativo para aplicar convenções de estilo específicas */
  genre?: NarrativeGenre;
  /** Estrategia escolhida para o estilo narrativo */
  narrativeStyleMode?: NarrativeStyleMode;
  /** Instruções customizadas fornecidas pelo jogador */
  customNarrativeStyle?: string;
}

/**
 * Constrói o prompt para gerar um contexto narrativo profundo do universo.
 *
 * Este prompt instrui a IA a criar um documento extenso que serve como
 * "bíblia narrativa" do universo, contendo todas as informações necessárias
 * para manter consistência em diálogos, descrições e interações.
 *
 * @param {UniverseContextPromptParams} params - Parâmetros de entrada
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Universo existente (Star Wars)
 * const swPrompt = buildUniverseContextPrompt({
 *   universeName: 'Star Wars',
 *   universeType: 'existing',
 *   language: 'pt'
 * });
 *
 * // Universo original
 * const originalPrompt = buildUniverseContextPrompt({
 *   universeName: 'Crônicas de Aethermoor',
 *   universeType: 'original',
 *   language: 'pt'
 * });
 * ```
 */
export function buildUniverseContextPrompt({
  universeName,
  universeType,
  language,
  genre,
  narrativeStyleMode,
  customNarrativeStyle,
}: UniverseContextPromptParams): string {
  const langName = getLanguageName(language);

  const universeTypeInstruction = universeType === 'existing'
    ? `This is a WELL-KNOWN universe ("${universeName}"). Use your knowledge of this franchise to create an accurate and faithful context. Include canon elements, established lore, and recognizable cultural aspects from the original material.`
    : `This is an ORIGINAL universe created by the user ("${universeName}"). Be creative and inventive while maintaining internal consistency. Create unique elements that feel cohesive and immersive.`;

  // Build genre-specific instructions if genre is provided
  let genreInstructions = '';
  if (genre && GENRE_PRESETS[genre]) {
    const style = GENRE_PRESETS[genre];
    genreInstructions = `
===== GENRE-SPECIFIC REQUIREMENTS: ${style.displayName.toUpperCase()} =====

This universe should embody the conventions of the ${style.displayName} genre.

**VOCABULARY GUIDANCE:**
- Complexity level: ${style.vocabulary.complexity}
- Formality level: ${style.vocabulary.formality}
- Include terms like: ${style.vocabulary.useWords.join(', ')}
- Avoid terms like: ${style.vocabulary.avoidWords.join(', ')}

**ATMOSPHERE:**
- Primary tone: ${style.atmosphere.primaryTone}
- Secondary tones: ${style.atmosphere.secondaryTones.join(', ')}
- Violence portrayal: ${style.atmosphere.violenceLevel}
- Humor style: ${style.atmosphere.humorStyle}

**GENRE TECHNIQUES TO INCORPORATE:**
${style.techniques.map((t) => `- ${t}`).join('\n')}

**AVOID THESE IN THIS GENRE:**
${style.avoid.map((a) => `- ${a}`).join('\n')}

**EXAMPLE PROSE STYLE (for reference):**
${style.examplePhrases.map((p) => `"${p}"`).join('\n')}

Ensure the communication style, slang, customs, and narrative tone align with these genre conventions.
`;
  }

  const mode: NarrativeStyleMode = narrativeStyleMode ?? 'auto';
  let customStyleInstructions = '';
  const trimmedCustomStyle = mode === 'custom' ? customNarrativeStyle?.trim() : undefined;
  if (mode === 'custom' && trimmedCustomStyle) {
    genreInstructions = '';
    customStyleInstructions = `
===== PLAYER-DEFINED STYLE (MANDATORY) =====
The player provided explicit narrative instructions. Apply them to the entire universe bible.

CUSTOM STYLE BRIEF:
${trimmedCustomStyle}

INTERPRETATION RULES:
- Treat cited authors/works as tonal references. Mirror cadence, sentence length, and metaphor density.
- Document slang, customs, and cultural behaviors that reflect this custom tone.
- Keep this custom style active for every dialogue, description, and lore entry until the player changes it.
`;
  }

  return `
<role>
You are a world-building expert creating a comprehensive NARRATIVE CONTEXT DOCUMENT for an RPG universe.
Your mission: Create a thorough reference document that any writer could use to maintain narrative consistency.
</role>

<universe_context>
<name>${universeName}</name>
<type>${universeType === 'existing' ? 'Well-known IP - use canon elements and established lore' : 'Original creation - be creative while maintaining internal consistency'}</type>
</universe_context>
${customStyleInstructions || genreInstructions}

<language>${langName}</language>

<required_sections>
## 1. COMMUNICATION STYLE
- Formality levels (addressing superiors, equals, strangers, friends)
- Common greetings and farewells
- Expressions of emotion (surprise, anger, joy, fear)
- Verbal tics, filler words, speech patterns
- Regional/class variations in speech

## 2. SLANG AND JARGON
- 10-15 slang words/phrases with meanings
- Universe-appropriate profanity/curses
- Professional jargon (soldiers, merchants, mages, pilots)
- Affectionate terms (lovers, friends, parents)
- Common insults and severity levels

## 3. MONETARY SYSTEM
- Currency name(s) and denominations
- Casual references to money (slang)
- Value examples (meal, lodging, weapon)
- Economic context (poverty, wealth disparity, black markets)
- Alternate trade (barter, credits, crystals)

## 4. CULTURE AND CUSTOMS
- Physical greetings/farewells (bows, handshakes, salutes)
- Eating customs and table manners
- Religious/spiritual practices, prayers, superstitions
- Death customs and mourning
- Major celebrations, holidays, festivals
- Taboos and forbidden topics

## 5. SOCIAL STRUCTURE
- Class system (nobles, commoners, outcasts)
- Power groups (guilds, corporations, orders)
- Social mobility options
- Discrimination and prejudices
- Law and justice system

## 6. UNIQUE ELEMENTS
- Technology level and prevalence
- Magic/supernatural systems
- Important organizations and factions
- Recent historical events affecting daily life
- Famous geographic locations

## 7. NARRATIVE TONE
- Overall mood (dark, adventurous, epic)
- Humor style and frequency
- Violence description level
- Romance portrayal style
- Pacing preferences

## 8. NPC VOICE ARCHETYPES
For each group, include: verbal tics, formality level, common topics, how they address strangers vs. acquaintances

- Nobility/Royalty
- Common folk
- Scholars/Mages
- Merchants
- Warriors/Soldiers
- Outcasts/Criminals
</required_sections>

<format_requirements>
- Write EVERYTHING in ${langName}
- Be COMPREHENSIVE (2000-3000 words minimum)
- Include SPECIFIC EXAMPLES for each category
- Use bullet points and clear organization
- Make it feel ALIVE and AUTHENTIC
</format_requirements>

<output_format>
Return ONLY the narrative context document as plain text (not JSON).
Start directly with the content, no preamble.
</output_format>
`;
}

/**
 * Schema JSON para a resposta do contexto do universo.
 * Como a resposta é texto puro, este schema é simples.
 */
export const universeContextSchema = {
  type: 'object',
  properties: {
    context: {
      type: 'string',
      description: 'The comprehensive narrative context document for the universe.',
    },
  },
  required: ['context'],
};
