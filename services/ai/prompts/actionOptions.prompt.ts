/**
 * @fileoverview Prompt de Opções de Ação - Gerador de Sugestões Contextuais
 *
 * Este módulo contém o prompt responsável por gerar 5 opções de ação contextuais
 * para o jogador, cada uma com probabilidades de eventos bons e ruins associadas.
 * Implementa o sistema de "destino" que adiciona aleatoriedade narrativa ao jogo.
 *
 * @module prompts/actionOptions
 *
 * @description
 * O Action Options Prompt é usado para:
 *
 * - **Sugerir ações** - Gerar 5 opções relevantes ao contexto atual
 * - **Definir riscos** - Atribuir probabilidades de eventos positivos e negativos
 * - **Variar tipos** - Misturar diálogos, exploração, combate e interações
 * - **Prover dicas** - Indicar o que pode acontecer de bom ou ruim
 *
 * Este prompt alimenta o sistema de "rolagem de destino" onde cada ação
 * tem uma chance de desencadear consequências inesperadas.
 *
 * @example
 * ```typescript
 * import { buildActionOptionsPrompt } from './prompts/actionOptions.prompt';
 *
 * const prompt = buildActionOptionsPrompt({
 *   gameState,
 *   language: 'pt'
 * });
 * ```
 *
 * @see {@link ActionOptionsPromptParams} - Parâmetros aceitos pela função
 * @see {@link ActionOptionsResponse} - Formato da resposta esperada
 */

import { GameState, Language, ChatMessage, Character, Location, GridCharacterPosition, GridElement } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { formatInventorySimple, normalizeInventory, getRecentMessagesForPrompt } from './helpers';
import { getItemAwarenessRulesForPrompt } from '../../../constants/economy';

/**
 * Parâmetros necessários para construir o prompt de opções de ação.
 *
 * @interface ActionOptionsPromptParams
 * @property {GameState} gameState - Estado completo do jogo para contexto
 * @property {Language} language - Idioma para geração das opções ('en', 'pt', 'es')
 */
export interface ActionOptionsPromptParams {
  /** Estado completo do jogo incluindo localização, personagem e histórico recente */
  gameState: GameState;
  /** Idioma no qual as opções de ação devem ser geradas */
  language: Language;
}

/**
 * Representa uma opção de ação gerada com suas probabilidades.
 *
 * @interface GeneratedActionOption
 * @property {string} text - Texto da ação (3-8 palavras)
 * @property {number} goodChance - Probabilidade (0-50) de algo bom acontecer
 * @property {number} badChance - Probabilidade (0-50) de algo ruim acontecer
 * @property {string} goodHint - Dica do que de bom pode acontecer
 * @property {string} badHint - Dica do que de ruim pode acontecer
 */
export interface GeneratedActionOption {
  /** Texto curto descrevendo a ação (3-8 palavras) */
  text: string;
  /** Probabilidade de evento positivo (0-50%) */
  goodChance: number;
  /** Probabilidade de evento negativo (0-50%) */
  badChance: number;
  /** Descrição breve do potencial benefício */
  goodHint: string;
  /** Descrição breve do potencial prejuízo */
  badHint: string;
}

/**
 * Formato da resposta esperada do prompt de opções de ação.
 *
 * @interface ActionOptionsResponse
 * @property {GeneratedActionOption[]} options - Array de exatamente 5 opções de ação
 */
export interface ActionOptionsResponse {
  options: GeneratedActionOption[];
}

