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

export const defaultTokens: Record<VisualMode, VisualTokens> = {
  focus: {
    color: {
      canvas: '#F8FAFB',
      surface: '#FFFFFF',
      surfaceRaised: '#F1F5F9',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      accent: '#0EA5E9',
      accentText: '#FFFFFF',
      incomingBubble: '#F1F5F9',
      incomingBubbleText: '#0F172A',
      outgoingBubble: '#0EA5E9',
      outgoingBubbleText: '#FFFFFF',
      danger: '#EF4444',
      success: '#22C55E',
      focusRing: '#0EA5E9',
    },
    typography: { scale: 'default', lineHeight: 'relaxed' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'reduced', durationMs: 150 },
  },
  calm: {
    color: {
      canvas: '#FAFAF9',
      surface: '#FFFFFF',
      surfaceRaised: '#F5F5F4',
      textPrimary: '#1C1917',
      textSecondary: '#78716C',
      border: '#E7E5E4',
      accent: '#8BC8B2',
      accentText: '#1C1917',
      incomingBubble: '#F5F5F4',
      incomingBubbleText: '#1C1917',
      outgoingBubble: '#8BC8B2',
      outgoingBubbleText: '#1C1917',
      danger: '#EF4444',
      success: '#22C55E',
      focusRing: '#8BC8B2',
    },
    typography: { scale: 'default', lineHeight: 'relaxed' },
    layout: { density: 'comfortable', radius: 'soft' },
    motion: { level: 'reduced', durationMs: 200 },
  },
  create: {
    color: {
      canvas: '#FFFBF5',
      surface: '#FFFFFF',
      surfaceRaised: '#FEF3C7',
      textPrimary: '#1C1917',
      textSecondary: '#78716C',
      border: '#FDE68A',
      accent: '#F59E0B',
      accentText: '#1C1917',
      incomingBubble: '#FEF3C7',
      incomingBubbleText: '#1C1917',
      outgoingBubble: '#F59E0B',
      outgoingBubbleText: '#1C1917',
      danger: '#EF4444',
      success: '#22C55E',
      focusRing: '#F59E0B',
    },
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  },
  connect: {
    color: {
      canvas: '#FDF4FF',
      surface: '#FFFFFF',
      surfaceRaised: '#FAE8FF',
      textPrimary: '#1C1917',
      textSecondary: '#78716C',
      border: '#F0ABFC',
      accent: '#D946EF',
      accentText: '#FFFFFF',
      incomingBubble: '#FAE8FF',
      incomingBubbleText: '#1C1917',
      outgoingBubble: '#D946EF',
      outgoingBubbleText: '#FFFFFF',
      danger: '#EF4444',
      success: '#22C55E',
      focusRing: '#D946EF',
    },
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  },
  night: {
    color: {
      canvas: '#0F172A',
      surface: '#1E293B',
      surfaceRaised: '#334155',
      textPrimary: '#F8FAFB',
      textSecondary: '#94A3B8',
      border: '#475569',
      accent: '#7C3AED',
      accentText: '#FFFFFF',
      incomingBubble: '#334155',
      incomingBubbleText: '#F8FAFB',
      outgoingBubble: '#7C3AED',
      outgoingBubbleText: '#FFFFFF',
      danger: '#EF4444',
      success: '#22C55E',
      focusRing: '#7C3AED',
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
