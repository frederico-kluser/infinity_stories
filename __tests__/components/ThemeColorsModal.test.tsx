import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeColorsModal } from '../../components/ThemeColorsModal';
import { ThemeColorsProvider } from '../../hooks/useThemeColors';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Palette: () => <span data-testid="palette-icon">Palette</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>,
  RefreshCw: () => <span data-testid="refresh-icon">Refresh</span>,
  Type: () => <span data-testid="type-icon">Type</span>,
  Minus: () => <span data-testid="minus-icon">-</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
  Mic: () => <span data-testid="mic-icon">Mic</span>,
  Square: () => <span data-testid="square-icon">Square</span>,
}));

// Mock fonts constant
jest.mock('../../constants/fonts', () => ({
  getFontByFamily: jest.fn().mockReturnValue({
    family: 'VT323',
    category: 'retro',
    description: 'Retro terminal style font. Perfect for cyberpunk themes.',
  }),
  buildFontFamily: jest.fn().mockReturnValue("'VT323', monospace"),
  DEFAULT_FONT: {
    family: 'VT323',
    category: 'retro',
    description: 'Retro terminal style font.',
  },
}));

// Mock VoiceInput component
jest.mock('../../components/VoiceInput', () => ({
  VoiceInput: ({ onTranscription, disabled }: { onTranscription: (text: string) => void; disabled?: boolean }) => (
    <button
      data-testid="voice-input"
      onClick={() => onTranscription('voice text')}
      disabled={disabled}
    >
      Voice
    </button>
  ),
}));

// Helper to render with ThemeColorsProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeColorsProvider>{ui}</ThemeColorsProvider>);
};

const createDefaultProps = () => ({
  isOpen: true,
  onClose: jest.fn(),
  onRegenerateColors: jest.fn().mockResolvedValue(undefined),
  onRegenerateFont: jest.fn().mockResolvedValue(undefined),
  onFontSizeChange: jest.fn(),
  isGeneratingColors: false,
  isGeneratingFont: false,
  apiKey: 'test-api-key',
  language: 'en' as const,
});

