/**
 * @fileoverview Prompt de Imagem de Fundo de Localização
 *
 * Este módulo contém o prompt responsável por gerar imagens de fundo
 * para as localizações do jogo usando DALL-E 3. As imagens são usadas
 * como background do chat para aumentar a imersão.
 *
 * @module prompts/locationBackground
 *
 * @description
 * O Location Background Prompt é usado para:
 *
 * - **Gerar cenários imersivos** - Criar imagens atmosféricas do local atual
 * - **Manter consistência visual** - Adaptar ao estilo artístico do universo
 * - **Contextualizar a narrativa** - Dar vida visual aos ambientes
 *
 * Este prompt é enviado à API DALL-E 3 da OpenAI.
 * As imagens geradas são armazenadas como base64 no IndexedDB.
 */

/**
 * Parâmetros necessários para construir o prompt de background.
 *
 * @interface LocationBackgroundPromptParams
 * @property {string} locationName - Nome do local
 * @property {string} locationDescription - Descrição detalhada do local
 * @property {string} universeContext - Nome/tipo do universo para consistência
 * @property {string} [visualStyle] - Referência artística para o estilo visual
 */
export interface LocationBackgroundPromptParams {
  /** Nome do local */
  locationName: string;
  /** Descrição detalhada do local */
  locationDescription: string;
  /** Contexto do universo para adaptar estilo visual */
  universeContext: string;
  /** Referência artística para estilo visual */
  visualStyle?: string;
}

/**
 * Constrói o prompt para gerar uma imagem de fundo de localização usando DALL-E 3.
 *
 * Este prompt instrui o DALL-E a criar:
 *
 * **1. Cenário Atmosférico:**
 * - Paisagem ou ambiente interior detalhado
 * - Iluminação que combina com a atmosfera do local
 * - Elementos visuais que contextualizam a cena
 *
 * **2. Composição para Background:**
 * - Imagem panorâmica/wide adequada para fundo
 * - Sem personagens ou figuras principais
 * - Profundidade de campo suave para não competir com texto
 *
 * **3. Estilo Consistente:**
 * - Baseado na referência artística do universo
 * - Cores e atmosfera que combinam com o tema
 *
 * @param {LocationBackgroundPromptParams} params - Parâmetros de entrada
 * @returns {string} O prompt formatado para envio à API DALL-E
 *
 * @example
 * ```typescript
 * const prompt = buildLocationBackgroundPrompt({
 *   locationName: 'Taverna do Dragão Adormecido',
 *   locationDescription: 'Uma taverna acolhedora com lareiras crepitantes e candelabros...',
 *   universeContext: 'Fantasia Medieval',
 *   visualStyle: 'Dark Souls concept art'
 * });
 * ```
 */
export function buildLocationBackgroundPrompt({
  locationName,
  locationDescription,
  universeContext,
  visualStyle,
}: LocationBackgroundPromptParams): string {
  const styleReference = visualStyle || 'atmospheric concept art';

  return `
<role>
You are a cinematic environment artist crafting atmospheric backdrops for an RPG chat interface. Deliver a wide illustration optimized for text legibility.
</role>

<context>
<location>
  <name>${locationName}</name>
  <description>${locationDescription}</description>
</location>
<setting>${universeContext}</setting>
<style_reference>${styleReference}</style_reference>
<format>32:18 panoramic · no characters · storytelling props only</format>
</context>

<instructions>
# Stage 1: Understand the Space
- Identify architectural style, era, weather, and dominant materials from the description.
- Capture signature props or landmarks that prove we are in ${locationName}.

# Stage 2: Compose for Background Use
- Use a wide cinematic camera with gentle perspective; keep focal point off-center for text overlays.
- Ensure depth layering (foreground, midground, background) with atmospheric perspective.
- Avoid characters, silhouettes, or creatures—environment only.

# Stage 3: Apply Style & Lighting
- Emulate ${styleReference} color grading, brushwork, and lighting direction.
- Slightly mute saturation so UI text remains readable; keep contrast around 60%.
- Use volumetric light, fog, embers, rain, or particles only if they reinforce the mood.

# Stage 4: Finish for UI Integration
- Add subtle vignette and soft depth-of-field blur on edges.
- Reserve the central third for potential text overlays by keeping detail medium-low there.
- No text, logos, frames, or borders.
</instructions>

<output_format>
Describe the scene for DALL·E in one cohesive paragraph beginning with "Wide environmental concept art of ${locationName}". Mention lighting, palette, weather, notable props, and camera angle.
</output_format>

<reminder>
Environment only. Keep the mood immersive yet not visually noisy.
</reminder>
`;
}
