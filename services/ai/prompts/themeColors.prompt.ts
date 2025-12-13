/**
 * @fileoverview Prompt de Geração de Tema (Cores + Fonte) - UI Dinâmica baseada no Universo
 *
 * Este módulo contém o prompt responsável por gerar uma paleta de cores
 * E selecionar uma fonte personalizada para a interface do jogo baseada no contexto do universo.
 * As cores e fonte são geradas para criar uma atmosfera visual coerente com o mundo do jogo.
 *
 * @module prompts/themeColors
 *
 * @description
 * O Theme Colors Prompt é usado para:
 *
 * - **Gerar paleta** - Criar cores que combinem com o universo do jogo
 * - **Selecionar fonte** - Escolher uma fonte temática do registro disponível
 * - **Manter legibilidade** - Garantir contraste adequado entre texto e fundo
 * - **Criar atmosfera** - Transmitir o tom do universo através das cores e tipografia
 * - **Preservar usabilidade** - Manter a interface funcional e acessível
 *
 * @example
 * ```typescript
 * import { buildThemeColorsPrompt } from './prompts/themeColors.prompt';
 *
 * const prompt = buildThemeColorsPrompt({
 *   universeName: 'Dark Souls',
 *   universeType: 'existing',
 *   genre: 'dark_fantasy',
 *   visualStyle: 'Gothic medieval concept art',
 *   userConsiderations: 'Quero cores mais sombrias com tons de vermelho',
 *   language: 'pt'
 * });
 * ```
 *
 * @see {@link ThemeColorsPromptParams} - Parâmetros aceitos pela função
 * @see {@link ThemeColorsResponse} - Formato da resposta esperada
 */

import { Language, NarrativeGenre } from '../../../types';
import { getLanguageName } from '../../../i18n/locales';
import { buildFontRegistryForPrompt, THEMED_FONTS } from '../../../constants/fonts';

/**
 * Parâmetros necessários para construir o prompt de geração de cores.
 *
 * @interface ThemeColorsPromptParams
 */
export interface ThemeColorsPromptParams {
  /** Nome do universo (ex: "Dark Souls", "Star Wars", "Middle-earth") */
  universeName: string;
  /** Tipo do universo: original (criado) ou existing (existente) */
  universeType: 'original' | 'existing';
  /** Gênero narrativo do universo */
  genre?: NarrativeGenre;
  /** Estilo visual de referência (ex: "Studio Ghibli", "Cyberpunk 2077") */
  visualStyle?: string;
  /** Considerações adicionais do usuário para customização */
  userConsiderations?: string;
  /** Idioma para mensagens de erro */
  language: Language;
}

/**
 * Formato da resposta esperada do prompt de cores e fonte.
 *
 * @interface ThemeColorsResponse
 */
export interface ThemeColorsResponse {
  /** Primary background color (hex) */
  background: string;
  /** Secondary background color (hex) */
  backgroundSecondary: string;
  /** Accent background color (hex) */
  backgroundAccent: string;
  /** Primary text color (hex) */
  text: string;
  /** Secondary text color (hex) */
  textSecondary: string;
  /** Accent text color (hex) */
  textAccent: string;
  /** Primary border color (hex) */
  border: string;
  /** Strong border color (hex) */
  borderStrong: string;
  /** Primary button background (hex) */
  buttonPrimary: string;
  /** Primary button text (hex) */
  buttonPrimaryText: string;
  /** Secondary button background (hex) */
  buttonSecondary: string;
  /** Secondary button text (hex) */
  buttonSecondaryText: string;
  /** Success/positive color (hex) */
  success: string;
  /** Warning color (hex) */
  warning: string;
  /** Danger/error color (hex) */
  danger: string;
  /** Shadow color (hex) */
  shadow: string;
  /** Selected font family name (must be from available fonts list) */
  fontFamily: string;
}

/**
 * Mapeia gêneros narrativos para dicas de cores.
 */
