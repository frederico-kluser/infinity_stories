import React, { useEffect, useState } from 'react';
import { X, Sparkles, Info, BookText } from 'lucide-react';
import { VoiceInput } from '../VoiceInput';
import { Language, NarrativeStyleMode, NarrativeGenre } from '../../types';

interface NarrativeStyleModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentMode: NarrativeStyleMode;
	currentStyle?: string;
	genre?: NarrativeGenre;
	onSave: (mode: NarrativeStyleMode, customStyle?: string) => Promise<void> | void;
	t: Record<string, string>;
	apiKey: string;
	language: Language;
}

const MODE_DETAILS: Record<NarrativeStyleMode, { title: string; description: string }> = {
	auto: {
		title: 'Auto Genre Mode',
		description: 'Keeps the current literary genre and lets the AI adapt tone dynamically for each scene.',
	},
	custom: {
		title: 'Custom Brief Mode',
		description:
			'Supply a bespoke writing brief describing rhythm, references, and mandatory techniques. The AI will obey it verbatim.',
	},
};

export const NarrativeStyleModal: React.FC<NarrativeStyleModalProps> = ({
	isOpen,
	onClose,
	currentMode,
	currentStyle,
	genre,
	onSave,
	t,
	apiKey,
	language,
}) => {
	const [mode, setMode] = useState<NarrativeStyleMode>(currentMode);
	const [customStyle, setCustomStyle] = useState<string>(currentStyle || '');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setMode(currentMode);
			setCustomStyle(currentStyle || '');
			setError(null);
		}
	}, [isOpen, currentMode, currentStyle]);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (mode === 'custom' && !customStyle.trim()) {
			setError(t.narrativeStyleRequired || 'Describe your narrative style before continuing.');
			return;
		}

		setSaving(true);
		try {
			await onSave(mode, customStyle.trim());
			onClose();
		} catch (err) {
			console.error('📝 [Narrative Style] Update failed:', err);
			setError(t.narrativeStyleUpdateError || 'Unable to update narrative style. Try again.');
		} finally {
			setSaving(false);
		}
	};

	const modeInfo = MODE_DETAILS[mode];

	const handleVoiceTranscription = (text: string) => {
		setCustomStyle((prev) => {
			if (!prev.trim()) {
				return text;
			}
			return `${prev.trimEnd()}\n${text}`;
		});
		setError(null);
	};

	return (
		<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
			<div className="bg-[#f5f5f4] border-2 border-stone-900 w-full max-w-2xl shadow-[12px_12px_0px_rgba(0,0,0,1)] relative">
				<div className="p-5 border-b-2 border-stone-900 bg-stone-800 flex justify-between items-center">
					<h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
						<Sparkles className="w-6 h-6" />
						{t.narrativeStyleEditorTitle || 'Narrative Style Editor'}
					</h2>
					<button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="p-5 space-y-4">
					<div className="p-4 border-2 border-dashed border-stone-400 bg-white">
						<div className="flex items-center gap-2 text-stone-700 text-sm font-bold uppercase">
							<BookText className="w-4 h-4" />
							{t.narrativeStyleCurrentLabel || 'Active Narrative Context'}
						</div>
						<div className="mt-2 text-sm text-stone-600">
							<p>
								<strong>{t.narrativeStyleModeLabel || 'Mode'}:</strong> {modeInfo.title}
							</p>
							<p>
								<strong>{t.narrativeStyleGenreLabel || 'Genre'}:</strong>{' '}
								{genre || t.narrativeStyleGenreFallback || 'Not defined'}
							</p>
							{(currentStyle || '').trim() && (
								<p className="mt-2 text-xs text-stone-500">
									{t.narrativeStyleLastCustom || 'Last custom brief:'}
									<span className="block mt-1 font-mono text-[11px] bg-stone-100 border border-stone-200 p-2">
										{currentStyle}
									</span>
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{(Object.keys(MODE_DETAILS) as NarrativeStyleMode[]).map((option) => (
							<button
								key={option}
								onClick={() => setMode(option)}
								className={`p-4 border-2 text-left transition-all ${
									mode === option
										? 'bg-stone-900 text-white border-stone-900'
										: 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
								}`}
							>
								<h3 className="font-black uppercase text-sm">{MODE_DETAILS[option].title}</h3>
								<p className="text-xs mt-2 text-stone-200 md:text-stone-500">{MODE_DETAILS[option].description}</p>
							</button>
						))}
					</div>

					{mode === 'custom' && (
						<div className="space-y-3">
							<div className="flex gap-3 border border-dashed border-stone-300 bg-stone-50 p-3">
								<Info className="w-4 h-4 text-stone-500 mt-0.5" />
								<div>
									<p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
										{t.narrativeStyleInfoTitle || 'How to describe it'}
									</p>
									<p className="text-[11px] text-stone-600 leading-snug">
										{t.narrativeStyleInfoBody ||
											'Specify cadence, references, and rules such as "present tense, cinematic, focus on sensory details".'}
									</p>
								</div>
							</div>
					<div className="relative">
						<textarea
							value={customStyle}
							onChange={(e) => {
								setCustomStyle(e.target.value);
								if (error) {
									setError(null);
								}
							}}
							className="w-full bg-white border-2 border-stone-400 p-3 pr-12 text-sm text-stone-900 focus:border-stone-900 outline-none min-h-[140px]"
							placeholder={t.narrativeStylePlaceholder}
						/>
						<div className="absolute top-3 right-3">
							<VoiceInput
								apiKey={apiKey}
								language={language}
								onTranscription={handleVoiceTranscription}
								disabled={saving}
								className="text-stone-400 hover:text-stone-900"
							/>
						</div>
					</div>
						</div>
					)}

					{error && <p className="text-sm text-red-600 font-bold">{error}</p>}
				</div>

				<div className="p-4 border-t-2 border-stone-300 bg-stone-50 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 py-3 px-4 bg-stone-200 text-stone-800 font-bold uppercase text-sm hover:bg-stone-300 transition-colors"
						disabled={saving}
					>
						{t.cancel || 'Cancel'}
					</button>
					<button
						onClick={handleSave}
						className="flex-1 py-3 px-4 bg-stone-900 text-white font-bold uppercase text-sm tracking-wide hover:bg-stone-700 transition-colors"
						disabled={saving}
					>
						{saving ? t.saving || 'Saving...' : t.save || 'Save Style'}
					</button>
				</div>
			</div>
		</div>
	);
};
