/**
 * @fileoverview Prompt de Análise de Ação Customizada
 *
 * Este módulo contém o prompt responsável por analisar ações customizadas digitadas
 * pelo jogador e calcular as probabilidades de sucesso/falha com base no contexto
 * narrativo, dificuldade e elaboração da ação.
 *
 * @module prompts/customActionAnalysis
 *
 * @description
 * O Custom Action Analysis Prompt é usado para:
 *
 * - **Analisar complexidade** - Quanto mais elaborada/difícil a ação, maior o risco
 * - **Considerar contexto** - Usar o heavyContext para avaliar viabilidade
 * - **Calcular probabilidades** - Definir goodChance e badChance (0-50)
 * - **Prover dicas** - Indicar o que pode acontecer de bom ou ruim
 *
 * Este prompt usa temperatura 0 para evitar que o jogador possa "burlar"
 * o sistema tentando várias vezes até conseguir uma taxa favorável.
 */

import { GameState, Language, Character, Location, HeavyContext, GridCharacterPosition } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { getRecentMessagesForPrompt } from './helpers';

/**
 * Parâmetros necessários para construir o prompt de análise de ação customizada.
 */
export interface CustomActionAnalysisParams {
  /** Estado completo do jogo incluindo heavyContext */
  gameState: GameState;
  /** A ação customizada digitada pelo jogador */
  customAction: string;
  /** Idioma para geração das dicas */
  language: Language;
}

/**
 * Resposta da análise de ação customizada.
 */
export interface CustomActionAnalysisResponse {
  /** Probabilidade de evento positivo (0-50%) */
  goodChance: number;
  /** Probabilidade de evento negativo (0-50%) */
  badChance: number;
  /** Descrição breve do potencial benefício */
  goodHint: string;
  /** Descrição breve do potencial prejuízo */
  badHint: string;
  /** Breve explicação do porquê das taxas atribuídas */
  reasoning: string;
}

/**
 * Constrói o prompt para analisar uma ação customizada e calcular suas probabilidades.
 *
 * Este prompt instrui a IA a avaliar:
 *
 * **1. Complexidade da Ação:**
 * - Ações simples (olhar, esperar) = baixo risco
 * - Ações elaboradas (plano complexo) = alto risco/recompensa
 * - Ações impossíveis/absurdas = muito alto risco
 *
 * **2. Contexto Narrativo:**
 * - Considerar localização atual e perigos
 * - Considerar estado do personagem e recursos
 * - Considerar problemas ativos e preocupações
 *
 * **3. Viabilidade:**
 * - O personagem tem os recursos necessários?
 * - A ação faz sentido no contexto?
 * - É fisicamente/magicamente possível?
 *
 * **4. Dificuldade vs Recompensa:**
 * - Ações arriscadas podem ter alta recompensa
 * - Ações seguras têm baixo potencial de ambos
 * - Equilibrar risco/recompensa baseado na elaboração
 */
