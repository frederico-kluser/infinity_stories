/**
 * @fileoverview Prompt de Atualização do Grid - Sistema de Mapa 10x10
 *
 * Este módulo contém o prompt responsável por analisar as ações do jogo
 * e determinar as posições dos personagens e elementos no grid 10x10 do mapa.
 *
 * @module prompts/gridUpdate
 *
 * @description
 * O Grid Update Prompt é usado após cada ação do jogo para:
 *
 * - **Determinar posições** - Calcular onde cada personagem está no grid 10x10
 * - **Identificar elementos** - Detectar objetos/elementos mencionados na cena (portas, baús, etc.)
 * - **Considerar movimento** - Analisar se a ação causou movimentação
 * - **Manter consistência** - Garantir que posições façam sentido na narrativa
 * - **Atualizar apenas quando necessário** - Só retornar update se houve mudança
 *
 * @example
 * ```typescript
 * import { buildGridUpdatePrompt } from './prompts/gridUpdate.prompt';
 *
 * const prompt = buildGridUpdatePrompt({
 *   gameState,
 *   recentMessages,
 *   language: 'pt'
 * });
 * ```
 */

import { GameState, Language, GMResponseMessage, GridCharacterPosition, GridElement } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';

/**
 * Parameters for building the grid update prompt.
 */
export interface GridUpdatePromptParams {
  /** Current game state */
  gameState: GameState;
  /** Recent messages from the last action (what just happened) */
  recentMessages: GMResponseMessage[];
  /** Event log summary from the GM response */
  eventLog?: string;
  /** Current grid positions (if any exist) */
  currentGridPositions?: GridCharacterPosition[];
  /** Current grid elements (if any exist) */
  currentElements?: GridElement[];
  /** Language for the prompt */
  language: Language;
}

/**
 * Builds the prompt for updating character positions and scene elements on the 10x10 grid map.
 *
 * The AI should analyze the recent action and determine if character positions
 * and scene elements should be updated based on:
 * - Physical movement mentioned in narration
 * - Characters approaching or moving away from each other
 * - Environmental context changes
 * - Combat positioning
 * - New elements/objects mentioned in the scene
 *
 * @param params - Parameters for the prompt
 * @returns The formatted prompt string
 */
