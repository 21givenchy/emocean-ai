export type VisualMode = 'focus' | 'calm' | 'create' | 'connect' | 'night';

export interface VisualTokens {
  color: {
    canvas: string;
    surface: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentText: string;
    incomingBubble: string;
    incomingBubbleText: string;
    outgoingBubble: string;
    outgoingBubbleText: string;
    danger: string;
    success: string;
    focusRing: string;
  };
  typography: {
    scale: 'compact' | 'default' | 'large';
    lineHeight: 'normal' | 'relaxed';
  };
  layout: {
    density: 'compact' | 'comfortable';
    radius: 'soft' | 'rounded';
  };
  motion: {
    level: 'full' | 'reduced' | 'none';
    durationMs: number;
  };
}

export interface VisualProfile {
  id: string;
  name: string;
  mode: VisualMode;
  description: string;
  tokens: VisualTokens;
  createdAt: Date;
}

export const EMOCEAN_TOKENS = {
  brandBackground: '#071318',
  elevatedSurface: '#10242B',
  primaryText: '#F5F7F2',
  mutedText: '#A9BAB8',
  bioCyan: '#67E8D4',
  seaGlass: '#7DD3B0',
  dawnAmber: '#F4B86A',
  warning: '#F59E7A',
  error: '#FF7A85',
  border: 'rgba(245,247,242,.12)',
};

export const defaultTokens: Record<VisualMode, VisualTokens> = {
  focus: {
    color: {
      canvas: '#071318',
      surface: '#10242B',
      surfaceRaised: '#1A3040',
      textPrimary: '#F5F7F2',
      textSecondary: '#A9BAB8',
      border: 'rgba(245,247,242,.12)',
      accent: '#67E8D4',
      accentText: '#071318',
      incomingBubble: '#1A3040',
      incomingBubbleText: '#F5F7F2',
      outgoingBubble: '#67E8D4',
      outgoingBubbleText: '#071318',
      danger: '#FF7A85',
      success: '#7DD3B0',
      focusRing: '#67E8D4',
    },
    typography: { scale: 'default', lineHeight: 'relaxed' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'reduced', durationMs: 150 },
  },
  calm: {
    color: {
      canvas: '#071318',
      surface: '#10242B',
      surfaceRaised: '#162A35',
      textPrimary: '#F5F7F2',
      textSecondary: '#A9BAB8',
      border: 'rgba(245,247,242,.12)',
      accent: '#7DD3B0',
      accentText: '#071318',
      incomingBubble: '#162A35',
      incomingBubbleText: '#F5F7F2',
      outgoingBubble: '#7DD3B0',
      outgoingBubbleText: '#071318',
      danger: '#FF7A85',
      success: '#7DD3B0',
      focusRing: '#7DD3B0',
    },
    typography: { scale: 'default', lineHeight: 'relaxed' },
    layout: { density: 'comfortable', radius: 'soft' },
    motion: { level: 'reduced', durationMs: 200 },
  },
  create: {
    color: {
      canvas: '#071318',
      surface: '#10242B',
      surfaceRaised: '#1A2A20',
      textPrimary: '#F5F7F2',
      textSecondary: '#A9BAB8',
      border: 'rgba(245,247,242,.12)',
      accent: '#F4B86A',
      accentText: '#071318',
      incomingBubble: '#1A2A20',
      incomingBubbleText: '#F5F7F2',
      outgoingBubble: '#F4B86A',
      outgoingBubbleText: '#071318',
      danger: '#FF7A85',
      success: '#7DD3B0',
      focusRing: '#F4B86A',
    },
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  },
  connect: {
    color: {
      canvas: '#071318',
      surface: '#10242B',
      surfaceRaised: '#1A2030',
      textPrimary: '#F5F7F2',
      textSecondary: '#A9BAB8',
      border: 'rgba(245,247,242,.12)',
      accent: '#67E8D4',
      accentText: '#071318',
      incomingBubble: '#1A2030',
      incomingBubbleText: '#F5F7F2',
      outgoingBubble: '#67E8D4',
      outgoingBubbleText: '#071318',
      danger: '#FF7A85',
      success: '#7DD3B0',
      focusRing: '#67E8D4',
    },
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  },
  night: {
    color: {
      canvas: '#040D12',
      surface: '#0A1A22',
      surfaceRaised: '#10242B',
      textPrimary: '#F5F7F2',
      textSecondary: '#A9BAB8',
      border: 'rgba(245,247,242,.12)',
      accent: '#7DD3B0',
      accentText: '#071318',
      incomingBubble: '#10242B',
      incomingBubbleText: '#F5F7F2',
      outgoingBubble: '#7DD3B0',
      outgoingBubbleText: '#071318',
      danger: '#FF7A85',
      success: '#7DD3B0',
      focusRing: '#7DD3B0',
    },
    typography: { scale: 'default', lineHeight: 'relaxed' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'reduced', durationMs: 150 },
  },
};

export const modeMeta: Record<VisualMode, { label: string; description: string; icon: string }> = {
  focus: { label: 'Focus', description: 'For reading, planning, writing, deep work', icon: '🎯' },
  calm: { label: 'Calm', description: 'For relaxing, unwinding, gentle tasks', icon: '🌿' },
  create: { label: 'Create', description: 'For writing, designing, brainstorming', icon: '✨' },
  connect: { label: 'Connect', description: 'For chatting, social, warm conversations', icon: '💬' },
  night: { label: 'Night', description: 'For late reading, quiet study, rest', icon: '🌙' },
};
