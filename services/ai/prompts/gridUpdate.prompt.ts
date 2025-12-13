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
You are a PROACTIVE spatial positioning analyzer for an RPG game.
Your MISSION is to make the 10x10 grid map ALIVE and RICH with elements from the narrative.

=== CURRENT CONTEXT ===
Location: ${currentLocation?.name || 'Unknown'}
Description: ${currentLocation?.description || 'No description'}
Language: ${langName}

=== CHARACTERS AT THIS LOCATION ===
${charactersText}

=== CURRENT GRID STATE ===
**Character Positions:**
${currentPositionsText}

**Scene Elements (currently on map):**
${currentElementsText}

=== WHAT JUST HAPPENED ===
${eventLog ? `Event Summary: ${eventLog}\n` : ''}
Recent messages:
${messagesContext}

=== YOUR MISSION: EXTRACT ALL NARRATIVE ELEMENTS ===
You must ACTIVELY SCAN the narrative and location description for ANY elements that should appear on the map.
An EMPTY or SPARSE map is a FAILURE. The map should visually represent the scene!

**STEP 1: SCAN FOR ELEMENTS IN LOCATION DESCRIPTION**
Read the location description above. Extract ALL physical features:
- Furniture: tables, chairs, beds, thrones, counters, shelves
- Structures: doors, windows, stairs, pillars, arches, walls
- Nature: trees, rocks, bushes, water, fire pits, gardens
- Interactive: chests, levers, switches, altars, pedestals
- Ambient: torches, lamps, fountains, statues, paintings

**STEP 2: SCAN FOR ELEMENTS IN RECENT MESSAGES**
Read the narration for ANY objects mentioned:
- Characters interacting with something? ADD IT (the sword, the potion, the book)
- Environment details? ADD THEM (the old well, the mysterious stone, the ancient altar)
- NPCs near objects? ADD THOSE OBJECTS
- Combat references? ADD weapons, obstacles, cover

**STEP 3: SCAN FOR CHARACTERS/CREATURES**
Look for beings that should appear on the map:
- NPCs mentioned but not in character list (add as elements with @ prefix or letter)
- Creatures: wolves, dragons, spiders, ghosts
- Groups: guards, bandits, villagers watching from distance

**CRITICAL: DELTA-ONLY RESPONSE**
Return ONLY items that are NEW or CHANGED:
- New elements mentioned in narrative that aren't on map yet → ADD them
- Character moved → include new position
- Element destroyed/transformed → add to removedElements + add replacement
- If map is EMPTY but narrative describes a rich scene → ADD ELEMENTS!

**GRID RULES:**
- Grid is 10x10 (coordinates 0-9 for x and y)
- x=0 is left, x=9 is right
- y=0 is top, y=9 is bottom
- Characters can share cells (conversation range)
- Elements should NOT overlap each other
- Movement: 1-3 cells per action typically

**COMMON ELEMENTS BY LOCATION TYPE:**
- **Tavern/Inn**: [B] Bar Counter, [T] Tables, [F] Fireplace, [S] Stairs, [D] Door, [K] Kitchen
- **Forest**: [T] Trees, [R] Rocks, [B] Bushes, [P] Path, [S] Stream, [C] Campfire
- **Cave/Dungeon**: [R] Rocks, [P] Pillars, [C] Chest, [A] Altar, [D] Door, [W] Web
- **Castle/Throne**: [T] Throne, [P] Pillars, [B] Banners, [G] Guards, [D] Doors
- **Market/Town**: [S] Stalls, [F] Fountain, [C] Carts, [B] Barrels, [W] Well
- **Beach/Shore**: [R] Rocks, [B] Boat, [D] Driftwood, [S] Shells, [W] Waves
- **Library/Study**: [B] Bookshelves, [D] Desk, [C] Candles, [G] Globe, [S] Scrolls

**WHEN TO UPDATE (BE PROACTIVE!):**
- Map is empty/sparse but location has described features → ADD ELEMENTS
- New object mentioned in narrative (even briefly) → ADD IT
- Character moves or enters scene → UPDATE POSITIONS
- Element transformed (opened, broken, burned) → REMOVE + ADD new state
- Scene feels incomplete → ADD ambient elements from location type

**ELEMENT SYMBOLS:**
- Use intuitive letters: D=Door, C=Chest, T=Table/Tree, W=Well/Water, F=Fire, B=Barrel/Bar
- If letter is taken, use next available
- Be creative but consistent

**ELEMENT TRANSFORMATION (CRITICAL):**
When an element changes state but doesn't disappear completely, you must:
1. REMOVE the original element (add its symbol to "removedElements")
2. ADD the transformed element(s) with NEW symbol(s) and updated description

Examples of transformations:
- **Tree cut down**: Remove [T] "Oak Tree", Add [S] "Tree Stump" (same position) + [L] "Fallen Log" (adjacent cell)
- **Chest opened**: Remove [C] "Locked Chest", Add [O] "Open Chest" (same position, new description)
- **Door broken**: Remove [D] "Wooden Door", Add [B] "Broken Door" (same position)
- **Barrel smashed**: Remove [B] "Barrel", Add [D] "Debris" (same position) - contents may spawn nearby
- **Fire started on haystack**: Remove [H] "Haystack", Add [F] "Burning Haystack" (same position)
- **Lever pulled**: Keep same symbol but update description to reflect new state