export function buildGridUpdatePrompt({
  gameState,
  recentMessages,
  eventLog,
  currentGridPositions,
  currentElements,
  language,
}: GridUpdatePromptParams): string {
  const langName = getLanguageName(language);
  const currentLocation = gameState.locations[gameState.currentLocationId];

  // Get all characters at current location
  const charactersAtLocation = Object.values(gameState.characters).filter(
    (c) => c.locationId === gameState.currentLocationId
  );

  // Format recent messages for context
  const messagesContext = recentMessages
    .map((m) => {
      if (m.type === 'narration') {
        return `[Narration]: ${m.text}`;
      } else if (m.type === 'dialogue') {
        return `[${m.characterName}]: ${m.dialogue}`;
      } else {
        return `[System]: ${m.text}`;
      }
    })
    .join('\n');

  // Format current positions if they exist
  let currentPositionsText = 'No previous positions recorded (this is the initial placement).';
  if (currentGridPositions && currentGridPositions.length > 0) {
    currentPositionsText = currentGridPositions
      .map((p) => `- ${p.characterName}: (${p.position.x}, ${p.position.y})${p.isPlayer ? ' [PLAYER]' : ''}`)
      .join('\n');
  }

  // Format current elements if they exist
  let currentElementsText = 'No elements recorded yet.';
  if (currentElements && currentElements.length > 0) {
    currentElementsText = currentElements
      .map((e) => `- [${e.symbol}] ${e.name}: (${e.position.x}, ${e.position.y}) - ${e.description}`)
      .join('\n');
  }

  // Format characters at location
  const charactersText = charactersAtLocation
    .map((c) => `- ${c.name} (ID: ${c.id})${c.isPlayer ? ' [PLAYER]' : ''}: ${c.description.substring(0, 100)}...`)
    .join('\n');

  return `
<role>
You are a PROACTIVE spatial positioning analyzer for an RPG game.
Your mission: Make the 10x10 grid map ALIVE and RICH with elements from the narrative.
An EMPTY or SPARSE map is a FAILURE.
</role>

<context>
<location>
Name: ${currentLocation?.name || 'Unknown'}
Description: ${currentLocation?.description || 'No description'}
</location>
<language>${langName}</language>

<characters_at_location>
${charactersText}
</characters_at_location>

<current_grid_state>
<character_positions>
${currentPositionsText}
</character_positions>

<scene_elements>
${currentElementsText}
</scene_elements>
</current_grid_state>

<recent_events>
${eventLog ? `Event Summary: ${eventLog}\n` : ''}
${messagesContext}
</recent_events>
</context>

<instructions>
# Element Extraction Steps

## Step 1: Scan Location Description
Extract ALL physical features:
- Furniture: tables, chairs, beds, thrones, counters, shelves
- Structures: doors, windows, stairs, pillars, arches, walls
- Nature: trees, rocks, bushes, water, fire pits, gardens
- Interactive: chests, levers, switches, altars, pedestals
- Ambient: torches, lamps, fountains, statues, paintings

## Step 2: Scan Recent Messages
Look for objects mentioned:
- Characters interacting with something → ADD IT
- Environment details → ADD THEM
- NPCs near objects → ADD THOSE OBJECTS
- Combat references → ADD weapons, obstacles, cover

## Step 3: Check for Movement/Changes
- Character moved → include new position
- Element destroyed/transformed → removedElements + add replacement
- New character entered → add with initial position

# Delta-Only Response
Return ONLY items that are NEW or CHANGED.
If map is EMPTY but narrative describes a rich scene → POPULATE IT!
</instructions>

<grid_rules>
- Grid: 10x10 (coordinates 0-9)
- x=0 left, x=9 right
- y=0 top, y=9 bottom
- Characters can share cells
- Elements should NOT overlap
- Movement: 1-3 cells per action
</grid_rules>

<location_templates>
| Location | Common Elements |
|----------|----------------|
| Tavern/Inn | [B] Bar, [T] Tables, [F] Fireplace, [S] Stairs, [D] Door |
| Forest | [T] Trees, [R] Rocks, [B] Bushes, [P] Path, [S] Stream |
| Cave/Dungeon | [R] Rocks, [P] Pillars, [C] Chest, [A] Altar, [D] Door |
| Castle | [T] Throne, [P] Pillars, [B] Banners, [G] Guards, [D] Doors |
| Market | [S] Stalls, [F] Fountain, [C] Carts, [B] Barrels, [W] Well |
| Library | [B] Bookshelves, [D] Desk, [C] Candles, [G] Globe, [S] Scrolls |
</location_templates>

<transformation_rules>
When an element changes state:
1. REMOVE original (add symbol to "removedElements")
2. ADD transformed element(s) with NEW symbol

Examples:
- Tree cut → [T] removed, add [S] Stump + [L] Fallen Log
- Chest opened → [C] removed, add [O] Open Chest
- Door broken → [D] removed, add [B] Broken Door
- Debris/byproducts go ADJACENT to original, AWAY from player
</transformation_rules>

<examples>
## Example 1: Populating Empty Map
Location: "A tavern with fireplace, tables, and bar counter"
Current elements: None

Response:
{
  "shouldUpdate": true,
  "elements": [
    { "symbol": "D", "name": "Door", "description": "Tavern entrance", "x": 5, "y": 9 },
    { "symbol": "F", "name": "Fireplace", "description": "Stone fireplace with flames", "x": 1, "y": 2 },
    { "symbol": "B", "name": "Bar Counter", "description": "Long wooden bar", "x": 7, "y": 2 }
  ],
  "reasoning": "Populated tavern from description"
}

## Example 2: Transformation
Narrative: "You cut down the oak tree. It falls east."
Current: [T] Oak Tree at (5,5), Player at (4,5)

Response:
{
  "shouldUpdate": true,
  "elements": [
    { "symbol": "S", "name": "Tree Stump", "description": "Remains of cut tree", "x": 5, "y": 5 },
    { "symbol": "L", "name": "Fallen Log", "description": "Oak log for lumber", "x": 6, "y": 5 }
  ],
  "removedElements": ["T"],
  "reasoning": "Tree cut. Stump at original position. Log fell east (away from player)."
}
</examples>

<output_format>
Respond with JSON only:
{
  "shouldUpdate": true|false,
  "characterPositions": [{ "characterId": "...", "characterName": "...", "x": 0-9, "y": 0-9, "isPlayer": true|false }],
  "elements": [{ "symbol": "A-Z", "name": "...", "description": "...", "x": 0-9, "y": 0-9 }],
  "removedElements": ["A", "B"],
  "reasoning": "..."
}
</output_format>

<reminder>
- Empty map in described scene = WRONG
- Always extract elements from location description
- Use intuitive symbols: D=Door, C=Chest, T=Table/Tree, W=Water, F=Fire
- Delta only: include only NEW or CHANGED items
</reminder>
`;
}