/**
 * Constrói o prompt para gerar opções de ação contextuais com probabilidades.
 *
 * Este prompt instrui a IA a criar exatamente 5 ações que:
 *
 * **1. Sejam Contextuais:**
 * - Relevantes à localização atual
 * - Apropriadas à situação recente
 * - Considerem NPCs presentes
 *
 * **2. Sejam Concisas:**
 * - 3-8 palavras cada
 * - Claras e diretas
 * - Sem ambiguidade
 *
 * **3. Tenham Variedade:**
 * - Pelo menos uma opção de diálogo
 * - Pelo menos uma de exploração
 * - Opções de combate quando apropriado
 * - Uma opção cautelosa/defensiva
 *
 * **4. Incluam Probabilidades:**
 * - goodChance: 0-50% - chance de benefício
 * - badChance: 0-50% - chance de prejuízo
 * - O restante (100 - good - bad) é neutro
 *
 * **5. Forneçam Dicas:**
 * - goodHint: "encontrar tesouro", "ganhar aliado"
 * - badHint: "alertar inimigos", "acionar armadilha"
 *
 * A soma de goodChance + badChance não deve exceder 100%.
 * Ações arriscadas têm badChance maior, ações seguras menor.
 *
 * @param {ActionOptionsPromptParams} params - Parâmetros de entrada
 * @param {GameState} params.gameState - Estado atual do jogo
 * @param {Language} params.language - Idioma alvo
 *
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Em uma taverna medieval
 * const tavernPrompt = buildActionOptionsPrompt({
 *   gameState: tavernGameState,
 *   language: 'pt'
 * });
 * // Pode gerar:
 * // 1. "Falar com o taverneiro" (good: 20, bad: 5)
 * // 2. "Observar os clientes suspeitos" (good: 15, bad: 10)
 * // 3. "Pedir uma bebida" (good: 10, bad: 0)
 * // 4. "Procurar por rumores" (good: 25, bad: 15)
 * // 5. "Sair discretamente" (good: 5, bad: 5)
 *
 * // Em uma masmorra perigosa
 * const dungeonPrompt = buildActionOptionsPrompt({
 *   gameState: dungeonGameState,
 *   language: 'pt'
 * });
 * // Pode gerar:
 * // 1. "Avançar pelo corredor escuro" (good: 20, bad: 30)
 * // 2. "Examinar a porta suspeita" (good: 25, bad: 20)
 * // 3. "Preparar uma tocha" (good: 15, bad: 5)
 * // 4. "Ouvir por sons" (good: 20, bad: 10)
 * // 5. "Recuar para área segura" (good: 5, bad: 5)
 * ```
 *
 * @remarks
 * O sistema de probabilidades cria uma camada de imprevisibilidade:
 * - Ações "seguras" podem ter surpresas positivas (encontrar algo)
 * - Ações "arriscadas" podem dar muito certo ou muito errado
 * - Jogadores podem calcular risco vs. recompensa antes de agir
 */