When something is cut/broken and creates debris or byproducts:
- Place the main remnant in the SAME position as the original
- Place secondary pieces (logs, debris, shards) in ADJACENT cells (choose a logical direction)
- If player cut something, fallen piece typically falls AWAY from player

**CHARACTER OUTPUT RULES (DELTA ONLY):**
- Return ONLY characters whose position CHANGED
- Do NOT include characters that stayed in the same place
- For new characters entering the scene, include them with their initial position
- Always set isPlayer=true for the player character

**ELEMENT OUTPUT RULES (DELTA ONLY):**
- Return ONLY new elements, transformed elements, or elements that MOVED
- Use "removedElements" array to list symbols of elements that were destroyed/removed/transformed
- When transforming: FIRST add to removedElements, THEN add new element(s) to elements array
- Do NOT repeat elements that haven't changed

**POSITIONING GUIDELINES:**
- Player character should generally be near the center (around 4-5, 4-5) initially
- NPCs in conversation should be within 1-2 cells of each other
- Hostile NPCs might be further away (3-5 cells)
- Place elements logically: doors near edges, tables/furniture toward center, etc.
- When placing fallen/broken pieces, consider physics (things fall down, roll away, etc.)

Respond with a JSON object following the schema.
IMPORTANT: If the map is EMPTY but the scene has described elements, you MUST populate it!

**EXAMPLE 1 - POPULATING AN EMPTY MAP:**
Location: "The Dragon's Breath Tavern - A cozy tavern with a large fireplace, wooden tables scattered about, and a long bar counter where the innkeeper serves drinks. Stairs lead to the upper rooms."
Current elements: None
Narrative: "You enter the tavern. The warmth of the fire greets you as you notice the innkeeper polishing glasses behind the bar."

Response:
{
  "shouldUpdate": true,
  "characterPositions": [
    { "characterId": "player_1", "characterName": "Hero", "x": 5, "y": 8, "isPlayer": true }
  ],
  "elements": [
    { "symbol": "D", "name": "Tavern Door", "description": "The entrance to the Dragon's Breath Tavern.", "x": 5, "y": 9 },
    { "symbol": "F", "name": "Fireplace", "description": "A large stone fireplace crackling with warm flames.", "x": 1, "y": 2 },
    { "symbol": "B", "name": "Bar Counter", "description": "A long wooden bar where drinks are served.", "x": 7, "y": 2 },
    { "symbol": "T", "name": "Wooden Table", "description": "A sturdy oak table with chairs around it.", "x": 3, "y": 5 },
    { "symbol": "S", "name": "Stairs", "description": "Wooden stairs leading up to the guest rooms.", "x": 9, "y": 3 }
  ],
  "removedElements": [],
  "reasoning": "Populated tavern with elements from description: door at entrance, fireplace on left, bar on right, table in center, stairs to upper floor."
}

**EXAMPLE 2 - DETECTING ELEMENTS FROM NARRATIVE:**
Narrative: "The old wizard stands near a glowing crystal pedestal, ancient runes carved into the stone floor around it. A mysterious orb floats above the crystal."
Current elements: None

Response:
{
  "shouldUpdate": true,
  "characterPositions": [],
  "elements": [
    { "symbol": "P", "name": "Crystal Pedestal", "description": "An ancient pedestal with a glowing crystal, pulsing with arcane energy.", "x": 5, "y": 4 },
    { "symbol": "O", "name": "Floating Orb", "description": "A mysterious orb that hovers above the crystal, emanating soft light.", "x": 5, "y": 3 },
    { "symbol": "R", "name": "Carved Runes", "description": "Ancient magical runes carved into the stone floor in a circular pattern.", "x": 5, "y": 5 }
  ],
  "removedElements": [],
  "reasoning": "Extracted narrative elements: wizard's crystal pedestal, floating orb, and floor runes. These are key interactive elements."
}

**EXAMPLE 3 - TRANSFORMATION:**
Narrative: "You swing your axe and cut down the oak tree. It falls to the east with a loud crash."
Current state: [T] Oak Tree at (5, 5), Player at (4, 5)

Response:
{
  "shouldUpdate": true,
  "characterPositions": [],
  "elements": [
    { "symbol": "S", "name": "Tree Stump", "description": "The remains of the oak tree you cut down. Fresh sawdust surrounds it.", "x": 5, "y": 5 },
    { "symbol": "L", "name": "Fallen Oak Log", "description": "A large oak log that fell when you cut the tree. Could be used for lumber.", "x": 6, "y": 5 }
  ],
  "removedElements": ["T"],
  "reasoning": "Tree was cut down. Stump remains at original position. Log fell eastward (away from player at x=4)."
}

**REMEMBER: An empty map in a described scene is WRONG. Always extract elements!**
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
