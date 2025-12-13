/**
 * @fileoverview Prompt de Inicialização da História - Criação do Mundo Inicial
 *
 * Este módulo contém o prompt responsável por gerar o estado inicial de um novo
 * jogo de RPG, incluindo a localização de partida, o personagem do jogador com
 * seus atributos base, e a mensagem de abertura da narrativa.
 *
 * @module prompts/storyInitialization
 *
 * @description
 * O Story Initialization Prompt é usado após o onboarding para criar:
 *
 * - **Localização Inicial** - O cenário onde a aventura começa
 * - **Personagem do Jogador** - Com stats base, inventário inicial e descrição
 * - **Narrativa de Abertura** - Introdução atmosférica ao mundo do jogo
 *
 * Este prompt transforma a configuração coletada no onboarding em um estado
 * de jogo jogável com todos os elementos necessários para começar.
 *
 * @example
 * ```typescript
 * import { buildStoryInitializationPrompt } from './prompts/storyInitialization.prompt';
 *
 * const prompt = buildStoryInitializationPrompt({
 *   config: {
 *     universeName: 'Star Wars',
 *     universeType: 'existing',
 *     playerName: 'Kira',
 *     playerDesc: 'Uma jovem padawan com cabelos escuros',
 *     startSituation: 'No Templo Jedi em Coruscant',
 *     background: 'Órfã treinada desde criança',
 *     memories: 'Lembra de um misterioso salvador'
 *   },
 *   language: 'pt'
 * });
 * ```
 *
 * @see {@link StoryInitializationPromptParams} - Parâmetros aceitos pela função
 * @see {@link StoryConfig} - Configuração do jogo vinda do onboarding
 */

import { Language, NarrativeGenre, NarrativeStyleMode } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { getStartingGold, DEFAULT_PLAYER_STATS, formatEconomyRulesForPrompt } from '../../../constants/economy';
import { GENRE_PRESETS } from './narrativeStyles';

/**
 * Configuração da história coletada durante o processo de onboarding.
 *
 * @interface StoryConfig
 * @property {string} universeName - Nome do universo/mundo do jogo
 * @property {string} universeType - Tipo do universo ('original' ou 'existing')
 * @property {string} playerName - Nome do personagem do jogador
 * @property {string} playerDesc - Descrição visual detalhada do personagem
 * @property {string} startSituation - Situação e localização inicial
 * @property {string} background - História de fundo do personagem
 * @property {string} memories - Memórias importantes do personagem
 */
export interface StoryConfig {
  /** Nome do universo onde a história se passa */
  universeName: string;
  /** Tipo do universo: 'original' para criações do usuário, 'existing' para franquias */
  universeType: string;
  /** Nome do personagem protagonista */
  playerName: string;
  /** Descrição física/visual do personagem */
  playerDesc: string;
  /** Contexto da situação inicial onde o jogo começa */
  startSituation: string;
  /** História de fundo do personagem (background) */
  background: string;
  /** Memórias significativas do passado do personagem */
  memories: string;
  /** Gênero narrativo sugerido (quando em modo automático) */
  genre?: NarrativeGenre;
  /** Estratégia de estilo narrativo selecionada pelo jogador */
  narrativeStyleMode?: NarrativeStyleMode;
  /** Instruções personalizadas para o estilo narrativo */
  customNarrativeStyle?: string;
}

/**
 * Parâmetros necessários para construir o prompt de inicialização.
 *
 * @interface StoryInitializationPromptParams
 * @property {StoryConfig} config - Configuração completa da história vinda do onboarding
 * @property {Language} language - Idioma para geração do texto ('en', 'pt', 'es')
 */
export interface StoryInitializationPromptParams {
  /** Configuração da história coletada no processo de onboarding */
  config: StoryConfig;
  /** Idioma no qual a narrativa inicial deve ser gerada */
  language: Language;
}