export function buildActionOptionsPrompt({
  gameState,
  language,
}: ActionOptionsPromptParams): string {
  const langName = getLanguageName(language);
  const player: Character | undefined =
    gameState.characters[gameState.playerCharacterId];
  const currentLocation: Location | undefined =
    gameState.locations[gameState.currentLocationId];
  const recentMessages: ChatMessage[] = getRecentMessagesForPrompt(gameState.messages);

  // Get player inventory and gold
  const normalizedInventory = normalizeInventory(player?.inventory);
  const playerInventory = formatInventorySimple(normalizedInventory);
  const playerGold = player?.stats?.gold ?? 0;
  const playerHp = player?.stats?.hp ?? 100;
  const playerMaxHp = player?.stats?.maxHp ?? 100;
  const healthPercent = Math.round((playerHp / playerMaxHp) * 100);

  // Obter NPCs presentes na localização atual (excluindo o jogador)
  const npcsInLocation: Character[] = Object.values(gameState.characters).filter(
    (char) =>
      char.locationId === gameState.currentLocationId &&
      char.id !== gameState.playerCharacterId &&
      char.state !== 'dead'
  );

  // Get NPC info with inventory/gold hints
  const npcList = npcsInLocation.map(npc => {
    const npcInventory = normalizeInventory(npc.inventory);
    const hasItems = npcInventory.length > 0;
    const npcGold = npc.stats?.gold;
    return `- ${npc.name} (${npc.state}): ${npc.description}${hasItems ? ' [has items]' : ''}${npcGold ? ` [${npcGold}g]` : ''}`;
  }).join('\n') || 'No one else is here';

  // Obter localizações conectadas
  const connectedLocations: Location[] = (currentLocation?.connectedLocationIds || [])
    .map((id) => gameState.locations[id])
    .filter(Boolean);

  // Construir contexto narrativo do heavyContext
  const heavyContext = gameState.heavyContext;
  const narrativeContext: string[] = [];

  if (heavyContext?.mainMission) {
    narrativeContext.push(`Main Mission: ${heavyContext.mainMission}`);
  }
  if (heavyContext?.currentMission) {
    narrativeContext.push(`Current Objective: ${heavyContext.currentMission}`);
  }
  if (heavyContext?.activeProblems?.length) {
    narrativeContext.push(`Active Problems: ${heavyContext.activeProblems.join('; ')}`);
  }
  if (heavyContext?.currentConcerns?.length) {
    narrativeContext.push(`Current Concerns: ${heavyContext.currentConcerns.join('; ')}`);
  }
  if (heavyContext?.importantNotes?.length) {
    narrativeContext.push(`Important Notes: ${heavyContext.importantNotes.join('; ')}`);
  }

  // Check for consumables
  const consumables = normalizedInventory.filter(item => item.consumable);
  const hasHealingItems = consumables.some(item =>
    item.name.toLowerCase().includes('potion') ||
    item.name.toLowerCase().includes('heal') ||
    item.name.toLowerCase().includes('cura') ||
    item.name.toLowerCase().includes('poção')
  );

  // Build grid context section if available
  let gridContextSection = '';
  if (gameState.gridSnapshots && gameState.gridSnapshots.length > 0) {
    const latestGrid = gameState.gridSnapshots[gameState.gridSnapshots.length - 1];
    const playerPos = latestGrid.characterPositions.find((p: GridCharacterPosition) => p.isPlayer);
    const playerX = playerPos?.position.x ?? 5;
    const playerY = playerPos?.position.y ?? 5;

    // Format character positions
    const gridPositions = latestGrid.characterPositions
      .map((pos: GridCharacterPosition) => {
        const distance = pos.isPlayer
          ? ''
          : ` (${Math.abs(pos.position.x - playerX) + Math.abs(pos.position.y - playerY)} cells away)`;
        return `- @ ${pos.characterName}${pos.isPlayer ? ' [PLAYER]' : ''}: (${pos.position.x}, ${pos.position.y})${distance}`;
      })
      .join('\n');

    // Format scene elements
    let elementsText = '';
    if (latestGrid.elements && latestGrid.elements.length > 0) {
      const elementsList = latestGrid.elements
        .map((elem: GridElement) => {
          const distFromPlayer = Math.abs(elem.position.x - playerX) + Math.abs(elem.position.y - playerY);
          return `- [${elem.symbol}] ${elem.name}: (${elem.position.x}, ${elem.position.y}) - ${distFromPlayer} cells away\n    → ${elem.description}`;
        })
        .join('\n');
      elementsText = `\n\n**Scene Elements:**\n${elementsList}`;
    }

    gridContextSection = `
=== SPATIAL MAP (10x10 GRID) ===
**Characters:**
${gridPositions}
${elementsText}

**Legend:** @ = Character, [A-Z] = Interactable elements
**Proximity:** 0-1 cells = adjacent, 2-3 = nearby, 4+ = far (needs movement)
`;
  }

  return `
<role>
You are a game master assistant generating 5 contextual action options for the player.
Your mission: Create meaningful choices with calibrated risk/reward that advance the narrative.
</role>

<context>
<universe>${gameState.config.universeName}</universe>
<location>
${currentLocation?.name || 'Unknown'}: ${currentLocation?.description || ''}
${connectedLocations.length > 0 ? `Connected to: ${connectedLocations.map((loc) => loc.name).join(', ')}` : ''}
</location>

<player>
Name: ${player?.name || 'Unknown'}
Description: ${player?.description || ''}
Status: HP ${playerHp}/${playerMaxHp} (${healthPercent}%) | Gold: ${playerGold}
Inventory: ${playerInventory || 'empty'}
</player>

<npcs_present>
${npcList}
</npcs_present>
${gridContextSection}
<narrative_context>
${narrativeContext.length > 0 ? narrativeContext.join('\n') : 'No active quests or objectives'}
</narrative_context>

<recent_events>
${recentMessages.map((m) => m.text).join(' | ')}
</recent_events>
</context>

${getItemAwarenessRulesForPrompt()}

<probability_calibration>
# Risk Bands (decide band FIRST, then pick numbers)

| Band     | badChance | goodChance | Use Case |
|----------|-----------|------------|----------|
| Safe     | 0-10%     | 5-15%      | Fallback, maintenance, cautious plays |
| Moderate | 11-25%    | 16-30%     | Balanced risk/reward |
| High     | 26-40%    | 20-40%     | Bold tactical swings |
| Extreme  | 41-50%    | 30-50%     | Only when narrative stakes justify it |

Constraints:
- Each value: 0-50 (never exceed)
- goodChance + badChance ≤ 80 (leave room for neutral outcomes)
</probability_calibration>

<critical_outcomes>
# How Critical Rolls Work

When a roll lands inside badChance → CRITICAL ERROR:
- Player's intention FAILS or BACKFIRES violently
- The badHint describes the EXACT punishment the GM will enforce

When a roll lands inside goodChance → CRITICAL SUCCESS:
- Player's intention TRIUMPHS completely
- The goodHint describes the EXACT boon the GM will deliver

These critical states OVERRIDE normal resolution. Write hints as concrete outcomes.
</critical_outcomes>

<instructions>
# Reasoning Steps

Before generating each option, think through:

## Step 1: Assess the Situation
- What is the player's current state? (HP, resources, position)
- What NPCs or elements are nearby?
- What are the active objectives?

## Step 2: Design Each Option
For each of the 5 options:
1. Choose a risk band (Safe/Moderate/High/Extreme)
2. Pick numbers within that band
3. Write concrete hints for critical outcomes

## Step 3: Ensure Variety
- At least 1 dialogue option
- At least 1 exploration option
- At least 1 cautious/defensive option (Safe band only)
- If scene elements exist, 1 option interacting with them
${hasHealingItems && healthPercent < 70 ? '- PRIORITY: Player has low HP and healing items - include an option to use them!\n' : ''}

# Quality Rules
- Actions: 3-8 words, specific to current situation
- Write in ${langName}
- Prefix goodHint with "Critical Success:"
- Prefix badHint with "Critical Error:"
- High/Extreme risk options must have meaningful payoff in goodHint
- Avoid repeating phrasing from recent events
</instructions>

<output_format>
Respond with JSON only:
{
  "options": [
    {
      "text": "action text in ${langName}",
      "goodChance": 15,
      "badChance": 10,
      "goodHint": "Critical Success: [concrete benefit]",
      "badHint": "Critical Error: [concrete harm]"
    }
  ]
}
</output_format>

<reminder>
Generate exactly 5 distinct options. Each must have text, goodChance, badChance, goodHint, and badHint.
Calibrate probabilities using the band table. Make hints specific and enforceable.
</reminder>
`;
}

/**
 * JSON Schema para validação da resposta de opções de ação.
 *
 * @constant
 * @type {object}
 */
export const actionOptionsSchema = {
  type: 'object',
  properties: {
    options: {
      type: 'array',
      description: 'Array of exactly 5 action options with probabilities',
      items: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Short action text (3-8 words)',
          },
          goodChance: {
            type: 'number',
            description: 'Probability (0-50) of a beneficial event',
            minimum: 0,
            maximum: 50,
          },
          badChance: {
            type: 'number',
            description: 'Probability (0-50) of a harmful event',
            minimum: 0,
            maximum: 50,
          },
          goodHint: {
            type: 'string',
            description: 'Brief description of potential benefit',
          },
          badHint: {
            type: 'string',
            description: 'Brief description of potential harm',
          },
        },
        required: ['text', 'goodChance', 'badChance', 'goodHint', 'badHint'],
      },
      minItems: 5,
      maxItems: 5,
    },
  },
  required: ['options'],
};