/**
 * JSON Schema for the grid update response.
 */
export const gridUpdateSchema = {
  type: 'object',
  properties: {
    shouldUpdate: {
      type: 'boolean',
      description: 'Whether the grid should be updated based on recent events',
    },
    characterPositions: {
      type: 'array',
      description: 'DELTA ONLY: Array of characters whose positions CHANGED. Only include characters that moved, not all characters.',
      items: {
        type: 'object',
        properties: {
          characterId: {
            type: 'string',
            description: 'The unique ID of the character',
          },
          characterName: {
            type: 'string',
            description: 'The display name of the character',
          },
          x: {
            type: 'number',
            minimum: 0,
            maximum: 9,
            description: 'NEW X coordinate on the grid (0-9, left to right)',
          },
          y: {
            type: 'number',
            minimum: 0,
            maximum: 9,
            description: 'NEW Y coordinate on the grid (0-9, top to bottom)',
          },
          isPlayer: {
            type: 'boolean',
            description: 'Whether this is the player character',
          },
        },
        required: ['characterId', 'characterName', 'x', 'y', 'isPlayer'],
      },
    },
    elements: {
      type: 'array',
      description: 'DELTA ONLY: Array of NEW or MOVED elements. Only include elements that were added or changed position.',
      items: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            pattern: '^[A-Z]$',
            description: 'Single capital letter (A-Z) to display on grid',
          },
          name: {
            type: 'string',
            description: 'Short name of the element (e.g., "Oak Door", "Treasure Chest")',
          },
          description: {
            type: 'string',
            description: 'Description shown in popup when clicked',
          },
          x: {
            type: 'number',
            minimum: 0,
            maximum: 9,
            description: 'X coordinate on the grid (0-9, left to right)',
          },
          y: {
            type: 'number',
            minimum: 0,
            maximum: 9,
            description: 'Y coordinate on the grid (0-9, top to bottom)',
          },
        },
        required: ['symbol', 'name', 'description', 'x', 'y'],
      },
    },
    removedElements: {
      type: 'array',
      description: 'Array of element symbols (A-Z) that were destroyed or removed from the scene',
      items: {
        type: 'string',
        pattern: '^[A-Z]$',
        description: 'Symbol of the element to remove',
      },
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of what changed (e.g., "Player moved north", "Chest D was opened and removed")',
    },
  },
  required: ['shouldUpdate'],
};

/**
 * Response type from the grid update prompt.
 * Note: This is a DELTA response - only contains items that CHANGED.
 */
export interface GridUpdateResponse {
  shouldUpdate: boolean;
  /** Characters whose positions CHANGED (delta only) */
  characterPositions?: {
    characterId: string;
    characterName: string;
    x: number;
    y: number;
    isPlayer: boolean;
  }[];
  /** NEW or MOVED elements (delta only) */
  elements?: {
    symbol: string;
    name: string;
    description: string;
    x: number;
    y: number;
  }[];
  /** Symbols of elements that were REMOVED from the scene */
  removedElements?: string[];
  reasoning?: string;
}