/**
 * Constrói o prompt para gerar o estado inicial de um novo jogo de RPG.
 *
 * Este prompt instrui a IA a criar:
 *
 * **1. Localização Inicial:**
 * - Nome e descrição atmosférica do local
 * - Conectada à situação de partida definida pelo usuário
 *
 * **2. Personagem do Jogador:**
 * - ID único para referência no sistema
 * - Stats básicos relevantes ao cenário (ex: HP, mana, força)
 * - Inventário inicial apropriado (roupas, 1 item-chave)
 * - Estado inicial como 'idle'
 *
 * **3. Mensagem de Abertura (Narrador):**
 * - Introdução imersiva ao mundo
 * - Estabelece o tom e atmosfera
 * - Conecta background e memórias à situação atual
 *
 * A resposta segue o mesmo schema do Game Master (gmResponseSchema)
 * para manter consistência no processamento.
 *
 * @param {StoryInitializationPromptParams} params - Parâmetros de entrada
 * @param {StoryConfig} params.config - Configuração da história
 * @param {Language} params.language - Idioma alvo
 *
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Universo existente (Star Wars)
 * const swPrompt = buildStoryInitializationPrompt({
 *   config: {
 *     universeName: 'Star Wars',
 *     universeType: 'existing',
 *     playerName: 'Zara Vex',
 *     playerDesc: 'Twi\'lek azul com cicatriz no rosto',
 *     startSituation: 'Cantina de Mos Eisley em Tatooine',
 *     background: 'Contrabandista em dívida com Jabba',
 *     memories: 'A morte do parceiro em uma emboscada'
 *   },
 *   language: 'pt'
 * });
 *
 * // Universo original
 * const originalPrompt = buildStoryInitializationPrompt({
 *   config: {
 *     universeName: 'Crônicas de Aethermoor',
 *     universeType: 'original',
 *     playerName: 'Elara',
 *     playerDesc: 'Elfa com olhos de prata e manto verde',
 *     startSituation: 'Floresta Anciã, próxima às ruínas élficas',
 *     background: 'Última guardiã de um conhecimento proibido',
 *     memories: 'A destruição de sua biblioteca pelo fogo negro'
 *   },
 *   language: 'pt'
 * });
 * ```
 *
 * @remarks
 * Os stats e inventário iniciais são gerados pela IA de forma contextual.
 * Por exemplo:
 * - Cenários de fantasia medieval: HP, mana, força, armadura básica
 * - Cenários de sci-fi: HP, energia, blaster ou ferramenta
 * - Cenários de horror: HP, sanidade, lanterna, diário
 */
export function buildStoryInitializationPrompt({
  config,
  language,
}: StoryInitializationPromptParams): string {
  const langName = getLanguageName(language);
  const startingGold = getStartingGold(config.universeName);
  const narrativeStyleDirective = buildNarrativeStyleDirective(config);

  return `
<role>
You are a world builder creating the initial state for a new RPG adventure.
Your mission: Generate an immersive opening scene, starting location, and player character.
</role>

<context>
<universe>${config.universeName} (${config.universeType})</universe>
<player_config>
Name: ${config.playerName}
Description: ${config.playerDesc}
Background: ${config.background}
Memories: ${config.memories}
Starting Situation: ${config.startSituation}
</player_config>
${narrativeStyleDirective}
</context>

<instructions>
# Creation Steps

## Step 1: Create the Starting Location
- Name that fits the universe
- Vivid description (2-3 sentences) with sensory details
- Atmospheric elements that set the tone

## Step 2: Create the Player Character
Include these MANDATORY stats:
- hp: ${DEFAULT_PLAYER_STATS.hp}
- maxHp: ${DEFAULT_PLAYER_STATS.maxHp}
- gold: ${startingGold}

## Step 3: Create Starting Inventory
Items relevant to the setting (clothes as armor, 1-2 key items).
Each item needs: name, category, baseValue, quantity, isStackable.

## Step 4: Narrator Introduction
Craft a Narrator introduction that:
- Sets the scene and tone
- Connects the player's background to the current moment
- Ends with a hook that invites action
</instructions>

<output_format>
# Inventory Item Format
{
  "name": "Item name",
  "category": "consumable|weapon|armor|valuable|material|quest|currency|misc",
  "baseValue": [price in gold],
  "quantity": 1,
  "isStackable": true|false
}

${formatEconomyRulesForPrompt()}
</output_format>

<reminder>
- All narrative text MUST be in ${langName}
- Use the GM response schema format (messages + stateUpdates)
- Make the opening memorable and evocative
</reminder>
  `;
}

function buildNarrativeStyleDirective(config: StoryConfig): string {
  const mode: NarrativeStyleMode = config.narrativeStyleMode ?? 'auto';
  const customStyle = config.customNarrativeStyle?.trim();

  if (mode === 'custom' && customStyle) {
    return `
      === PLAYER-DEFINED STYLE (MANDATORY) ===
      ${customStyle}
      Apply this voice to the opening narration, character bios, and location descriptions. Mirror cited authors' cadence, vocabulary, and pacing.
    `;
  }

  if (config.genre && GENRE_PRESETS[config.genre]) {
    const preset = GENRE_PRESETS[config.genre];
    const techniqueSample = preset.techniques.slice(0, 3).join(', ');
    return `
      === TARGET GENRE ===
      Emulate the ${preset.displayName} genre with ${preset.vocabulary.formality.toLowerCase()} / ${preset.vocabulary.complexity.toLowerCase()} vocabulary, ${preset.atmosphere.primaryTone} tone, and techniques such as ${techniqueSample}.
    `;
  }

  return '';
}
