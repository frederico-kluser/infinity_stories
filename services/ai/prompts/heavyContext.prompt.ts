/**
 * @fileoverview Prompt de Heavy Context - Memória Narrativa Persistente
 *
 * Este módulo contém o prompt responsável por analisar eventos recentes do jogo
 * e atualizar o contexto narrativo pesado (Heavy Context) que persiste entre turnos.
 * Funciona como a "memória de longo prazo" do Game Master.
 *
 * @module prompts/heavyContext
 *
 * @description
 * O Heavy Context Prompt é usado para:
 *
 * - **Analisar eventos** - Examinar o que aconteceu no último turno
 * - **Atualizar missões** - Diferenciar missão principal (longa) da missão atual (curto prazo)
 * - **Rastrear problemas** - Manter lista de conflitos/perigos ativos
 * - **Registrar preocupações** - Lembrar de ameaças ou coisas a observar
 * - **Notas importantes** - Guardar elementos narrativos relevantes
 *
 * Este contexto é incluído em cada prompt do Game Master para manter
 * continuidade narrativa e coerência ao longo de sessões longas.
 *
 * @example
 * ```typescript
 * import { buildHeavyContextPrompt } from './prompts/heavyContext.prompt';
 *
 * const prompt = buildHeavyContextPrompt({
 *   gameState,
 *   recentResponse: {
 *     messages: [...],
 *     eventLog: 'Player discovered a secret passage'
 *   },
 *   language: 'pt'
 * });
 * ```
 *
 * @see {@link HeavyContextPromptParams} - Parâmetros aceitos pela função
 * @see {@link HeavyContextResponse} - Formato da resposta esperada
 */

import { GameState, Language, HeavyContext, Character, Location } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { NarrativeThread, PacingLevel, PacingState } from './narrativeStyles';

/**
 * Mensagem recente do jogo para análise de contexto.
 *
 * @interface RecentMessage
 */
export interface RecentMessage {
  senderName: string;
  text: string;
  type: string;
}

/**
 * Resposta recente do Game Master para análise.
 *
 * @interface RecentResponse
 */
export interface RecentResponse {
  messages: RecentMessage[];
  eventLog?: string;
}

/**
 * Parâmetros necessários para construir o prompt de Heavy Context.
 *
 * @interface HeavyContextPromptParams
 * @property {GameState} gameState - Estado completo do jogo incluindo contexto atual
 * @property {RecentResponse} recentResponse - Resposta do GM do último turno
 * @property {Language} language - Idioma para geração de texto
 * @property {NarrativeThread[]} [narrativeThreads] - Threads narrativas existentes
 * @property {PacingState} [pacingState] - Estado atual do ritmo narrativo
 */
export interface HeavyContextPromptParams {
  /** Estado completo do jogo com o contexto pesado atual */
  gameState: GameState;
  /** Mensagens e eventos do turno recente para análise */
  recentResponse: RecentResponse;
  /** Idioma no qual o contexto deve ser gerado */
  language: Language;
  /** Threads narrativas existentes (foreshadowing, callbacks, Chekhov's guns) */
  narrativeThreads?: NarrativeThread[];
  /** Estado atual do ritmo narrativo */
  pacingState?: PacingState;
}

/**
 * A IA agora retorna uma lista de modificações (diff) por seção, ao invés de
 * substituir todo o Heavy Context de uma vez.
 */
export type HeavyContextFieldAction = 'set' | 'clear';
export type HeavyContextListAction = 'add' | 'remove';

export interface HeavyContextFieldChange {
  action: HeavyContextFieldAction;
  value?: string;
}

export interface HeavyContextListChange {
  action: HeavyContextListAction;
  value: string;
}

export interface HeavyContextChanges {
  mainMission?: HeavyContextFieldChange;
  currentMission?: HeavyContextFieldChange;
  activeProblems?: HeavyContextListChange[];
  currentConcerns?: HeavyContextListChange[];
  importantNotes?: HeavyContextListChange[];
}

/**
 * Mudanças em threads narrativas (foreshadowing/callbacks).
 */
export interface NarrativeThreadChange {
  action: 'plant' | 'reference' | 'resolve' | 'remove';
  thread: {
    id?: string;
    type: 'foreshadowing' | 'callback' | 'chekhov_gun';
    description: string;
    importance: 'minor' | 'moderate' | 'major';
  };
}

