/**
 * @fileoverview Prompt de Onboarding - Construtor de Mundo RPG
 *
 * Este módulo contém o prompt responsável por conduzir uma entrevista interativa
 * com o usuário para coletar todas as informações necessárias para criar um novo
 * jogo de RPG. O prompt atua como um agente entrevistador especializado.
 *
 * @module prompts/onboarding
 *
 * @description
 * O Onboarding Prompt é usado durante a fase de criação de uma nova história.
 * Ele coleta 7 pontos de dados obrigatórios através de uma conversa dinâmica:
 *
 * 1. **Nome do Universo/Cenário** - Se existente (Star Wars, Harry Potter, etc.) ou original
 * 2. **Período/Era Temporal** - Específico ao universo escolhido
 * 3. **Nome do Personagem** - Nome do protagonista do jogador
 * 4. **Aparência do Personagem** - Descrição visual detalhada
 * 5. **Background do Personagem** - História e papel no mundo
 * 6. **Localização Inicial** - Onde a aventura começa
 * 7. **Memórias do Personagem** - Eventos importantes do passado
 *
 * @example
 * ```typescript
 * import { buildOnboardingPrompt } from './prompts/onboarding.prompt';
 *
 * const history = [
 *   { question: 'Qual universo você gostaria de explorar?', answer: 'Star Wars' }
 * ];
 *
 * const prompt = buildOnboardingPrompt({
 *   history,
 *   universeType: 'existing',
 *   language: 'pt'
 * });
 * ```
 *
 * @see {@link OnboardingPromptParams} - Parâmetros aceitos pela função
 * @see {@link OnboardingResponse} - Formato esperado da resposta da IA
 */

import { Language } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';

/**
 * Representa um par pergunta-resposta do histórico de onboarding.
 *
 * @interface OnboardingHistoryItem
 * @property {string} question - A pergunta feita pela IA ao usuário
 * @property {string} answer - A resposta fornecida pelo usuário
 */
export interface OnboardingHistoryItem {
  question: string;
  answer: string;
}

/**
 * Parâmetros necessários para construir o prompt de onboarding.
 *
 * @interface OnboardingPromptParams
 * @property {OnboardingHistoryItem[]} history - Histórico de perguntas e respostas anteriores
 * @property {'original' | 'existing'} universeType - Tipo de universo: original (criado pelo usuário) ou existente (franquias conhecidas)
 * @property {Language} language - Idioma alvo para as perguntas ('en', 'pt', 'es')
 */
export interface OnboardingPromptParams {
  /** Histórico de perguntas e respostas da conversa de onboarding */
  history: OnboardingHistoryItem[];
  /** Tipo de universo: 'original' para universos criados pelo usuário, 'existing' para franquias conhecidas */
  universeType: 'original' | 'existing';
  /** Idioma no qual as perguntas devem ser geradas */
  language: Language;
}

/**
 * Configuração final do jogo gerada quando o onboarding está completo.
 *
 * @interface OnboardingFinalConfig
 * @property {string} universeName - Nome do universo/mundo do jogo
 * @property {string} universeType - Tipo do universo ('original' ou 'existing')
 * @property {string} playerName - Nome do personagem do jogador
 * @property {string} playerDesc - Descrição visual do personagem
 * @property {string} startSituation - Situação/contexto inicial do jogo
 * @property {string} background - História de fundo do personagem
 * @property {string} memories - Memórias importantes do personagem
 * @property {string} visualStyle - Referência visual para geração de avatares (obra, artista ou estilo)
 */
export interface OnboardingFinalConfig {
  universeName: string;
  universeType: string;
  playerName: string;
  playerDesc: string;
  startSituation: string;
  background: string;
  memories: string;
  visualStyle: string;
}

/**
 * Formato esperado da resposta da IA para o prompt de onboarding.
 *
 * @interface OnboardingResponse
 * @property {string} question - A próxima pergunta a ser feita ao usuário
 * @property {'select' | 'finish'} controlType - Tipo de controle de UI a ser usado (sempre 'select' com opções, UI tem botão 'outro' separado)
 * @property {string[]} options - Opções disponíveis para o usuário escolher (sempre presente quando controlType é 'select')
 * @property {boolean} isComplete - Indica se todas as informações foram coletadas
 * @property {OnboardingFinalConfig} [finalConfig] - Configuração final quando isComplete é true
 */
export interface OnboardingResponse {
  question: string;
  controlType: 'select' | 'finish';
  options?: string[];
  isComplete: boolean;
  finalConfig?: OnboardingFinalConfig;
}

/**
 * Constrói o prompt para o agente de onboarding que entrevista o usuário
 * para criar um novo jogo de RPG.
 *
 * Este prompt instrui a IA a:
 * - Analisar o histórico de conversa para identificar informações já coletadas
 * - Formular a próxima pergunta lógica na sequência
 * - Adaptar o tipo de input (texto ou seleção) baseado no contexto
 * - Para universos existentes, oferecer opções de Era e Localização baseadas no conhecimento interno
 * - Para universos originais, usar inputs de texto com sugestões criativas
 * - Detectar quando todas as informações foram coletadas e finalizar o onboarding
 *
 * @param {OnboardingPromptParams} params - Parâmetros de entrada para o prompt
 * @param {OnboardingHistoryItem[]} params.history - Histórico de perguntas e respostas
 * @param {'original' | 'existing'} params.universeType - Tipo de universo selecionado
 * @param {Language} params.language - Idioma alvo para geração
 *
 * @returns {string} O prompt formatado para envio à API da OpenAI
 *
 * @example
 * ```typescript
 * // Primeira chamada - sem histórico
 * const firstPrompt = buildOnboardingPrompt({
 *   history: [],
 *   universeType: 'existing',
 *   language: 'pt'
 * });
 *
 * // Chamadas subsequentes - com histórico
 * const nextPrompt = buildOnboardingPrompt({
 *   history: [
 *     { question: 'Qual universo?', answer: 'Star Wars' },
 *     { question: 'Qual era?', answer: 'Era do Império' }
 *   ],
 *   universeType: 'existing',
 *   language: 'pt'
 * });
 * ```
 *
 * @throws {Error} Não lança erros diretamente, mas a resposta da IA pode falhar se o histórico for inválido
 */
