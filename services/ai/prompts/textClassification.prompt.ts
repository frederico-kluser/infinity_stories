/**
 * @fileoverview Prompt de Classificação e Processamento de Texto do Jogador
 *
 * Este módulo contém o prompt responsável por classificar o input do jogador
 * como "ação" ou "fala" e, no caso de fala, reescrever para se adequar
 * ao personagem e universo.
 *
 * @module prompts/textClassification
 *
 * @description
 * O Text Classification Prompt usa GPT-4.1-nano para:
 *
 * - **Classificar input** - Identificar se é uma ação ou uma fala
 * - **Reescrever falas** - Adaptar diálogos ao estilo do personagem e universo
 * - **Preservar ações** - Manter comandos/ações inalterados
 *
 * Este prompt é chamado ANTES de qualquer outro processamento, sendo a primeira
 * etapa após o jogador digitar ou selecionar uma opção.
 *
 * @example
 * ```typescript
 * import { buildTextClassificationPrompt } from './prompts/textClassification.prompt';
 *
 * const prompt = buildTextClassificationPrompt({
 *   gameState,
 *   rawInput: 'Ei, você aí! Me ajuda!',
 *   language: 'pt'
 * });
 * // Retorna JSON: { type: "speech", processedText: "Ó, viajante! Poderia me auxiliar?", shouldProcess: true }
 * ```
 */

import { GameState, Language, Character, Location } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { getRecentMessagesForPrompt } from './helpers';

/**
 * Parâmetros necessários para construir o prompt de classificação de texto.
 *
 * @interface TextClassificationPromptParams
 * @property {GameState} gameState - Estado completo do jogo para contexto
 * @property {string} rawInput - O texto original digitado pelo jogador
 * @property {Language} language - Idioma para geração ('en', 'pt', 'es')
 */
export interface TextClassificationPromptParams {
  /** Estado completo do jogo incluindo personagem, localização e histórico */
  gameState: GameState;
  /** Texto original que o jogador digitou ou selecionou */
  rawInput: string;
  /** Idioma no qual a mensagem processada deve ser gerada */
  language: Language;
}

/**
 * Um segmento individual do input do jogador (ação ou fala).
 */
export interface InputSegment {
  /** Tipo do segmento */
  type: 'action' | 'speech';
  /** Texto original do segmento (antes de transformação) */
  originalText: string;
  /** Texto transformado:
   * - Para falas: adaptado ao estilo do personagem
   * - Para ações: transformado para narrativa em terceira pessoa
   */
  processedText: string;
}

/**
 * Formato da resposta esperada da classificação de texto.
 *
 * @interface TextClassificationResponse
 * @property {InputSegment[]} segments - Array de segmentos separados (ações e falas)
 * @property {boolean} hasMultipleSegments - Se o input contém mistura de ação/fala
 */
export interface TextClassificationResponse {
  /** Array de segmentos separados */
  segments: InputSegment[];
  /** Indica se o input continha mistura de ação e fala */
  hasMultipleSegments: boolean;

  // Legacy fields for backwards compatibility
  /** @deprecated Use segments[0].type instead */
  type: 'action' | 'speech';
  /** @deprecated Use segments[0].processedText instead */
  processedText: string;
  /** @deprecated Use hasMultipleSegments instead */
  shouldProcess: boolean;
}

/**
 * Constrói o prompt para separar e transformar o input do jogador.
 *
 * Este prompt instrui a IA a:
 *
 * **1. Separar em Segmentos:**
 * - Identificar partes que são AÇÕES vs FALAS
 * - Criar um array de segmentos ordenados
 *
 * **2. Para AÇÕES:**
 * - Transformar para narrativa em terceira pessoa
 * - Usar linguagem literária e interessante
 * - Evitar literalidade ("O jogador caminhou" → "Seus passos ecoam pelo corredor")
 *
 * **3. Para FALAS:**
 * - Reescrever para se adequar ao personagem e universo
 * - Manter a intenção e significado original
 *
 * @example
 * ```typescript
 * // Input MISTO: ação + fala + ação
 * const mixedPrompt = buildTextClassificationPrompt({
 *   gameState,
 *   rawInput: 'Olho para o guarda e digo: "Boa noite" antes de fazer uma reverência',
 *   language: 'pt'
 * });
 * // Resultado:
 * // segments: [
 * //   { type: "action", originalText: "Olho para o guarda", processedText: "Seus olhos encontram o olhar atento do guarda" },
 * //   { type: "speech", originalText: "Boa noite", processedText: "Boa noite, senhor guarda" },
 * //   { type: "action", originalText: "antes de fazer uma reverência", processedText: "Uma reverência elegante completa a saudação" }
 * // ]
 * ```
 */