/**
 * Análise de pacing/ritmo da cena atual.
 */
export interface PacingAnalysis {
  currentLevel: PacingLevel;
  trend: 'rising' | 'falling' | 'stable';
  recommendation?: string;
}

export interface HeavyContextResponse {
  shouldUpdate: boolean;
  changes?: HeavyContextChanges;
  /** Mudanças em threads narrativas (foreshadowing, callbacks, Chekhov's guns) */
  narrativeThreadChanges?: NarrativeThreadChange[];
  /** Análise do ritmo/pacing atual da história */
  pacingAnalysis?: PacingAnalysis;
}

/**
 * Constrói o prompt para analisar eventos recentes e atualizar o Heavy Context.
 *
 * Este prompt instrui a IA a:
 *
 * **1. Analisar Eventos Recentes:**
 * - Examinar mensagens e diálogos do último turno
 * - Considerar o eventLog como resumo do que aconteceu
 * - Comparar com o contexto atual
 *
 * **2. Determinar Necessidade de Atualização:**
 * - Ser conservador - só atualizar quando há mudanças significativas
 * - Eventos triviais NÃO devem disparar atualização
 * - Mudanças de missão, novos perigos, revelações importantes SIM
 *
 * **3. Atualizar Campos Apropriadamente:**
 * - mainMission: Objetivo macro ou arco de campanha (pode ser longo)
 * - currentMission: Objetivo imediato (limpar se completado)
 * - activeProblems: Conflitos, perigos, obstáculos ativos
 * - currentConcerns: Preocupações, medos, coisas a observar
 * - importantNotes: Elementos narrativos importantes a lembrar
 *
 * **4. Manter Brevidade:**
 * - Entradas concisas (1-2 frases máx)
 * - Máximo 5 itens por array
 * - Remover problemas/preocupações resolvidos
 *
 * @param {HeavyContextPromptParams} params - Parâmetros de entrada
 * @param {GameState} params.gameState - Estado atual do jogo
 * @param {RecentResponse} params.recentResponse - Eventos recentes
 * @param {Language} params.language - Idioma alvo
 *
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Após uma batalha importante
 * const battlePrompt = buildHeavyContextPrompt({
 *   gameState: currentGameState,
 *   recentResponse: {
 *     messages: [
 *       { senderName: 'Narrator', text: 'O dragão cai derrotado!', type: 'narration' },
 *       { senderName: 'Villager', text: 'Você nos salvou, herói!', type: 'dialogue' }
 *     ],
 *     eventLog: 'Player defeated the dragon, village saved'
 *   },
 *   language: 'pt'
 * });
 * // Deve atualizar: missão completada, novo status de herói
 *
 * // Após uma conversa casual
 * const chatPrompt = buildHeavyContextPrompt({
 *   gameState: currentGameState,
 *   recentResponse: {
 *     messages: [
 *       { senderName: 'Bartender', text: 'Mais uma bebida?', type: 'dialogue' }
 *     ],
 *     eventLog: 'Player ordered a drink'
 *   },
 *   language: 'pt'
 * });
 * // NÃO deve atualizar - evento trivial
 * ```
 */