export function buildOnboardingPrompt({
  history,
  universeType,
  language,
}: OnboardingPromptParams): string {
  const langName = getLanguageName(language);

  return `
<role>
You are an expert RPG World Builder assisting a user in creating a new game.
Your mission: Collect 8 specific data points through conversational questions to initialize a "Theatre of the Mind" RPG.
</role>

<language>${langName}</language>

<required_data_points>
1. Universe Name/Setting (existing IP or original theme)
2. Time Period/Era (specific to universe)
3. Visual Style Reference (artwork/movie/game/anime style for character avatars)
4. Character Name
5. Character Appearance (visuals)
6. Character Background (role/history)
7. Starting Location
8. Character Memories (important past events)
</required_data_points>

<context>
<universe_type>${universeType}</universe_type>
<conversation_history>${JSON.stringify(history)}</conversation_history>
</context>

<instructions>
# Question Flow

## Step 1: Check History
Count topics already answered. If all 8 are covered → set isComplete=true.

## Step 2: Formulate Next Question
Ask ONE question at a time about the next missing topic.

## Step 3: Generate Options
ALWAYS provide 4-6 creative, relevant options. Examples by topic:
- **Universe**: "Star Wars", "The Witcher", "Dark Fantasy", "Cyberpunk Noir"
- **Era**: Use canon periods for existing IPs, creative eras for original
- **Visual Style**: "Studio Ghibli", "Dark Souls concept art", "Ralph McQuarrie"
- **Character Name**: Thematic names fitting the universe
- **Appearance**: Archetypes ("Battle-scarred warrior", "Mysterious hooded figure")
- **Background**: Role archetypes ("Exiled noble", "Street-smart smuggler")
- **Location**: Iconic places ("Bustling port city", "Ancient ruins")
- **Memories**: Narrative hooks ("Lost a loved one", "Discovered a family secret")

## Step 4: Complete When Ready
When all 8 topics have answers, set isComplete=true and populate finalConfig.
</instructions>

<anti_loop_rules>
# Critical Rules to Prevent Infinite Loops

1. NEVER ask the same question twice - if it's in history, that topic is CLOSED
2. Accept negations immediately ("no", "não", "none", "nothing") and move on
3. Brief answers are VALID ("Clone of Madara" = sufficient for appearance)
4. "No memories" = valid answer (amnesia or newly created character)
5. After covering all 8 topics with ANY answer, set isComplete=true
6. Count topics: Universe, Era, Visual Style, Name, Appearance, Background, Location, Memories → if all answered, you're DONE
</anti_loop_rules>

<output_format>
Respond with JSON only:
{
  "question": "The next question in ${langName}",
  "controlType": "select",
  "options": ["4-6 creative options"],
  "isComplete": false,
  "finalConfig": null
}

When complete:
{
  "question": "",
  "controlType": "finish",
  "options": [],
  "isComplete": true,
  "finalConfig": {
    "universeName": "...",
    "universeType": "${universeType}",
    "playerName": "...",
    "playerDesc": "...",
    "startSituation": "...",
    "background": "...",
    "memories": "...",
    "visualStyle": "..."
  }
}
</output_format>

<reminder>
- controlType is ALWAYS 'select' (UI has built-in "Other" button)
- For existing IPs, use canon-accurate options from your knowledge
- startSituation in finalConfig combines Location + immediate context
- visualStyle must be the exact artistic reference chosen by user
</reminder>
`;
}

/**
 * JSON Schema para validação da resposta do agente de onboarding.
 * Este schema é usado pela API da OpenAI para garantir respostas estruturadas.
 *
 * @constant
 * @type {object}
 */
export const onboardingSchema = {
  type: 'object',
  properties: {
    question: {
      type: 'string',
      description:
        'The next question to ask the user to gather missing information.',
    },
    controlType: {
      type: 'string',
      enum: ['select', 'finish'],
      description: "ALWAYS use 'select' for questions. Use 'finish' only when complete. NEVER use 'text' - the UI has a built-in 'Other' button for custom input.",
    },
    options: {
      type: 'array',
      items: { type: 'string' },
      description: "REQUIRED: Always provide 4-6 creative and relevant options for the user to choose from. The UI has a separate 'Other' button if they want to type custom input.",
    },
    isComplete: {
      type: 'boolean',
      description:
        'True when ALL 8 topics have been asked and answered (even minimally). If user said "no" or gave brief answers, that counts as answered. NEVER ask the same topic twice.',
    },
    finalConfig: {
      type: 'object',
      description: 'Populate only when isComplete is true.',
      properties: {
        universeName: { type: 'string' },
        universeType: { type: 'string' },
        playerName: { type: 'string' },
        playerDesc: { type: 'string' },
        startSituation: { type: 'string' },
        background: { type: 'string' },
        memories: { type: 'string' },
        visualStyle: { type: 'string', description: 'The artistic reference chosen for avatar generation (e.g., "Studio Ghibli style", "Dark Souls concept art")' },
      },
    },
  },
  required: ['question', 'controlType', 'isComplete', 'options'],
};
