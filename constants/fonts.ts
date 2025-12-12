/**
 * @fileoverview Themed Fonts Registry - Curated Google Fonts for Game Styles
 *
 * This module contains all available fonts for the game's theming system.
 * Each font is categorized by style and includes a description to help
 * the LLM choose the most appropriate font for each universe/genre.
 *
 * ALL fonts listed here MUST be preloaded in index.html to ensure
 * immediate availability during gameplay.
 *
 * @module constants/fonts
 */

/**
 * Categories of fonts based on visual style/mood.
 */
export type FontCategory =
  | 'pixel'        // Retro 8-bit, DOS-style, old computer aesthetics
  | 'fantasy'      // Medieval, magical, RPG-style fonts
  | 'cyberpunk'    // Futuristic, neon, tech-noir aesthetics
  | 'horror'       // Creepy, gothic, unsettling fonts
  | 'sci_fi'       // Clean futuristic, space-age fonts
  | 'elegant'      // Sophisticated, classic, refined fonts
  | 'handwritten'  // Personal, journal-like, informal fonts
  | 'typewriter'   // Old typewriter, noir detective aesthetics
  | 'comic'        // Fun, casual, superhero comics style
  | 'ancient'      // Historical, runic, ancient civilization fonts
  | 'modern'       // Clean, contemporary sans-serif fonts
  | 'display';     // Bold statement fonts for headers

/**
 * Definition of a themed font with metadata for LLM selection.
 */
export interface ThemedFont {
  /** Google Fonts family name (use exactly as in Google Fonts URL) */
  family: string;
  /** Human-readable display name */
  displayName: string;
  /** Category for grouping */
  category: FontCategory;
  /** Detailed description for LLM to understand when to use this font */
  description: string;
  /** CSS fallback stack */
  fallback: string;
  /** Best suited for these narrative genres */
  bestFor: string[];
  /** Font weights available (for Google Fonts URL) */
  weights: number[];
}

/**
 * Complete registry of themed fonts available in the game.
 * Each font is carefully selected to match specific game aesthetics.
 *
 * IMPORTANT: When adding new fonts:
 * 1. Add the font definition here
 * 2. Add the font to index.html Google Fonts preload
 * 3. Test that the font loads correctly
 */
