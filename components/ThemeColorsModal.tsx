import React, { useState } from 'react';
import { X, Palette, Loader2, RefreshCw, Type, Minus, Plus } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { getFontByFamily } from '../constants/fonts';
import { VoiceInput } from './VoiceInput';
import { Language } from '../types';

interface ThemeColorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerateColors: (userConsiderations?: string) => Promise<void>;
  onRegenerateFont: (userConsiderations?: string) => Promise<void>;
  onFontSizeChange: (delta: number) => void;
  isGeneratingColors: boolean;
  isGeneratingFont: boolean;
  apiKey: string;
  language: Language;
}

// Font size limits
const MIN_FONT_SIZE = 0.7;
const MAX_FONT_SIZE = 1.5;
const FONT_SIZE_STEP = 0.1;

/**
 * Modal component for managing theme colors, font style, and font size.
 * Each setting can be configured independently without affecting the others.
 */
export const ThemeColorsModal: React.FC<ThemeColorsModalProps> = ({
  isOpen,
  onClose,
  onRegenerateColors,
  onRegenerateFont,
  onFontSizeChange,
  isGeneratingColors,
  isGeneratingFont,
  apiKey,
  language
}) => {
  const [colorInput, setColorInput] = useState('');
  const [fontInput, setFontInput] = useState('');
  const { colors, fontFamily, fontFamilyCSS, fontSize } = useThemeColors();

  // Get font info for display
  const currentFont = getFontByFamily(fontFamily);

  if (!isOpen) return null;

  const handleRegenerateColors = async () => {
    await onRegenerateColors(colorInput.trim() || undefined);
    setColorInput('');
  };

  const handleRegenerateFont = async () => {
    await onRegenerateFont(fontInput.trim() || undefined);
    setFontInput('');
  };

  const handleQuickRegenerateColors = async () => {
    await onRegenerateColors();
  };

  const handleQuickRegenerateFont = async () => {
    await onRegenerateFont();
  };

  const handleFontSizeDecrease = () => {
    if (fontSize > MIN_FONT_SIZE) {
      onFontSizeChange(-FONT_SIZE_STEP);
    }
  };

  const handleFontSizeIncrease = () => {
    if (fontSize < MAX_FONT_SIZE) {
      onFontSizeChange(FONT_SIZE_STEP);
    }
  };

  const handleColorVoiceInput = (text: string) => {
    setColorInput((prev) => (prev ? prev + ' ' + text : text));
  };

  const handleFontVoiceInput = (text: string) => {
    setFontInput((prev) => (prev ? prev + ' ' + text : text));
  };

  const isAnyGenerating = isGeneratingColors || isGeneratingFont;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-lg relative animate-fade-in max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: colors.backgroundSecondary,
          border: `2px solid ${colors.borderStrong}`,
          boxShadow: `8px 8px 0px ${colors.shadow}`
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex justify-between items-center sticky top-0 z-10"
          style={{
            borderBottom: `2px solid ${colors.border}`,
            backgroundColor: colors.backgroundAccent
          }}
        >
          <h2
            className="text-xl font-bold uppercase flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Palette className="w-5 h-5" />
            Theme Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors hover:opacity-70"
            style={{ color: colors.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* ===== COLORS SECTION ===== */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" style={{ color: colors.textSecondary }} />
              <h3
                className="text-sm font-bold uppercase"
                style={{ color: colors.textSecondary }}
              >
                Color Palette
              </h3>
            </div>

            {/* Current Colors Preview */}
            <div className="mb-3">
              <div className="flex gap-1 flex-wrap">
                {[
                  colors.background,
                  colors.backgroundSecondary,
                  colors.backgroundAccent,
                  colors.text,
                  colors.buttonPrimary,
                  colors.success,
                  colors.warning,
                  colors.danger
                ].map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-sm"
                    style={{
                      backgroundColor: color,
                      border: `1px solid ${colors.border}`
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Color Input with Voice */}
            <div className="flex gap-2 mb-3">
              <textarea
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="e.g., 'darker tones', 'more vibrant', 'cyberpunk neon'..."
                rows={2}
                disabled={isAnyGenerating}
                className="flex-1 p-3 text-sm resize-none outline-none transition-all"
                style={{
                  backgroundColor: colors.background,
                  border: `2px solid ${colors.border}`,
                  color: colors.text,
                  opacity: isAnyGenerating ? 0.5 : 1
                }}
              />
              <VoiceInput
                onTranscription={handleColorVoiceInput}
                apiKey={apiKey}
                language={language}
                disabled={isAnyGenerating}
                className="self-end"
              />
            </div>

            {/* Color Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleQuickRegenerateColors}
                disabled={isAnyGenerating}
                className="flex-1 py-2 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: colors.buttonSecondary,
                  color: colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: isAnyGenerating ? 0.5 : 1
                }}
              >
                {isGeneratingColors ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Quick
              </button>
              <button
                onClick={handleRegenerateColors}
                disabled={isAnyGenerating || !colorInput.trim()}
                className="flex-1 py-2 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: colorInput.trim() ? colors.buttonPrimary : colors.buttonSecondary,
                  color: colorInput.trim() ? colors.buttonPrimaryText : colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: (isAnyGenerating || !colorInput.trim()) ? 0.5 : 1
                }}
              >
                {isGeneratingColors ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Palette className="w-3 h-3" />
                )}
                Apply
              </button>
            </div>
          </section>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${colors.border}` }} />

          {/* ===== FONT STYLE SECTION ===== */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4" style={{ color: colors.textSecondary }} />
              <h3
                className="text-sm font-bold uppercase"
                style={{ color: colors.textSecondary }}
              >
                Font Style
              </h3>
            </div>

            {/* Current Font Preview */}
            <div
              className="p-3 rounded-sm mb-3"
              style={{
                backgroundColor: colors.background,
                border: `2px solid ${colors.border}`,
              }}
            >
              <p
                className="text-lg mb-1"
                style={{ fontFamily: fontFamilyCSS, color: colors.text }}
              >
                {fontFamily}
              </p>
              {currentFont && (
                <p
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {currentFont.category.toUpperCase()} — {currentFont.description.split('.')[0]}
                </p>
              )}
            </div>

            {/* Font Input with Voice */}
            <div className="flex gap-2 mb-3">
              <textarea
                value={fontInput}
                onChange={(e) => setFontInput(e.target.value)}
                placeholder="e.g., 'pixel font', 'elegant serif', 'sci-fi style'..."
                rows={2}
                disabled={isAnyGenerating}
                className="flex-1 p-3 text-sm resize-none outline-none transition-all"
                style={{
                  backgroundColor: colors.background,
                  border: `2px solid ${colors.border}`,
                  color: colors.text,
                  opacity: isAnyGenerating ? 0.5 : 1
                }}
              />
              <VoiceInput
                onTranscription={handleFontVoiceInput}
                apiKey={apiKey}
                language={language}
                disabled={isAnyGenerating}
                className="self-end"
              />
            </div>

            {/* Font Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleQuickRegenerateFont}
                disabled={isAnyGenerating}
                className="flex-1 py-2 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: colors.buttonSecondary,
                  color: colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: isAnyGenerating ? 0.5 : 1
                }}
              >
                {isGeneratingFont ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Quick
              </button>
              <button
                onClick={handleRegenerateFont}
                disabled={isAnyGenerating || !fontInput.trim()}
                className="flex-1 py-2 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: fontInput.trim() ? colors.buttonPrimary : colors.buttonSecondary,
                  color: fontInput.trim() ? colors.buttonPrimaryText : colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: (isAnyGenerating || !fontInput.trim()) ? 0.5 : 1
                }}
              >
                {isGeneratingFont ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Type className="w-3 h-3" />
                )}
                Apply
              </button>
            </div>
          </section>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${colors.border}` }} />

          {/* ===== FONT SIZE SECTION ===== */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4" style={{ color: colors.textSecondary }} />
              <h3
                className="text-sm font-bold uppercase"
                style={{ color: colors.textSecondary }}
              >
                Font Size
              </h3>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleFontSizeDecrease}
                disabled={fontSize <= MIN_FONT_SIZE || isAnyGenerating}
                className="p-3 font-bold transition-all"
                style={{
                  backgroundColor: colors.buttonSecondary,
                  color: colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: (fontSize <= MIN_FONT_SIZE || isAnyGenerating) ? 0.5 : 1
                }}
              >
                <Minus className="w-5 h-5" />
              </button>

              <div
                className="px-6 py-3 min-w-[100px] text-center font-bold text-lg"
                style={{
                  backgroundColor: colors.background,
                  border: `2px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                {Math.round(fontSize * 100)}%
              </div>

              <button
                onClick={handleFontSizeIncrease}
                disabled={fontSize >= MAX_FONT_SIZE || isAnyGenerating}
                className="p-3 font-bold transition-all"
                style={{
                  backgroundColor: colors.buttonSecondary,
                  color: colors.buttonSecondaryText,
                  border: `2px solid ${colors.borderStrong}`,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                  opacity: (fontSize >= MAX_FONT_SIZE || isAnyGenerating) ? 0.5 : 1
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <p
              className="text-xs text-center mt-2"
              style={{ color: colors.textSecondary }}
            >
              Adjust the overall text size ({Math.round(MIN_FONT_SIZE * 100)}% - {Math.round(MAX_FONT_SIZE * 100)}%)
            </p>
          </section>

          {/* Info Text */}
          <p
            className="text-xs text-center pt-2"
            style={{ color: colors.textSecondary, borderTop: `1px solid ${colors.border}` }}
          >
            All changes are saved to this game only. Colors and fonts are generated based on your universe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeColorsModal;