export function buildHeavyContextPrompt({
  gameState,
  recentResponse,
  language,
  narrativeThreads,
  pacingState,
}: HeavyContextPromptParams): string {
  const langName = getLanguageName(language);
  const currentLocation: Location | undefined =
    gameState.locations[gameState.currentLocationId];
  const player: Character | undefined =
    gameState.characters[gameState.playerCharacterId];

  // Format current heavy context for the LLM
  const currentContext: HeavyContext = gameState.heavyContext || {};
  const contextSummary = `
CURRENT HEAVY CONTEXT:
- Main Mission: ${currentContext.mainMission || 'None defined'}
- Current Mission: ${currentContext.currentMission || 'None defined'}
- Active Problems: ${(currentContext.activeProblems || []).join(', ') || 'None'}
- Current Concerns: ${(currentContext.currentConcerns || []).join(', ') || 'None'}
- Important Notes: ${(currentContext.importantNotes || []).join(', ') || 'None'}
`;

  // Format narrative threads section
  let narrativeThreadsSection = '';
  if (narrativeThreads && narrativeThreads.length > 0) {
    const threadsByStatus = {
      planted: narrativeThreads.filter((t) => t.status === 'planted'),
      referenced: narrativeThreads.filter((t) => t.status === 'referenced'),
      resolved: narrativeThreads.filter((t) => t.status === 'resolved'),
    };

    narrativeThreadsSection = `
NARRATIVE THREADS (Foreshadowing, Callbacks, Chekhov's Guns):
- Planted (waiting to be paid off):
${threadsByStatus.planted.map((t) => `  * [${t.type}] ${t.description} (turn ${t.plantedTurn}, ${t.importance})`).join('\n') || '  None'}
- Recently Referenced:
${threadsByStatus.referenced.map((t) => `  * [${t.type}] ${t.description}`).join('\n') || '  None'}
- Resolved:
${threadsByStatus.resolved.slice(-3).map((t) => `  * [${t.type}] ${t.description} (resolved turn ${t.resolvedTurn})`).join('\n') || '  None'}
`;
  }

  // Format pacing state section
  let pacingSection = '';
  if (pacingState) {
    pacingSection = `
CURRENT PACING STATE:
- Level: ${pacingState.currentLevel}
- Turns at this level: ${pacingState.turnsAtLevel}
- Trend: ${pacingState.trend}
${pacingState.lastClimax ? `- Last climax: turn ${pacingState.lastClimax}` : ''}
${pacingState.lastBreather ? `- Last breather: turn ${pacingState.lastBreather}` : ''}
`;
  }

  // Format recent events for analysis
  const recentMessages = recentResponse.messages
    .map((m) => `[${m.senderName}]: ${m.text}`)
    .join('\n');

  return `
<role>
You are a narrative context analyzer for an interactive RPG.
Your mission: Analyze recent story events and update the "Heavy Context" (persistent narrative memory) when meaningful changes occur.
</role>

<context>
<universe>${gameState.config.universeName} (${gameState.config.universeType})</universe>
<location>${currentLocation?.name} - ${currentLocation?.description}</location>
<player>${player?.name}</player>
<turn>${gameState.turnCount}</turn>

<current_heavy_context>
${contextSummary}
</current_heavy_context>
${narrativeThreadsSection ? `<narrative_threads>\n${narrativeThreadsSection}\n</narrative_threads>` : ''}
${pacingSection ? `<pacing_state>\n${pacingSection}\n</pacing_state>` : ''}

<recent_events>
${recentMessages}
${recentResponse.eventLog ? `\nEvent Summary: ${recentResponse.eventLog}` : ''}
</recent_events>
</context>

<instructions>
# Analysis Steps

## Step 1: Evaluate Recent Events
Ask yourself:
- Did the player's main mission (long arc) or current mission (immediate objective) change?
- Did new problems, conflicts, or dangers emerge?
- Are there new concerns the player should track?
- Are there important story elements to remember for future context?

## Step 2: Check for Narrative Threads
Look for elements worth tracking for future payoff:
- **foreshadowing**: Hints about future events (prophecies, warnings, suspicious behavior)
- **chekhov_gun**: Objects or abilities introduced that should be used later
- **callback**: References to past events worth remembering

## Step 3: Analyze Pacing
Determine the current scene's tension level:
| Level | Description |
|-------|-------------|
| high_tension | Combat, chase, critical confrontation, time pressure |
| building | Rising stakes, discoveries, complications emerging |
| moderate | Normal exploration, conversation with stakes |
| calm | Safe moments, character bonding, recovery |
| release | After climax, resolution, reflection |

## Step 4: Decide on Updates
- Set shouldUpdate=true ONLY if something meaningful changed
- Be conservative - trivial events should NOT trigger updates
</instructions>

<change_format>
# Heavy Context Changes
- Single-value sections (mainMission, currentMission): { action: "set" | "clear", value?: string }
- List sections (activeProblems, currentConcerns, importantNotes): arrays of { action: "add" | "remove", value: string }
- Keep entries CONCISE (1-2 sentences max)
- Write all content in ${langName}
- Maximum 5 items per list after changes

# Narrative Thread Changes
- "plant": New element introduced for future reference
- "reference": Existing planted element mentioned again
- "resolve": Planted element pays off / is fulfilled
- "remove": Thread no longer relevant
</change_format>

<output_format>
Respond with JSON only:
{
  "shouldUpdate": true,
  "changes": {
    "mainMission": { "action": "set", "value": "..." },
    "activeProblems": [
      { "action": "remove", "value": "..." },
      { "action": "add", "value": "..." }
    ]
  },
  "narrativeThreadChanges": [
    {
      "action": "plant",
      "thread": {
        "type": "chekhov_gun",
        "description": "...",
        "importance": "major"
      }
    }
  ],
  "pacingAnalysis": {
    "currentLevel": "building",
    "trend": "rising",
    "recommendation": "..."
  }
}

If nothing changed: { "shouldUpdate": false, "pacingAnalysis": { "currentLevel": "moderate", "trend": "stable" } }
</output_format>

<reminder>
- Be CONSERVATIVE with updates - only flag shouldUpdate=true for genuine changes
- ALWAYS include pacingAnalysis to help maintain good story rhythm
- Only track narrative threads significant enough for future payoff
- Omit unchanged sections from the changes object
</reminder>
`;
}