export function buildTextClassificationPrompt({
  gameState,
  rawInput,
  language,
}: TextClassificationPromptParams): string {
  const langName = getLanguageName(language);
  const player: Character | undefined =
    gameState.characters[gameState.playerCharacterId];
  const currentLocation: Location | undefined =
    gameState.locations[gameState.currentLocationId];
  const recentMessages = getRecentMessagesForPrompt(gameState.messages);
  const playerName = player?.name || 'The adventurer';

  // Formatar mensagens recentes para contexto
  const recentContext = recentMessages.map((m) => {
    const sender = gameState.characters[m.senderId];
    const senderName = sender?.name || (m.senderId === 'GM' ? 'Narrator' : 'System');
    return `${senderName}: ${m.text}`;
  }).join('\n');

  return `
<role>
You are a text parser for an interactive RPG game.
Your mission: Separate player input into ACTION and SPEECH segments, then transform each appropriately.
</role>

<context>
<universe>${gameState.config.universeName} (${gameState.config.universeType})</universe>
<character>
Name: ${playerName}
Description: ${player?.description || 'A mysterious adventurer'}
Background: ${(gameState.config as any).background || 'Unknown background'}
Personality: ${(gameState.config as any).personality || 'Unknown personality'}
</character>
<location>${currentLocation?.name || 'Unknown'} - ${currentLocation?.description || ''}</location>
<language>${langName}</language>

<recent_conversation>
${recentContext || 'No recent messages'}
</recent_conversation>
</context>

<segment_types>
# ACTION Segments (what the character DOES)
- Physical: attack, move, jump, run, hide, climb
- Objects: pick up, open, close, use, examine
- Movement: go to, enter, exit, follow, approach
- Combat: strike, parry, dodge, cast spell
- Observation: look around, inspect, observe
- Emotions: smile, frown, sigh, laugh

# SPEECH Segments (what the character SAYS)
- Dialogue with NPCs or others
- Questions directed at someone
- Greetings, farewells, exclamations
- Anything in quotes or after "digo:", "falo:", "pergunto:"
</segment_types>

<transformation_rules>
# For ACTION Segments
Transform into THIRD-PERSON NARRATIVE with literary style:
- Use third person or poetic descriptions (avoid "I", "eu", "yo")
- Be creative and atmospheric, not literal
- Match the universe's tone

Vary these phrases - do not repeat verbatim:
- "Olho ao redor" → "${playerName} percorre o ambiente com o olhar"
- "Pego a espada" → "Os dedos se fecham em torno do cabo da espada"
- "Sorrio" → "Um sorriso sutil se forma em seus lábios"

# For SPEECH Segments
Adapt to character's voice and universe:
- Medieval fantasy: archaic, formal
- Sci-fi: technical, modern
- Keep meaning identical, similar length
</transformation_rules>

<examples>
# Example 1: Mixed Input
Input: "Olho para o guarda e digo: 'Boa noite' antes de sorrir"

Output:
{
  "segments": [
    { "type": "action", "originalText": "Olho para o guarda", "processedText": "Seu olhar se dirige ao guarda de plantão" },
    { "type": "speech", "originalText": "Boa noite", "processedText": "Boa noite, senhor" },
    { "type": "action", "originalText": "antes de sorrir", "processedText": "Um sorriso cordial acompanha a saudação" }
  ],
  "hasMultipleSegments": true
}

# Example 2: Action with embedded speech
Input: "Pergunto onde fica a taverna enquanto caminho até ele"

Output:
{
  "segments": [
    { "type": "action", "originalText": "caminho até ele", "processedText": "${playerName} se aproxima com passos decididos" },
    { "type": "speech", "originalText": "Pergunto onde fica a taverna", "processedText": "Poderia me indicar onde fica a taverna?" }
  ],
  "hasMultipleSegments": true
}
</examples>

<output_format>
Respond with JSON only:
{
  "segments": [
    { "type": "action|speech", "originalText": "...", "processedText": "..." }
  ],
  "hasMultipleSegments": true|false
}
</output_format>

<reminder>
- Preserve ORDER of segments from original input
- All text in ${langName}
- Actions in third person narrative
- Speech matches character personality
</reminder>

<input>
Player input to parse: "${rawInput}"
</input>
`;
}

/**
 * JSON Schema para validação da resposta de classificação de texto.
 *
 * @constant
 * @type {object}
 */
export const textClassificationSchema = {
  type: 'object',
  properties: {
    segments: {
      type: 'array',
      description: 'Array of separated segments (actions and speeches)',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['action', 'speech'],
            description: 'Type of segment: action or speech',
          },
          originalText: {
            type: 'string',
            description: 'The original text of this segment',
          },
          processedText: {
            type: 'string',
            description: 'The transformed text (narrative for actions, adapted for speech)',
          },
        },
        required: ['type', 'originalText', 'processedText'],
      },
    },
    hasMultipleSegments: {
      type: 'boolean',
      description: 'Whether the input contained a mix of action and speech',
    },
  },
  required: ['segments', 'hasMultipleSegments'],
};
