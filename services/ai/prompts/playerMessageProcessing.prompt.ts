/**
 * @fileoverview Prompt de Processamento de Mensagem do Jogador - Adaptador de Diálogo
 *
 * Este módulo contém o prompt responsável por transformar o input bruto do jogador
 * em diálogo ou ação que corresponda à voz, personalidade e estilo do universo.
 * Também determina o tom emocional para Text-to-Speech.
 *
 * @module prompts/playerMessageProcessing
 *
 * @description
 * O Player Message Processing Prompt é usado para:
 *
 * - **Adaptar linguagem** - Transformar fala casual em diálogo apropriado ao cenário
 * - **Manter a voz do personagem** - Respeitar background e personalidade
 * - **Preservar intenção** - Manter o significado original do jogador
 * - **Contextualizar ações** - Descrever ações de forma imersiva
 * - **Determinar tom de voz** - Especificar tom emocional para TTS
 *
 * Este prompt é chamado ANTES do Game Master processar a ação, servindo como
 * uma camada de "roleplay automático" que ajuda jogadores a se manterem imersos.
 *
 * @example
 * ```typescript
 * import { buildPlayerMessageProcessingPrompt } from './prompts/playerMessageProcessing.prompt';
 *
 * const prompt = buildPlayerMessageProcessingPrompt({
 *   gameState,
 *   rawInput: 'oi, tudo bem?',
 *   language: 'pt'
 * });
 * // Retorna JSON: { text: "Salve, nobre viajante!", voiceTone: "friendly" }
 * ```
 *
 * @see {@link PlayerMessageProcessingPromptParams} - Parâmetros aceitos pela função
 * @see {@link PlayerMessageProcessingResponse} - Formato da resposta esperada
 */

import { GameState, Language, ChatMessage, Character, Location } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';

/**
 * Parâmetros necessários para construir o prompt de processamento de mensagem.
 *
 * @interface PlayerMessageProcessingPromptParams
 * @property {GameState} gameState - Estado completo do jogo para contexto
 * @property {string} rawInput - O texto original digitado pelo jogador
 * @property {Language} language - Idioma para geração ('en', 'pt', 'es')
 */
export interface PlayerMessageProcessingPromptParams {
  /** Estado completo do jogo incluindo personagem, localização e histórico */
  gameState: GameState;
  /** Texto original que o jogador digitou ou falou */
  rawInput: string;
  /** Idioma no qual a mensagem processada deve ser gerada */
  language: Language;
  /** Se true, solicita voiceTone para TTS. Se false, não inclui instruções de tom */
  useTone?: boolean;
}

/**
 * Formato da resposta esperada do processamento de mensagem.
 *
 * @interface PlayerMessageProcessingResponse
 * @property {string} text - O texto processado/adaptado
 * @property {string} voiceTone - Tom emocional para TTS
 */
export interface PlayerMessageProcessingResponse {
  text: string;
  voiceTone: string;
}