describe('ThemeColorsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render nothing when isOpen is false', () => {
      const props = { ...createDefaultProps(), isOpen: false };
      const { container } = renderWithTheme(<ThemeColorsModal {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('Theme Settings')).toBeInTheDocument();
    });

    it('should match snapshot when open', () => {
      const props = createDefaultProps();
      const { container } = renderWithTheme(<ThemeColorsModal {...props} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot while generating colors', () => {
      const props = { ...createDefaultProps(), isGeneratingColors: true };
      const { container } = renderWithTheme(<ThemeColorsModal {...props} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot while generating font', () => {
      const props = { ...createDefaultProps(), isGeneratingFont: true };
      const { container } = renderWithTheme(<ThemeColorsModal {...props} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('color palette section', () => {
    it('should display color palette section', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('Color Palette')).toBeInTheDocument();
    });

    it('should display 8 color swatches', () => {
      const props = createDefaultProps();
      const { container } = renderWithTheme(<ThemeColorsModal {...props} />);
      const swatches = container.querySelectorAll('[class*="w-8 h-8"]');
      expect(swatches).toHaveLength(8);
    });

    it('should allow typing in the color textarea', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const textarea = screen.getByPlaceholderText(/darker tones/);
      fireEvent.change(textarea, { target: { value: 'more vibrant colors' } });

      expect(textarea).toHaveValue('more vibrant colors');
    });

    it('should call onRegenerateColors with input when Apply is clicked', async () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const textarea = screen.getByPlaceholderText(/darker tones/);
      fireEvent.change(textarea, { target: { value: 'cyberpunk style' } });

      const applyButtons = screen.getAllByText('Apply');
      fireEvent.click(applyButtons[0]); // First Apply is for colors

      await waitFor(() => {
        expect(props.onRegenerateColors).toHaveBeenCalledWith('cyberpunk style');
      });
    });

    it('should call onRegenerateColors without input when Quick is clicked', async () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const quickButtons = screen.getAllByText('Quick');
      fireEvent.click(quickButtons[0]); // First Quick is for colors

      await waitFor(() => {
        expect(props.onRegenerateColors).toHaveBeenCalledWith();
      });
    });
  });

  describe('font style section', () => {
    it('should display font style section', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('Font Style')).toBeInTheDocument();
    });

    it('should display font name', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('VT323')).toBeInTheDocument();
    });

    it('should allow typing in the font textarea', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const textarea = screen.getByPlaceholderText(/pixel font/);
      fireEvent.change(textarea, { target: { value: 'elegant serif' } });

      expect(textarea).toHaveValue('elegant serif');
    });

    it('should call onRegenerateFont with input when Apply is clicked', async () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const textarea = screen.getByPlaceholderText(/pixel font/);
      fireEvent.change(textarea, { target: { value: 'sci-fi style' } });

      const applyButtons = screen.getAllByText('Apply');
      fireEvent.click(applyButtons[1]); // Second Apply is for fonts

      await waitFor(() => {
        expect(props.onRegenerateFont).toHaveBeenCalledWith('sci-fi style');
      });
    });

    it('should call onRegenerateFont without input when Quick is clicked', async () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const quickButtons = screen.getAllByText('Quick');
      fireEvent.click(quickButtons[1]); // Second Quick is for fonts

      await waitFor(() => {
        expect(props.onRegenerateFont).toHaveBeenCalledWith();
      });
    });
  });

  describe('font size section', () => {
    it('should display font size section', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('Font Size')).toBeInTheDocument();
    });

    it('should display current font size percentage', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should call onFontSizeChange with negative delta when minus is clicked', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const minusButton = screen.getByTestId('minus-icon').closest('button');
      if (minusButton) {
        fireEvent.click(minusButton);
      }

      expect(props.onFontSizeChange).toHaveBeenCalledWith(-0.1);
    });

    it('should call onFontSizeChange with positive delta when plus is clicked', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const plusButton = screen.getByTestId('plus-icon').closest('button');
      if (plusButton) {
        fireEvent.click(plusButton);
      }

      expect(props.onFontSizeChange).toHaveBeenCalledWith(0.1);
    });
  });

  describe('close functionality', () => {
    it('should call onClose when X button is clicked', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(
        (btn) => btn.querySelector('[data-testid="x-icon"]')
      );
      if (xButton) {
        fireEvent.click(xButton);
      }

      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe('info text', () => {
    it('should display info text about changes', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      expect(screen.getByText(/All changes are saved to this game only/)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loader icon when generating colors', () => {
      const props = { ...createDefaultProps(), isGeneratingColors: true };
      renderWithTheme(<ThemeColorsModal {...props} />);

      expect(screen.getAllByTestId('loader-icon').length).toBeGreaterThanOrEqual(1);
    });

    it('should show loader icon when generating font', () => {
      const props = { ...createDefaultProps(), isGeneratingFont: true };
      renderWithTheme(<ThemeColorsModal {...props} />);

      expect(screen.getAllByTestId('loader-icon').length).toBeGreaterThanOrEqual(1);
    });

    it('should disable textareas while generating', () => {
      const props = { ...createDefaultProps(), isGeneratingColors: true };
      renderWithTheme(<ThemeColorsModal {...props} />);

      const colorTextarea = screen.getByPlaceholderText(/darker tones/);
      const fontTextarea = screen.getByPlaceholderText(/pixel font/);

      expect(colorTextarea).toBeDisabled();
      expect(fontTextarea).toBeDisabled();
    });
  });

  describe('voice input', () => {
    it('should render voice input buttons', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      expect(screen.getAllByTestId('voice-input')).toHaveLength(2);
    });

    it('should append voice transcription to color input', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const voiceButtons = screen.getAllByTestId('voice-input');
      fireEvent.click(voiceButtons[0]); // First voice input is for colors

      const colorTextarea = screen.getByPlaceholderText(/darker tones/);
      expect(colorTextarea).toHaveValue('voice text');
    });

    it('should append voice transcription to font input', () => {
      const props = createDefaultProps();
      renderWithTheme(<ThemeColorsModal {...props} />);

      const voiceButtons = screen.getAllByTestId('voice-input');
      fireEvent.click(voiceButtons[1]); // Second voice input is for fonts

      const fontTextarea = screen.getByPlaceholderText(/pixel font/);
      expect(fontTextarea).toHaveValue('voice text');
    });
  });
});