/**
 * JSON Schema para validação da resposta de atualização incremental.
 */
const fieldChangeSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['set', 'clear'],
      description: 'Use set to provide a new value, clear to remove the existing one.',
    },
    value: {
      type: 'string',
      description: 'Concise description for the mission. Required when action = set.',
    },
  },
  required: ['action'],
};

const listChangeSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['add', 'remove'],
      description: 'add introduces a new entry, remove deletes a resolved entry.',
    },
    value: {
      type: 'string',
      description: 'Text of the item being added or removed.',
    },
  },
  required: ['action', 'value'],
};

const narrativeThreadChangeSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['plant', 'reference', 'resolve', 'remove'],
      description: 'The action to take on the narrative thread.',
    },
    thread: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the thread (required for reference/resolve/remove actions).',
        },
        type: {
          type: 'string',
          enum: ['foreshadowing', 'callback', 'chekhov_gun'],
          description: 'The type of narrative thread.',
        },
        description: {
          type: 'string',
          description: 'Brief description of the narrative element.',
        },
        importance: {
          type: 'string',
          enum: ['minor', 'moderate', 'major'],
          description: 'How important this thread is to the story.',
        },
      },
      required: ['type', 'description', 'importance'],
    },
  },
  required: ['action', 'thread'],
};

const pacingAnalysisSchema = {
  type: 'object',
  properties: {
    currentLevel: {
      type: 'string',
      enum: ['high_tension', 'building', 'moderate', 'calm', 'release'],
      description: 'The current tension/pacing level of the scene.',
    },
    trend: {
      type: 'string',
      enum: ['rising', 'falling', 'stable'],
      description: 'Whether tension is increasing, decreasing, or stable.',
    },
    recommendation: {
      type: 'string',
      description: 'Optional recommendation for pacing adjustment.',
    },
  },
  required: ['currentLevel', 'trend'],
};

export const heavyContextSchema = {
  type: 'object',
  properties: {
    shouldUpdate: {
      type: 'boolean',
      description:
        'True if the heavy context needs to be updated based on recent events. False if no changes are needed.',
    },
    changes: {
      type: 'object',
      description:
        'Only include the sections that changed. Each section details what to add/remove or set/clear.',
      properties: {
        mainMission: fieldChangeSchema,
        currentMission: fieldChangeSchema,
        activeProblems: {
          type: 'array',
          items: listChangeSchema,
        },
        currentConcerns: {
          type: 'array',
          items: listChangeSchema,
        },
        importantNotes: {
          type: 'array',
          items: listChangeSchema,
        },
      },
    },
    narrativeThreadChanges: {
      type: 'array',
      description: 'Changes to narrative threads (foreshadowing, callbacks, Chekhov guns).',
      items: narrativeThreadChangeSchema,
    },
    pacingAnalysis: {
      ...pacingAnalysisSchema,
      description: 'Analysis of the current story pacing/rhythm.',
    },
  },
  required: ['shouldUpdate'],
};