/**
 * Constrói o prompt para adaptar a mensagem do jogador ao estilo do personagem
 * e universo do jogo, incluindo determinação de tom de voz para TTS.
 *
 * Este prompt instrui a IA a:
 *
 * **1. Manter Significado e Intenção:**
 * - Preservar o que o jogador quer dizer/fazer
 * - Não alterar o objetivo da ação
 *
 * **2. Adaptar Estilo de Linguagem:**
 * - Fantasia medieval → fala arcaica e formal
 * - Sci-fi → jargão técnico e futurista
 * - Horror → tom tenso e cauteloso
 * - Comédia → humor e leveza
 *
 * **3. Respeitar Personalidade do Personagem:**
 * - Background influencia vocabulário
 * - Estado emocional afeta tom
 * - Relacionamentos afetam formalidade
 *
 * **4. Diferenciar Ações de Diálogos:**
 * - Inputs com verbos de ação (atacar, ir, olhar) → descrição de ação
 * - Inputs conversacionais → diálogo adaptado
 *
 * **5. Determinar Tom de Voz:**
 * - Analisar contexto emocional
 * - Considerar o que o personagem está fazendo
 * - Retornar tom apropriado para TTS
 *
 * **6. Manter Concisão:**
 * - Comprimento similar ao original
 * - Evitar elaboração excessiva
 *
 * @param {PlayerMessageProcessingPromptParams} params - Parâmetros de entrada
 * @param {GameState} params.gameState - Estado atual do jogo
 * @param {string} params.rawInput - Input bruto do jogador
 * @param {Language} params.language - Idioma alvo
 *
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Input casual em universo de fantasia medieval
 * const fantasyPrompt = buildPlayerMessageProcessingPrompt({
 *   gameState: medievalGameState,
 *   rawInput: 'e aí cara, beleza?',
 *   language: 'pt'
 * });
 * // Resultado: { text: "Salve, bom homem! Como passas?", voiceTone: "friendly" }
 *
 * // Input de ação em universo sci-fi
 * const scifiPrompt = buildPlayerMessageProcessingPrompt({
 *   gameState: spaceGameState,
 *   rawInput: 'vou embora daqui',
 *   language: 'pt'
 * });
 * // Resultado: { text: "Iniciando protocolo de evacuação.", voiceTone: "determined" }
 *
 * // Input de combate
 * const combatPrompt = buildPlayerMessageProcessingPrompt({
 *   gameState: dungeonGameState,
 *   rawInput: 'ataco o goblin',
 *   language: 'pt'
 * });
 * // Resultado: { text: "Saco minha espada e avanço!", voiceTone: "aggressive" }
 * ```
 *
 * @remarks
 * Este prompt retorna JSON com { text, voiceTone }.
 * O voiceTone é usado para Text-to-Speech emocional.
 */
export function buildPlayerMessageProcessingPrompt({
  gameState,
  rawInput,
  language,
  useTone = true,
}: PlayerMessageProcessingPromptParams): string {
  const langName = getLanguageName(language);
  const player: Character | undefined =
    gameState.characters[gameState.playerCharacterId];
  const currentLocation: Location | undefined =
    gameState.locations[gameState.currentLocationId];
  const recentMessages: ChatMessage[] = gameState.messages.slice(-5);

  return `
<role>
You are a dialogue adapter for an interactive RPG.
Your mission: Transform raw player input into dialogue/actions that match their character's voice and the universe's style.
</role>

<context>
<universe>${gameState.config.universeName} (${gameState.config.universeType})</universe>
<character>
Name: ${player?.name || 'Unknown'}
Description: ${player?.description || 'A mysterious adventurer'}
Background: ${(gameState.config as any).background || 'Unknown'}
</character>
<location>${currentLocation?.name || 'Unknown'} - ${currentLocation?.description || ''}</location>
<recent_context>${recentMessages.map((m) => m.text).join(' | ')}</recent_context>
</context>

<player_input>"${rawInput}"</player_input>

<instructions>
# Transformation Rules

1. **Preserve Intent**: Maintain the MEANING of what the player wants to say/do
2. **Adapt Style**: Match the universe's setting:
   - Medieval fantasy → archaic speech
   - Sci-fi → technical jargon
   - Match character personality and background
3. **Keep Concise**: Similar length to original
4. **Distinguish Types**:
   - ACTION (verbs like "attack", "go", "look") → action description
   - DIALOGUE (what character says) → adapt to speaking style
5. **Language**: Write in ${langName}${useTone ? `
6. **Voice Tone**: Determine emotional tone for TTS
   - Consider character's emotional state and current action
   - Options: excited, determined, nervous, calm, angry, playful, serious, confident, fearful, sarcastic` : ''}
</instructions>

<output_format>
{
  "text": "processed dialogue/action text"${useTone ? ',\n  "voiceTone": "emotional tone"' : ''}
}
</output_format>
`;
}

/**
 * JSON Schema para validação da resposta de processamento de mensagem.
 *
 * @constant
 * @type {object}
 */
export const playerMessageProcessingSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      description: 'The processed/adapted text in character voice',
    },
    voiceTone: {
      type: 'string',
      description:
        "Emotional tone for TTS (e.g., 'excited', 'calm', 'angry', 'nervous')",
    },
  },
  required: ['text'],
};
