import React from 'react';
import { X, Map, Swords, Backpack, MessageSquare, Compass } from 'lucide-react';
import { ThemeColors } from '../types';

interface TutorialModalProps {
	isOpen: boolean;
	onClose: () => void;
	colors: ThemeColors;
}

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; colors: ThemeColors }> = ({ icon, title, colors, children }) => (
	<div>
		<div className="flex items-center gap-2 mb-2">
			<span className="p-1.5 rounded-sm border" style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}>
				{icon}
			</span>
			<h3 className="text-base font-bold uppercase tracking-wide" style={{ color: colors.text }}>
				{title}
			</h3>
		</div>
		<div className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
			{children}
		</div>
	</div>
);

const QuestionBadge: React.FC<{ colors: ThemeColors; size?: 'sm' | 'md' | 'lg' }> = ({ colors, size = 'md' }) => {
	const sizeClasses =
		{
			sm: 'w-4 h-4 text-[10px]',
			md: 'w-5 h-5 text-xs',
			lg: 'w-8 h-8 text-lg',
		}[size] || 'w-5 h-5 text-xs';

	return (
		<span
			className={`flex items-center justify-center rounded-full border-2 font-black ${sizeClasses}`}
			style={{ borderColor: colors.textAccent, color: colors.textAccent }}
		>
			?
		</span>
	);
};

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, colors }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/70" onClick={onClose} />
			<div
				role="dialog"
				aria-modal="true"
				className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden rounded-md border-4 shadow-2xl"
				style={{
					backgroundColor: colors.background,
					borderColor: colors.borderStrong,
					boxShadow: `12px 12px 0 ${colors.shadow}`,
				}}
			>
				<button
					type="button"
					aria-label="Fechar tutorial"
					onClick={onClose}
					className="absolute top-3 right-3 p-2 rounded-sm border"
					style={{ backgroundColor: colors.buttonSecondary, borderColor: colors.border }}
				>
					<X className="w-4 h-4" style={{ color: colors.text }} />
				</button>

				<div className="overflow-y-auto max-h-[90vh] p-6 space-y-6">
					<header>
						<div className="flex items-center gap-2 mb-2">
							<QuestionBadge colors={colors} size="lg" />
							<h2 className="text-2xl font-black uppercase tracking-wider" style={{ color: colors.text }}>
								Guia Rápido do Storywell
							</h2>
						</div>
						<p className="text-sm" style={{ color: colors.textSecondary }}>
							Você é o protagonista e conversa com o universo por texto ou voz. Cada turno traz novas cenas, decisões
							e consequências — este painel explica os símbolos e onde encontrar cada recurso.
						</p>
					</header>

					<SectionTitle icon={<MessageSquare className="w-4 h-4" style={{ color: colors.text }} />} title="Como funciona o turno" colors={colors}>
						<ul className="list-disc pl-5 space-y-1">
							<li>Leia a carta atual: ela mostra a narração, diálogos e resultados do turno.</li>
							<li>Use as opções sugeridas ou descreva sua ação; o Mestre resolve tudo com o motor de física e destino.</li>
							<li>Cada resposta do jogo vira uma nova página. Avance com os botões ou gestos para acompanhar a história.</li>
						</ul>
					</SectionTitle>

					<SectionTitle icon={<Compass className="w-4 h-4" style={{ color: colors.text }} />} title="Dicas para explorar" colors={colors}>
						<ul className="list-disc pl-5 space-y-1">
							<li>Se mencionar portas, escadas ou portais, o cenário muda — repare nas descrições e use o mapa.</li>
							<li>Itens importantes aparecem no inventário; pergunte aos NPCs sobre rumores para desbloquear missões.</li>
							<li>O Fate (dado do destino) pode virar a situação para o bem ou para o mal — arrisque quando o ganho valer a pena.</li>
						</ul>
					</SectionTitle>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="p-4 rounded-sm border h-full" style={{ borderColor: colors.border }}>
							<div className="flex items-center gap-2 mb-2" style={{ color: colors.text }}>
								<Map className="w-4 h-4" />
								<div className="font-bold uppercase text-xs tracking-widest">Mapa</div>
							</div>
							<p className="text-sm" style={{ color: colors.textSecondary }}>
								Clique no botão <strong>Mapa</strong> ou no tabuleiro da carta para ver a posição de cada personagem. Quando o
								ícone piscar, significa que há atualizações não vistas.
							</p>
						</div>
						<div className="p-4 rounded-sm border h-full" style={{ borderColor: colors.border }}>
							<div className="flex items-center gap-2 mb-2" style={{ color: colors.text }}>
								<Swords className="w-4 h-4" />
								<div className="font-bold uppercase text-xs tracking-widest">Ações</div>
							</div>
							<p className="text-sm" style={{ color: colors.textSecondary }}>
								Abra o painel de ações para ver sugestões com risco/recompensa ou digite seu próprio plano. Cada opção mostra
								o que pode dar <em>bom</em> ou <em>ruim</em> no turno.
							</p>
						</div>
						<div className="p-4 rounded-sm border h-full" style={{ borderColor: colors.border }}>
							<div className="flex items-center gap-2 mb-2" style={{ color: colors.text }}>
								<Backpack className="w-4 h-4" />
								<div className="font-bold uppercase text-xs tracking-widest">Inventário</div>
							</div>
							<p className="text-sm" style={{ color: colors.textSecondary }}>
								Use o botão de mochila para abrir a ficha do personagem, conferir atributos, itens e relacionamentos.
							</p>
						</div>
						<div className="p-4 rounded-sm border h-full" style={{ borderColor: colors.border }}>
							<div className="flex items-center gap-2 mb-2" style={{ color: colors.text }}>
								<QuestionBadge colors={colors} />
								<div className="font-bold uppercase text-xs tracking-widest">Ajuda</div>
							</div>
							<p className="text-sm" style={{ color: colors.textSecondary }}>
								Este mesmo ícone de interrogação fica ao lado do botão de mapa. Clique quando quiser rever este guia.
							</p>
						</div>
					</div>

					<footer className="text-xs uppercase tracking-wider text-center" style={{ color: colors.textSecondary }}>
						Boa aventura! Faça perguntas, experimente ações malucas e deixe a história reagir a você.
					</footer>
				</div>
			</div>
		</div>
	);
};
