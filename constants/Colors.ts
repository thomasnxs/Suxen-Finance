// GastosApp/constants/colors.ts

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  accent: string; // Cor de destaque geral
  success: string;
  danger: string;
  warning: string;
  info: string;    // Pode ser usado para informações, ou como outra cor de destaque
  invested: string;
  disabled: string;
  placeholder: string;
  switchThumb: string;
  switchTrackFalse: string;
  switchTrackTrue: string;
  headerBackground: string;
  headerText: string;
  icon: string;
  isDark?: boolean;

  // Cores transparentes
  dangerTransparent: string;
  warningTransparent: string;
  primaryTransparent: string;
  successTransparent: string;
  investedTransparent: string;
  infoTransparent: string; // Adicionada para a cor 'info'

  separatorLine: string;
}

// Sua paleta principal
const PALETTE_GREEN = '#16C47F';
const PALETTE_YELLOW = '#FFD65A';
const PALETTE_ORANGE = '#FF9D23';
const PALETTE_RED_CORAL = '#F93827';

export const lightColors: ThemeColors = {
  background: '#F4F6F8',         // Cinza muito claro para o fundo
  card: '#FFFFFF',               // Cards brancos
  text: '#2c3e50',               // Texto principal (cinza escuro azulado)
  secondaryText: '#7f8c8d',      // Texto secundário (cinza médio)
  border: '#bdc3c7',             // Bordas (cinza claro)
  
  primary: PALETTE_GREEN,
  accent: PALETTE_YELLOW,         // Amarelo como cor de destaque geral
  success: PALETTE_GREEN,         // Verde para sucesso
  danger: PALETTE_RED_CORAL,      // Vermelho/Coral para perigo
  warning: PALETTE_ORANGE,        // Laranja para aviso
  info: PALETTE_YELLOW,           // Amarelo para informação (ou azul se preferir, mas usando sua paleta)
  invested: PALETTE_YELLOW,       // Amarelo para investimentos

  disabled: '#cccccc',            // Cinza claro para desabilitado
  placeholder: '#a0a0a0',         // Cinza para placeholder
  switchThumb: '#FFFFFF',
  switchTrackFalse: '#bdc3c7',
  switchTrackTrue: PALETTE_GREEN,
  headerBackground: PALETTE_GREEN, // Header com cor primária
  headerText: '#FFFFFF',          // Texto do header branco para contraste
  icon: PALETTE_GREEN,            // Ícones com cor primária por padrão

  isDark: false,

  dangerTransparent: `${PALETTE_RED_CORAL}33`,
  warningTransparent: `${PALETTE_ORANGE}33`,
  primaryTransparent: `${PALETTE_GREEN}33`,
  successTransparent: `${PALETTE_GREEN}33`,
  investedTransparent: `${PALETTE_YELLOW}33`,
  infoTransparent: `${PALETTE_YELLOW}33`,

  separatorLine: 'rgba(0, 0, 0, 0.1)', 
};

export const darkColors: ThemeColors = {
  background: '#1A1D21',         // Fundo bem escuro
  card: '#282C34',               // Cards um pouco mais claros que o fundo
  text: '#E1E1E1',               // Texto principal claro
  secondaryText: '#909399',      // Texto secundário (cinza claro)
  border: '#3A3F4B',             // Bordas (cinza escuro)

  primary: PALETTE_GREEN,         // Verde pode se manter vibrante
  accent: PALETTE_YELLOW,         // Amarelo pode se manter vibrante
  success: PALETTE_GREEN,         // Verde para sucesso
  danger: PALETTE_RED_CORAL,      // Vermelho/Coral para perigo
  warning: PALETTE_ORANGE,        // Laranja para aviso
  info: PALETTE_YELLOW,           // Amarelo para informação
  invested: PALETTE_YELLOW,       // Amarelo para investimentos

  disabled: '#4B515D',            // Cinza escuro para desabilitado
  placeholder: '#6C737E',         // Cinza médio-escuro para placeholder
  switchThumb: '#E1E1E1',
  switchTrackFalse: '#505054',
  switchTrackTrue: PALETTE_GREEN,
  headerBackground: '#21252B',    // Header escuro
  headerText: '#16C47F',          // Texto do header branco
  icon: PALETTE_GREEN,            // Ícones com cor primária

  isDark: true,

  dangerTransparent: `${PALETTE_RED_CORAL}4D`, // 30% de opacidade para fundos escuros
  warningTransparent: `${PALETTE_ORANGE}4D`,
  primaryTransparent: `${PALETTE_GREEN}4D`,
  successTransparent: `${PALETTE_GREEN}4D`,
  investedTransparent: `${PALETTE_YELLOW}4D`,
  infoTransparent: `${PALETTE_YELLOW}4D`,

  separatorLine: 'rgba(255, 255, 255, 0.15)',
};