const GENRE_COLOR_HINTS: Record<NarrativeGenre, string> = {
  epic_fantasy: 'Rich golds, deep blues, forest greens - noble and majestic',
  dark_fantasy: 'Deep purples, blood reds, charcoal blacks - ominous and foreboding',
  sword_sorcery: 'Bronze, crimson, sand colors - ancient and adventurous',
  cosmic_horror: 'Sickly greens, void blacks, eldritch purples - alien and unsettling',
  noir: 'Black, white, gray, muted yellows - shadows and mystery',
  sci_fi_space: 'Electric blues, silver, deep space blacks - futuristic and vast',
  cyberpunk: 'Neon pinks, cyans, dark grays - high-tech and gritty',
  steampunk: 'Copper, brass, sepia, wood browns - Victorian industrial',
  post_apocalyptic: 'Rust oranges, dust browns, faded colors - decay and survival',
  mystery: 'Deep burgundy, midnight blue, muted tones - intrigue and shadows',
  romance: 'Soft pinks, warm reds, cream whites - passion and tenderness',
  comedy: 'Bright yellows, playful greens, vibrant colors - joy and lightness',
  historical: 'Parchment tones, period-appropriate colors - authenticity',
  superhero: 'Bold primary colors, strong contrasts - power and heroism',
  slice_of_life: 'Warm pastels, cozy earth tones - comfort and familiarity',
};

/**
 * Constrói o prompt para gerar cores e fonte do tema baseadas no universo.
 *
 * @param {ThemeColorsPromptParams} params - Parâmetros de entrada
 * @returns {string} O prompt formatado para envio à API da OpenAI
 */
export function buildThemeColorsPrompt({
  universeName,
  universeType,
  genre,
  visualStyle,
  userConsiderations,
  language,
}: ThemeColorsPromptParams): string {
  const langName = getLanguageName(language);
  const genreHint = genre ? GENRE_COLOR_HINTS[genre] : '';
  const fontRegistry = buildFontRegistryForPrompt();

  return `
<role>
You are the lead UI art director for storywell.games, designing adaptive color + font themes that feel cinematic yet pass WCAG AA.
</role>

<context>
<universe>
  <name>${universeName}</name>
  <type>${universeType === 'existing' ? 'existing_ip' : 'original_world'}</type>
  ${genre ? `<genre>${genre}</genre>` : ''}
  ${visualStyle ? `<visual_style>${visualStyle}</visual_style>` : ''}
</universe>
<language>${langName}</language>
${genreHint ? `<genre_hint>${genreHint}</genre_hint>` : ''}
${userConsiderations ? `<player_preferences>${userConsiderations}</player_preferences>` : ''}
</context>

<available_fonts>
${fontRegistry}
</available_fonts>

<instructions>
# Stage 1: Diagnose the Mood
- Extract emotional tone, era, and materials implied by the universe + genre.
- Decide on a palette archetype (analogous, complementary, triadic) that fits ${genre || 'the stated genre'}.

# Stage 2: Build the Palette
- Background colors: muted/desaturated, stepped from dark → medium → accent for layering.
- Text colors: pure, high-contrast values. Validate these pairs ≥4.5:1: (background vs text), (backgroundSecondary vs text), (backgroundAccent vs textAccent), (buttonPrimary vs buttonPrimaryText), (buttonSecondary vs buttonSecondaryText), (border vs backgroundSecondary).
- Functional colors: success = reassuring greens, warning = amber/orange, danger = urgent reds, shadow = translucent version of background.

# Stage 3: Pick the Font
- Choose EXACTLY one fontFamily from <available_fonts>.
- Use the category guidance (pixel, fantasy, cyberpunk, horror, elegant, noir) to match the universe mood.
- Favor readability for body copy; decorative fonts should still pair with long-form text.

# Stage 4: Verify Accessibility & Cohesion
- Ensure textSecondary maintains ≥3:1 against backgroundSecondary/backgroundAccent.
- Borders must contrast ≥3:1 with adjacent backgrounds for card separation.
- Mention internal reasoning only to yourself—final output is JSON only.
</instructions>

<output_format>
Return JSON only with keys: background, backgroundSecondary, backgroundAccent, text, textSecondary, textAccent, border, borderStrong, buttonPrimary, buttonPrimaryText, buttonSecondary, buttonSecondaryText, success, warning, danger, shadow, fontFamily. All colors must be 6-digit hex strings (#XXXXXX). fontFamily must match one entry from <available_fonts>.
</output_format>

<reminder>
No prose, no markdown—output STRICT JSON. The palette and font must feel cohesive with ${universeName}.
</reminder>
`;
}