export const THEMED_FONTS: ThemedFont[] = [
  // ============================================================================
  // PIXEL / RETRO FONTS - For old-school RPGs, DOS games, 8-bit aesthetics
  // ============================================================================
  {
    family: 'VT323',
    displayName: 'VT323',
    category: 'pixel',
    description: 'Classic terminal/DOS font. Perfect for retro RPGs, old computer aesthetics, hacker themes, and any game evoking 1980s-90s computing nostalgia. Monospace pixel look.',
    fallback: 'monospace',
    bestFor: ['epic_fantasy', 'sci_fi_space', 'cyberpunk', 'mystery'],
    weights: [400],
  },
  {
    family: 'Press Start 2P',
    displayName: 'Press Start 2P',
    category: 'pixel',
    description: 'Authentic 8-bit arcade/NES style font. Best for games with pixelated visuals, retro gaming homages, elemental RPGs, and classic video game aesthetics. Very blocky and nostalgic.',
    fallback: 'monospace',
    bestFor: ['epic_fantasy', 'comedy', 'superhero'],
    weights: [400],
  },
  {
    family: 'Silkscreen',
    displayName: 'Silkscreen',
    category: 'pixel',
    description: 'Tiny pixel font optimized for small sizes. Great for retro UI elements, pixel art games, indie games with minimalist aesthetics. Clean and readable even at small sizes.',
    fallback: 'monospace',
    bestFor: ['epic_fantasy', 'comedy', 'slice_of_life'],
    weights: [400, 700],
  },
  {
    family: 'DotGothic16',
    displayName: 'DotGothic16',
    category: 'pixel',
    description: 'Japanese-inspired pixel font. Perfect for JRPGs, anime-styled games, Japanese horror, and games with Eastern aesthetics. Combines pixel art with Gothic influences.',
    fallback: 'monospace',
    bestFor: ['epic_fantasy', 'cosmic_horror', 'mystery'],
    weights: [400],
  },
  {
    family: 'Pixelify Sans',
    displayName: 'Pixelify Sans',
    category: 'pixel',
    description: 'Modern pixel font with excellent readability. Versatile for any retro-styled game while maintaining legibility. Good balance between nostalgia and usability.',
    fallback: 'sans-serif',
    bestFor: ['epic_fantasy', 'comedy', 'superhero', 'slice_of_life'],
    weights: [400, 500, 600, 700],
  },

  // ============================================================================
  // FANTASY FONTS - For medieval, magical, RPG worlds
  // ============================================================================
  {
    family: 'MedievalSharp',
    displayName: 'MedievalSharp',
    category: 'fantasy',
    description: 'Classic medieval calligraphy style. Ideal for high fantasy, sword & sorcery, Tolkien-esque worlds, and any setting with castles, knights, and magic. Elegant yet readable.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'dark_fantasy', 'sword_sorcery', 'historical'],
    weights: [400],
  },
  {
    family: 'Cinzel',
    displayName: 'Cinzel',
    category: 'fantasy',
    description: 'Roman-inspired elegant capitals. Perfect for epic fantasy, ancient empires, classical mythology, and games with a sense of grandeur and history. Formal and majestic.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'historical', 'dark_fantasy'],
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Cinzel Decorative',
    displayName: 'Cinzel Decorative',
    category: 'fantasy',
    description: 'Ornate version of Cinzel with decorative flourishes. Best for titles, headers, and special moments in epic fantasy or ancient civilization settings. Very ornamental.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'historical'],
    weights: [400, 700, 900],
  },
  {
    family: 'Uncial Antiqua',
    displayName: 'Uncial Antiqua',
    category: 'fantasy',
    description: 'Celtic/Irish manuscript style. Excellent for druidic themes, Celtic mythology, forest magic, and mystical settings. Has an ancient, hand-copied manuscript feel.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'dark_fantasy', 'historical'],
    weights: [400],
  },
  {
    family: 'IM Fell English',
    displayName: 'IM Fell English',
    category: 'fantasy',
    description: 'Historical printing press style from 17th century. Great for old books, magical tomes, Victorian fantasy, and settings with antique book aesthetics. Slightly worn look.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'dark_fantasy', 'mystery', 'steampunk'],
    weights: [400],
  },
  {
    family: 'Almendra',
    displayName: 'Almendra',
    category: 'fantasy',
    description: 'Spanish medieval calligraphy with flowing curves. Perfect for romance elements in fantasy, courtly intrigue, and elegant magical settings. Graceful and readable.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'romance', 'historical'],
    weights: [400, 700],
  },

  // ============================================================================
  // CYBERPUNK / FUTURISTIC FONTS - For high-tech, dystopian, neon aesthetics
  // ============================================================================
  {
    family: 'Orbitron',
    displayName: 'Orbitron',
    category: 'cyberpunk',
    description: 'Geometric futuristic font with sharp angles. Perfect for cyberpunk, sci-fi interfaces, space stations, and high-tech corporate dystopias. Clean and mechanical.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'sci_fi_space', 'post_apocalyptic'],
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Rajdhani',
    displayName: 'Rajdhani',
    category: 'cyberpunk',
    description: 'Futuristic Indian-inspired tech font. Great for cyberpunk with cultural diversity, tech megacities, and fusion of traditional and future aesthetics. Modern yet warm.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'sci_fi_space'],
    weights: [300, 400, 500, 600, 700],
  },
  {
    family: 'Audiowide',
    displayName: 'Audiowide',
    category: 'cyberpunk',
    description: 'Bold, wide futuristic display font. Ideal for neon signs, racing games, synthwave aesthetics, and cyberpunk club scenes. Loud and attention-grabbing.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'superhero'],
    weights: [400],
  },
  {
    family: 'Exo 2',
    displayName: 'Exo 2',
    category: 'cyberpunk',
    description: 'Versatile geometric sans-serif with tech feel. Works well for sci-fi, space exploration, corporate futures, and any modern futuristic setting. Highly readable.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'sci_fi_space', 'superhero'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Share Tech Mono',
    displayName: 'Share Tech Mono',
    category: 'cyberpunk',
    description: 'Technical monospace font for code and terminals. Perfect for hacking scenes, AI interfaces, matrix-style visuals, and tech-heavy cyberpunk. Clean terminal look.',
    fallback: 'monospace',
    bestFor: ['cyberpunk', 'sci_fi_space', 'mystery'],
    weights: [400],
  },
  {
    family: 'Electrolize',
    displayName: 'Electrolize',
    category: 'cyberpunk',
    description: 'Electronic circuit-inspired font. Great for robotics themes, AI storylines, electronic music scenes, and hard sci-fi with focus on technology. Angular and precise.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'sci_fi_space'],
    weights: [400],
  },
  {
    family: 'Michroma',
    displayName: 'Michroma',
    category: 'cyberpunk',
    description: 'Wide, geometric display font with futuristic feel. Best for space agencies, corporate megacorps, near-future settings, and sleek sci-fi interfaces. Professional futurism.',
    fallback: 'sans-serif',
    bestFor: ['cyberpunk', 'sci_fi_space'],
    weights: [400],
  },

  // ============================================================================
  // HORROR / GOTHIC FONTS - For dark, creepy, unsettling atmospheres
  // ============================================================================
  {
    family: 'Creepster',
    displayName: 'Creepster',
    category: 'horror',
    description: 'Dripping, horror movie style font. Perfect for campy horror, Halloween themes, monster movies, and B-movie aesthetics. Fun scary, not serious scary.',
    fallback: 'cursive',
    bestFor: ['cosmic_horror', 'comedy'],
    weights: [400],
  },
  {
    family: 'Nosifer',
    displayName: 'Nosifer',
    category: 'horror',
    description: 'Vampire/gothic horror font with blood drip effect. Great for vampire stories, gothic horror, and classic monster themes. Very theatrical and dramatic.',
    fallback: 'cursive',
    bestFor: ['dark_fantasy', 'cosmic_horror'],
    weights: [400],
  },
  {
    family: 'Eater',
    displayName: 'Eater',
    category: 'horror',
    description: 'Aggressive, textured horror font. Best for intense horror, survival horror, and visceral scary experiences. Raw and unsettling appearance.',
    fallback: 'cursive',
    bestFor: ['cosmic_horror', 'dark_fantasy', 'post_apocalyptic'],
    weights: [400],
  },
  {
    family: 'Butcherman',
    displayName: 'Butcherman',
    category: 'horror',
    description: 'Slasher movie style font with knife-cut aesthetic. Perfect for survival horror, serial killer themes, and intense psychological horror. Sharp and dangerous.',
    fallback: 'cursive',
    bestFor: ['cosmic_horror', 'mystery', 'noir'],
    weights: [400],
  },
  {
    family: 'Jolly Lodger',
    displayName: 'Jolly Lodger',
    category: 'horror',
    description: 'Victorian gothic style with slight horror touch. Great for haunted houses, ghost stories, Victorian horror, and elegant darkness. Spooky but refined.',
    fallback: 'cursive',
    bestFor: ['cosmic_horror', 'dark_fantasy', 'mystery', 'steampunk'],
    weights: [400],
  },

  // ============================================================================
  // SCI-FI FONTS - For space exploration, clean futures, technology
  // ============================================================================
  {
    family: 'Titillium Web',
    displayName: 'Titillium Web',
    category: 'sci_fi',
    description: 'Clean, modern sans-serif with tech feel. Versatile for any sci-fi setting, space exploration, near-future, and technology-focused narratives. Highly readable.',
    fallback: 'sans-serif',
    bestFor: ['sci_fi_space', 'cyberpunk', 'superhero'],
    weights: [200, 300, 400, 600, 700, 900],
  },
  {
    family: 'Jura',
    displayName: 'Jura',
    category: 'sci_fi',
    description: 'Elegant futuristic font with subtle curves. Perfect for utopian futures, advanced civilizations, and sophisticated sci-fi. Clean and optimistic feel.',
    fallback: 'sans-serif',
    bestFor: ['sci_fi_space', 'epic_fantasy'],
    weights: [300, 400, 500, 600, 700],
  },
  {
    family: 'Aldrich',
    displayName: 'Aldrich',
    category: 'sci_fi',
    description: 'Industrial sci-fi font with engineering aesthetic. Great for space ships, military sci-fi, and practical future settings. Functional and sturdy.',
    fallback: 'sans-serif',
    bestFor: ['sci_fi_space', 'post_apocalyptic'],
    weights: [400],
  },
  {
    family: 'Nova Square',
    displayName: 'Nova Square',
    category: 'sci_fi',
    description: 'Square-ish retro-futuristic font. Perfect for 1960s-70s space age aesthetics, retro sci-fi, and atomic age themes. Vintage future look.',
    fallback: 'sans-serif',
    bestFor: ['sci_fi_space', 'comedy'],
    weights: [400],
  },
  {
    family: 'Saira',
    displayName: 'Saira',
    category: 'sci_fi',
    description: 'Modern condensed font with tech influence. Works well for racing, sports sci-fi, action-oriented futures, and dynamic storytelling. Energetic and forward-moving.',
    fallback: 'sans-serif',
    bestFor: ['sci_fi_space', 'cyberpunk', 'superhero'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },

  // ============================================================================
  // ELEGANT / CLASSIC FONTS - For sophisticated, refined narratives
  // ============================================================================
  {
    family: 'Playfair Display',
    displayName: 'Playfair Display',
    category: 'elegant',
    description: 'High-contrast serif with classic elegance. Perfect for period dramas, romance, high society settings, and sophisticated narratives. Timeless and beautiful.',
    fallback: 'serif',
    bestFor: ['romance', 'mystery', 'historical', 'noir'],
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Cormorant Garamond',
    displayName: 'Cormorant Garamond',
    category: 'elegant',
    description: 'Refined display serif inspired by Garamond. Great for literary narratives, classic settings, and games with focus on beautiful prose. Sophisticated and readable.',
    fallback: 'serif',
    bestFor: ['romance', 'historical', 'epic_fantasy', 'mystery'],
    weights: [300, 400, 500, 600, 700],
  },
  {
    family: 'Spectral',
    displayName: 'Spectral',
    category: 'elegant',
    description: 'Modern serif optimized for screen reading. Works well for any narrative-heavy game, visual novels, and story-focused experiences. Clear and elegant.',
    fallback: 'serif',
    bestFor: ['romance', 'mystery', 'slice_of_life', 'historical'],
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  {
    family: 'Libre Baskerville',
    displayName: 'Libre Baskerville',
    category: 'elegant',
    description: 'Classic Baskerville revival for digital reading. Perfect for traditional narratives, book-like experiences, and classic storytelling. Warm and inviting.',
    fallback: 'serif',
    bestFor: ['historical', 'romance', 'mystery', 'epic_fantasy'],
    weights: [400, 700],
  },

  // ============================================================================
  // HANDWRITTEN / PERSONAL FONTS - For journals, personal stories
  // ============================================================================
  {
    family: 'Caveat',
    displayName: 'Caveat',
    category: 'handwritten',
    description: 'Casual handwriting style. Great for personal journals, slice of life stories, notes and letters within games. Friendly and approachable.',
    fallback: 'cursive',
    bestFor: ['slice_of_life', 'romance', 'comedy'],
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Patrick Hand',
    displayName: 'Patrick Hand',
    category: 'handwritten',
    description: 'Neat handwriting font. Perfect for casual notes, friendly characters, and warm personal narratives. Clean but personal.',
    fallback: 'cursive',
    bestFor: ['slice_of_life', 'comedy', 'romance'],
    weights: [400],
  },
  {
    family: 'Indie Flower',
    displayName: 'Indie Flower',
    category: 'handwritten',
    description: 'Whimsical, playful handwriting. Best for lighthearted stories, children themes, and carefree narratives. Very casual and fun.',
    fallback: 'cursive',
    bestFor: ['comedy', 'slice_of_life'],
    weights: [400],
  },
  {
    family: 'Shadows Into Light',
    displayName: 'Shadows Into Light',
    category: 'handwritten',
    description: 'Artistic handwriting with character. Great for emotional moments, personal confessions, and intimate narrative beats. Expressive and artistic.',
    fallback: 'cursive',
    bestFor: ['romance', 'slice_of_life', 'mystery'],
    weights: [400],
  },

  // ============================================================================
  // TYPEWRITER FONTS - For noir, detective, vintage aesthetics
  // ============================================================================
  {
    family: 'Special Elite',
    displayName: 'Special Elite',
    category: 'typewriter',
    description: 'Classic typewriter font with worn keys effect. Perfect for noir detective stories, vintage settings, investigation games, and 1940s-50s aesthetics. Authentic vintage feel.',
    fallback: 'monospace',
    bestFor: ['noir', 'mystery', 'historical'],
    weights: [400],
  },
  {
    family: 'Courier Prime',
    displayName: 'Courier Prime',
    category: 'typewriter',
    description: 'Clean typewriter font, screenplay standard. Great for police procedurals, documentation-heavy games, and professional vintage look. Clean and official.',
    fallback: 'monospace',
    bestFor: ['noir', 'mystery', 'sci_fi_space'],
    weights: [400, 700],
  },
  {
    family: 'Cutive Mono',
    displayName: 'Cutive Mono',
    category: 'typewriter',
    description: 'Monospace typewriter with slight warmth. Works well for personal letters in period pieces, old records, and vintage documentation. Readable vintage.',
    fallback: 'monospace',
    bestFor: ['noir', 'mystery', 'historical', 'steampunk'],
    weights: [400],
  },

  // ============================================================================
  // COMIC / SUPERHERO FONTS - For action, fun, dynamic storytelling
  // ============================================================================
  {
    family: 'Bangers',
    displayName: 'Bangers',
    category: 'comic',
    description: 'Bold comic book style font. Perfect for superhero stories, action sequences, and dynamic comic-style narratives. Loud and impactful.',
    fallback: 'cursive',
    bestFor: ['superhero', 'comedy', 'sci_fi_space'],
    weights: [400],
  },
  {
    family: 'Permanent Marker',
    displayName: 'Permanent Marker',
    category: 'comic',
    description: 'Marker-drawn casual font. Great for casual action, street-level heroes, and gritty comic aesthetics. Raw and energetic.',
    fallback: 'cursive',
    bestFor: ['superhero', 'comedy', 'post_apocalyptic'],
    weights: [400],
  },
  {
    family: 'Luckiest Guy',
    displayName: 'Luckiest Guy',
    category: 'comic',
    description: 'Fun, bouncy display font. Perfect for comedic games, light-hearted adventures, and cartoony aesthetics. Very playful.',
    fallback: 'cursive',
    bestFor: ['comedy', 'superhero'],
    weights: [400],
  },
  {
    family: 'Comic Neue',
    displayName: 'Comic Neue',
    category: 'comic',
    description: 'Modern take on comic sans aesthetic. Good for casual games, family-friendly content, and approachable narratives. Friendly without being childish.',
    fallback: 'cursive',
    bestFor: ['comedy', 'slice_of_life', 'superhero'],
    weights: [300, 400, 700],
  },

  // ============================================================================
  // ANCIENT / RUNIC FONTS - For historical, mythological themes
  // ============================================================================
  {
    family: 'Noto Sans Runic',
    displayName: 'Noto Sans Runic',
    category: 'ancient',
    description: 'Authentic runic alphabet font. Perfect for Viking themes, Norse mythology, and ancient Germanic settings. Use for flavor text and special elements.',
    fallback: 'serif',
    bestFor: ['epic_fantasy', 'dark_fantasy', 'historical'],
    weights: [400],
  },
  {
    family: 'Jim Nightshade',
    displayName: 'Jim Nightshade',
    category: 'ancient',
    description: 'Stylized blackletter with magical feel. Great for old spellbooks, ancient texts, and mystical documents. Ornate and mysterious.',
    fallback: 'cursive',
    bestFor: ['dark_fantasy', 'epic_fantasy', 'cosmic_horror'],
    weights: [400],
  },

  // ============================================================================
  // STEAMPUNK FONTS - For Victorian industrial, brass & steam aesthetics
  // ============================================================================
  {
    family: 'Abril Fatface',
    displayName: 'Abril Fatface',
    category: 'display',
    description: 'Bold didone display font with Victorian flair. Perfect for steampunk headlines, Victorian era, and elegant industrial aesthetics. Dramatic and sophisticated.',
    fallback: 'serif',
    bestFor: ['steampunk', 'historical', 'noir', 'mystery'],
    weights: [400],
  },
  {
    family: 'Cardo',
    displayName: 'Cardo',
    category: 'elegant',
    description: 'Scholarly old-style serif. Great for academic settings, historical documents, and Victorian scholarly themes. Learned and traditional.',
    fallback: 'serif',
    bestFor: ['steampunk', 'historical', 'mystery'],
    weights: [400, 700],
  },

  // ============================================================================
  // MODERN / CLEAN FONTS - For contemporary, minimalist narratives
  // ============================================================================
  {
    family: 'Inter',
    displayName: 'Inter',
    category: 'modern',
    description: 'Highly readable modern sans-serif. Versatile for any contemporary setting, clean UI needs, and modern slice-of-life. Neutral and professional.',
    fallback: 'sans-serif',
    bestFor: ['slice_of_life', 'mystery', 'superhero'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Source Sans 3',
    displayName: 'Source Sans 3',
    category: 'modern',
    description: 'Clean Adobe open source sans-serif. Works for corporate settings, near-future, and professional environments. Clear and efficient.',
    fallback: 'sans-serif',
    bestFor: ['slice_of_life', 'cyberpunk', 'mystery'],
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    family: 'Nunito',
    displayName: 'Nunito',
    category: 'modern',
    description: 'Rounded friendly sans-serif. Perfect for approachable games, family content, and warm modern settings. Soft and welcoming.',
    fallback: 'sans-serif',
    bestFor: ['slice_of_life', 'comedy', 'romance'],
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
  },

  // ============================================================================
  // POST-APOCALYPTIC FONTS - For survival, wasteland, decay aesthetics
  // ============================================================================
  {
    family: 'Teko',
    displayName: 'Teko',
    category: 'display',
    description: 'Condensed industrial font. Great for post-apocalyptic UI, military themes, and survival scenarios. Utilitarian and stark.',
    fallback: 'sans-serif',
    bestFor: ['post_apocalyptic', 'sci_fi_space', 'superhero'],
    weights: [300, 400, 500, 600, 700],
  },
  {
    family: 'Russo One',
    displayName: 'Russo One',
    category: 'display',
    description: 'Bold Soviet-inspired display font. Perfect for Cold War themes, brutalist aesthetics, and authoritarian settings. Strong and imposing.',
    fallback: 'sans-serif',
    bestFor: ['post_apocalyptic', 'sci_fi_space', 'noir'],
    weights: [400],
  },
];

/**
 * Default font used when no themed font is selected.
 */
export const DEFAULT_FONT: ThemedFont = THEMED_FONTS.find(f => f.family === 'VT323')!;

/**
 * Get all fonts of a specific category.
 */
export function getFontsByCategory(category: FontCategory): ThemedFont[] {
  return THEMED_FONTS.filter(f => f.category === category);
}

/**
 * Get a font by its family name.
 */
export function getFontByFamily(family: string): ThemedFont | undefined {
  return THEMED_FONTS.find(f => f.family === family);
}

/**
 * Get fonts recommended for a specific narrative genre.
 */
export function getFontsForGenre(genre: string): ThemedFont[] {
  return THEMED_FONTS.filter(f => f.bestFor.includes(genre));
}

/**
 * Get all font families as a comma-separated string for Google Fonts URL.
 * Format: family=Font+Name:wght@400;700&family=Another+Font:wght@400
 */
export function getGoogleFontsUrlParams(): string {
  return THEMED_FONTS.map(font => {
    const familyName = font.family.replace(/ /g, '+');
    const weights = font.weights.join(';');
    return `family=${familyName}:wght@${weights}`;
  }).join('&');
}

/**
 * Generate the complete Google Fonts URL for all themed fonts.
 */
export function getGoogleFontsUrl(): string {
  return `https://fonts.googleapis.com/css2?${getGoogleFontsUrlParams()}&display=swap`;
}

/**
 * Build a CSS font-family value for a themed font.
 */
export function buildFontFamily(font: ThemedFont): string {
  return `'${font.family}', ${font.fallback}`;
}

/**
 * Build a font registry string for LLM prompts.
 * Includes all fonts with their descriptions for AI selection.
 */
export function buildFontRegistryForPrompt(): string {
  const grouped: Record<FontCategory, ThemedFont[]> = {} as any;

  THEMED_FONTS.forEach(font => {
    if (!grouped[font.category]) {
      grouped[font.category] = [];
    }
    grouped[font.category].push(font);
  });

  let result = '';

  const categoryDescriptions: Record<FontCategory, string> = {
    pixel: 'PIXEL/RETRO - Old computer, 8-bit, DOS-style fonts',
    fantasy: 'FANTASY - Medieval, magical, RPG-style fonts',
    cyberpunk: 'CYBERPUNK - Futuristic, neon, tech-noir fonts',
    horror: 'HORROR - Creepy, gothic, unsettling fonts',
    sci_fi: 'SCI-FI - Clean futuristic, space-age fonts',
    elegant: 'ELEGANT - Sophisticated, classic, refined fonts',
    handwritten: 'HANDWRITTEN - Personal, journal-like fonts',
    typewriter: 'TYPEWRITER - Noir detective, vintage fonts',
    comic: 'COMIC - Fun, superhero, dynamic fonts',
    ancient: 'ANCIENT - Historical, runic, mythological fonts',
    modern: 'MODERN - Clean, contemporary fonts',
    display: 'DISPLAY - Bold statement, header fonts',
  };

  for (const [category, description] of Object.entries(categoryDescriptions)) {
    const fonts = grouped[category as FontCategory];
    if (!fonts || fonts.length === 0) continue;

    result += `\n### ${description}\n`;
    fonts.forEach(font => {
      result += `- **${font.family}**: ${font.description}\n`;
    });
  }

  return result;
}