export function buildCustomActionAnalysisPrompt({
  gameState,
  customAction,
  language,
}: CustomActionAnalysisParams): string {
  const langName = getLanguageName(language);
  const player: Character | undefined =
    gameState.characters[gameState.playerCharacterId];
  const currentLocation: Location | undefined =
    gameState.locations[gameState.currentLocationId];

  // Format heavy context for analysis
  const heavyContext: HeavyContext = gameState.heavyContext || {};
  const heavyContextSection = heavyContext.mainMission || heavyContext.currentMission
    ? `
=== NARRATIVE CONTEXT (HEAVY CONTEXT) ===
Main Mission: ${heavyContext.mainMission || 'None'}
Current Mission: ${heavyContext.currentMission || 'None'}
Active Problems: ${(heavyContext.activeProblems || []).join(' | ') || 'None'}
Current Concerns: ${(heavyContext.currentConcerns || []).join(' | ') || 'None'}
Important Notes: ${(heavyContext.importantNotes || []).join(' | ') || 'None'}
`
    : '';

  // Get recent messages for context
  const recentMessages = getRecentMessagesForPrompt(gameState.messages);
  const recentMessagesText = recentMessages
    .map((m) => `[${m.senderId}]: ${m.text}`)
    .join('\n');

  // Get player stats and inventory
  const playerStats = player?.stats
    ? Object.entries(player.stats)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : 'Unknown';
  const playerInventory = player?.inventory?.length
    ? player.inventory.join(', ')
    : 'Empty';

  // Build grid context section if available
  let gridContextSection = '';
  if (gameState.gridSnapshots && gameState.gridSnapshots.length > 0) {
    const latestGrid = gameState.gridSnapshots[gameState.gridSnapshots.length - 1];
    const playerPosition = latestGrid.characterPositions.find((p: GridCharacterPosition) => p.isPlayer);
    const gridPositions = latestGrid.characterPositions
      .map((pos: GridCharacterPosition) => {
        if (pos.isPlayer) return `- ${pos.characterName} [PLAYER]: (${pos.position.x}, ${pos.position.y})`;
        const distance = playerPosition
          ? Math.abs(pos.position.x - playerPosition.position.x) + Math.abs(pos.position.y - playerPosition.position.y)
          : 0;
        return `- ${pos.characterName}: (${pos.position.x}, ${pos.position.y}) - ${distance} cells from player`;
      })
      .join('\n');

    gridContextSection = `
=== SPATIAL POSITIONS (10x10 GRID) ===
${gridPositions}
(Consider distances: 0-1 cells = close range, 2-3 cells = medium range, 4+ cells = far)
`;
  }

  return `
<role>
You are a game master analyzing a custom player action to determine success/failure probabilities.
Your mission: Evaluate the action consistently and return calibrated probabilities.
</role>

<context>
<universe>${gameState.config.universeName} (${gameState.config.universeType})</universe>
<location>${currentLocation?.name || 'Unknown'} - ${currentLocation?.description || 'No description'}</location>
<player>
Name: ${player?.name || 'Unknown'}
Description: ${player?.description || 'No description'}
Stats: ${playerStats}
Inventory: ${playerInventory}
State: ${player?.state || 'Unknown'}
</player>
${heavyContextSection}${gridContextSection}
<recent_events>
${recentMessagesText}
</recent_events>
</context>

<action_to_analyze>
"${customAction}"
</action_to_analyze>

<instructions>
# Analysis Steps

Follow these steps to determine probabilities:

## Step 1: Assess Complexity/Difficulty
| Action Type | goodChance | badChance |
|-------------|------------|-----------|
| Simple (look, wait, talk) | 5-15 | 0-10 |
| Moderate (search, negotiate) | 10-25 | 10-20 |
| Complex (elaborate plans) | 20-40 | 20-40 |
| Extremely difficult | 30-50 | 30-50 |
| Impossible/absurd | 5-15 | 40-50 |

## Step 2: Check Feasibility
- Does player have required items/skills?
- Is action appropriate for location?
- Does it align with character capabilities?
- Consider active problems and dangers

## Step 3: Evaluate Elaboration
- Vague actions: lower chances (more neutral)
- Detailed/specific: higher potential for both
- Over-complicated: higher badChance (more failure points)

## Step 4: Resource Check
- Missing required items → increase badChance significantly
- Using player's strengths → increase goodChance
- Against player's weaknesses → increase badChance

## Step 5: Spatial Positioning (if grid available)
- Distant targets (4+ cells) → harder
- Close range (0-1 cells) → more reliable
- Nearby enemies → stealth harder

## Step 6: Apply Constraints
- goodChance: 0-50 (max)
- badChance: 0-50 (max)
- Sum typically ≤ 70 (leave room for neutral)
</instructions>

<output_format>
Respond with JSON only:
{
  "goodChance": [0-50],
  "badChance": [0-50],
  "goodHint": "[benefit description in ${langName}]",
  "badHint": "[harm description in ${langName}]",
  "reasoning": "[1-2 sentence explanation in ${langName}]"
}
</output_format>

<reminder>
- Be DETERMINISTIC: same action + context = same probabilities
- Write hints and reasoning in ${langName}
- If action seems impossible, still provide low goodChance (not zero) for dramatic luck
</reminder>
`;
}

/**
 * JSON Schema para validação da resposta de análise de ação customizada.
 */
export const customActionAnalysisSchema = {
  type: 'object',
  properties: {
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
    reasoning: {
      type: 'string',
      description: 'Brief explanation of why these probabilities were assigned',
    },
  },
  required: ['goodChance', 'badChance', 'goodHint', 'badHint', 'reasoning'],
};