/**
 * JSON Schema para validação da resposta de cores e fonte.
 *
 * @constant
 * @type {object}
 */
export const themeColorsSchema = {
  type: 'object',
  properties: {
    background: {
      type: 'string',
      description: 'Primary background color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    backgroundSecondary: {
      type: 'string',
      description: 'Secondary background color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    backgroundAccent: {
      type: 'string',
      description: 'Accent background color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    text: {
      type: 'string',
      description: 'Primary text color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    textSecondary: {
      type: 'string',
      description: 'Secondary text color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    textAccent: {
      type: 'string',
      description: 'Accent text color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    border: {
      type: 'string',
      description: 'Primary border color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    borderStrong: {
      type: 'string',
      description: 'Strong border color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    buttonPrimary: {
      type: 'string',
      description: 'Primary button background (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    buttonPrimaryText: {
      type: 'string',
      description: 'Primary button text (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    buttonSecondary: {
      type: 'string',
      description: 'Secondary button background (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    buttonSecondaryText: {
      type: 'string',
      description: 'Secondary button text (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    success: {
      type: 'string',
      description: 'Success color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    warning: {
      type: 'string',
      description: 'Warning color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    danger: {
      type: 'string',
      description: 'Danger color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    shadow: {
      type: 'string',
      description: 'Shadow color (hex)',
      pattern: '^#[0-9A-Fa-f]{6}$',
    },
    fontFamily: {
      type: 'string',
      description: 'Font family name from the available fonts list',
    },
  },
  required: [
    'background',
    'backgroundSecondary',
    'backgroundAccent',
    'text',
    'textSecondary',
    'textAccent',
    'border',
    'borderStrong',
    'buttonPrimary',
    'buttonPrimaryText',
    'buttonSecondary',
    'buttonSecondaryText',
    'success',
    'warning',
    'danger',
    'shadow',
    'fontFamily',
  ],
};

// ============================================================================
// COLORS ONLY PROMPT - For regenerating just the color palette
// ============================================================================

/**
 * Parâmetros para gerar apenas cores (sem alterar fonte).
 */
export interface ColorsOnlyPromptParams {
  /** Nome do universo */
  universeName: string;
  /** Tipo do universo */
  universeType: 'original' | 'existing';
  /** Gênero narrativo */
  genre?: NarrativeGenre;
  /** Estilo visual de referência */
  visualStyle?: string;
  /** Considerações do usuário para as cores */
  userConsiderations?: string;
  /** Idioma */
  language: Language;
}

/**
 * Constrói o prompt para gerar APENAS cores (mantendo a fonte atual).
 */
export function buildColorsOnlyPrompt({
  universeName,
  universeType,
  genre,
  visualStyle,
  userConsiderations,
  language,
}: ColorsOnlyPromptParams): string {
  const langName = getLanguageName(language);
  const genreHint = genre ? GENRE_COLOR_HINTS[genre] : '';

  return `
<role>
You are a UI color specialist refreshing palette values while keeping the current font untouched.
</role>

<context>
<universe>
  <name>${universeName}</name>
  <type>${universeType === 'existing' ? 'existing_ip' : 'original_world'}</type>
  ${genre ? `<genre>${genre}</genre>` : ''}
  ${visualStyle ? `<visual_style>${visualStyle}</visual_style>` : ''}
</universe>
<language>${langName}</language>
${genreHint ? `<genre_hint>${genreHint}</genre_hint>` : ''}
${userConsiderations ? `<player_preferences>${userConsiderations}</player_preferences>` : ''}
</context>

<instructions>
# Stage 1: Capture Mood
- Summarize the emotional tone and material palette implied by the context.

# Stage 2: Rebuild Colors Only
- Provide fresh values for background/backgroundSecondary/backgroundAccent with layered brightness.
- Ensure readable contrasts: (background vs text), (backgroundSecondary vs text), (backgroundAccent vs textAccent), (buttonPrimary vs buttonPrimaryText), (buttonSecondary vs buttonSecondaryText), (border vs backgroundSecondary).
- Functional colors (success/warning/danger) must stay recognizable yet harmonized with the palette.

# Stage 3: Quality Checks
- Keep shadow as a translucent variant of background (darker by ~15%).
- No new font data should be introduced.
</instructions>

<output_format>
Return JSON with keys background, backgroundSecondary, backgroundAccent, text, textSecondary, textAccent, border, borderStrong, buttonPrimary, buttonPrimaryText, buttonSecondary, buttonSecondaryText, success, warning, danger, shadow. All values must be 6-digit hex strings (#XXXXXX). DO NOT include fontFamily.
</output_format>

<reminder>
Output strict JSON only—no prose, no markdown.
</reminder>
`;
}

/**
 * Schema para validação de resposta de cores apenas.
 */
export const colorsOnlySchema = {
  type: 'object',
  properties: {
    background: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    backgroundSecondary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    backgroundAccent: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    text: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    textSecondary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    textAccent: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    border: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    borderStrong: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    buttonPrimary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    buttonPrimaryText: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    buttonSecondary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    buttonSecondaryText: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    success: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    warning: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    danger: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    shadow: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
  },
  required: [
    'background', 'backgroundSecondary', 'backgroundAccent',
    'text', 'textSecondary', 'textAccent',
    'border', 'borderStrong',
    'buttonPrimary', 'buttonPrimaryText', 'buttonSecondary', 'buttonSecondaryText',
    'success', 'warning', 'danger', 'shadow',
  ],
};

// ============================================================================
// FONT ONLY PROMPT - For regenerating just the font
// ============================================================================

/**
 * Parâmetros para gerar apenas a fonte (sem alterar cores).
 */
export interface FontOnlyPromptParams {
  /** Nome do universo */
  universeName: string;
  /** Tipo do universo */
  universeType: 'original' | 'existing';
  /** Gênero narrativo */
  genre?: NarrativeGenre;
  /** Estilo visual de referência */
  visualStyle?: string;
  /** Considerações do usuário para a fonte */
  userConsiderations?: string;
  /** Idioma */
  language: Language;
}

/**
 * Constrói o prompt para gerar APENAS a fonte (mantendo as cores atuais).
 */
export function buildFontOnlyPrompt({
  universeName,
  universeType,
  genre,
  visualStyle,
  userConsiderations,
  language,
}: FontOnlyPromptParams): string {
  const langName = getLanguageName(language);
  const fontRegistry = buildFontRegistryForPrompt();

  return `
<role>
You are a typography curator choosing a single display/system font that embodies the universe while staying legible in long UI passages.
</role>

<context>
<universe>
  <name>${universeName}</name>
  <type>${universeType === 'existing' ? 'existing_ip' : 'original_world'}</type>
  ${genre ? `<genre>${genre}</genre>` : ''}
  ${visualStyle ? `<visual_style>${visualStyle}</visual_style>` : ''}
</universe>
${userConsiderations ? `<player_preferences>${userConsiderations}</player_preferences>` : ''}
</context>

<available_fonts>
${fontRegistry}
</available_fonts>

<instructions>
# Stage 1: Match Mood to Category
- Map the universe/genre to the closest font category (pixel, fantasy, cyberpunk, horror, elegant, noir, modern UI).

# Stage 2: Evaluate Practicality
- Ensure the font is readable for paragraphs, supports mixed-case, and works across Latin characters.
- Avoid fonts that are overly stylized if the universe expects high readability.

# Stage 3: Decide
- Select EXACTLY one fontFamily from <available_fonts> and justify mentally (no prose output).
</instructions>

<output_format>
Return JSON only: { "fontFamily": "ExactFontNameFromList" }
</output_format>

<reminder>
No commentary or markdown—just the JSON object.
</reminder>
`;
}

/**
 * Schema para validação de resposta de fonte apenas.
 */
export const fontOnlySchema = {
  type: 'object',
  properties: {
    fontFamily: {
      type: 'string',
      description: 'Font family name from the available fonts list',
    },
  },
  required: ['fontFamily'],
};
