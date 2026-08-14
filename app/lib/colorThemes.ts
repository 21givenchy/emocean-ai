export interface ColorTheme {
  id: string;
  name: string;
  hex: string;
  oklch: string;
  category: 'calm' | 'energizing' | 'uncertain';
  description: string;
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'sky',
    name: 'Sky Blue',
    hex: '#7CB9E8',
    oklch: '0.75 0.08 250',
    category: 'calm',
    description: 'Soft, cool blue reminiscent of clear skies',
  },
  {
    id: 'sage',
    name: 'Sage Green',
    hex: '#9DC183',
    oklch: '0.75 0.08 140',
    category: 'calm',
    description: 'Muted green with natural, grounding qualities',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    hex: '#B4A7D6',
    oklch: '0.75 0.08 290',
    category: 'calm',
    description: 'Gentle purple with soothing undertones',
  },
  {
    id: 'peach',
    name: 'Peach',
    hex: '#FFB7A5',
    oklch: '0.80 0.06 30',
    category: 'calm',
    description: 'Warm, soft orange-pink tone',
  },
  {
    id: 'coral',
    name: 'Coral',
    hex: '#FF6F61',
    oklch: '0.65 0.15 20',
    category: 'energizing',
    description: 'Vibrant reddish-orange that stimulates',
  },
  {
    id: 'electric',
    name: 'Electric Blue',
    hex: '#0066FF',
    oklch: '0.55 0.18 260',
    category: 'energizing',
    description: 'Bold, high-energy blue',
  },
  {
    id: 'sunshine',
    name: 'Sunshine Yellow',
    hex: '#FFD700',
    oklch: '0.85 0.12 95',
    category: 'energizing',
    description: 'Bright, attention-grabbing yellow',
  },
  {
    id: 'magenta',
    name: 'Magenta',
    hex: '#FF00FF',
    oklch: '0.60 0.22 330',
    category: 'energizing',
    description: 'Intense, stimulating pink-purple',
  },
];

export interface TrialResult {
  colorId: string;
  colorHex: string;
  exposureNumber: number;
  selfReport: number;
  vitalsBefore: {
    heartRate: number | null;
    rmssd: number | null;
  };
  vitalsDuring: {
    heartRate: number | null;
    rmssd: number | null;
  };
  vitalsAfter: {
    heartRate: number | null;
    rmssd: number | null;
  };
  motionScore: number;
  signalQuality: number;
  timestamp: Date;
  screenIllumination: number;
}

export interface AssessmentResults {
  calmPalette: ColorTheme[];
  energizingPalette: ColorTheme[];
  uncertainColors: ColorTheme[];
  confidence: number;
  skinToneGroup: 'light' | 'medium' | 'dark' | null;
  lightingCondition: 'dim' | 'normal' | 'bright' | null;
  trials: TrialResult[];
}

export function generateWallpaperCSS(colors: ColorTheme[]): string {
  const gradientStops = colors.map((c, i) => {
    const position = (i / (colors.length - 1)) * 100;
    return `${c.hex} ${position}%`;
  }).join(', ');

  return `linear-gradient(135deg, ${gradientStops})`;
}

export function exportResults(results: AssessmentResults, format: 'hex' | 'oklch' | 'css' | 'json') {
  switch (format) {
    case 'hex':
      return results.calmPalette.map(c => c.hex).join('\n');
    case 'oklch':
      return results.calmPalette.map(c => `${c.name}: ${c.oklch}`).join('\n');
    case 'css':
      return `:root {\n  --calm-primary: ${results.calmPalette[0]?.hex};\n  --calm-secondary: ${results.calmPalette[1]?.hex};\n  --energizing-primary: ${results.energizingPalette[0]?.hex};\n}`;
    case 'json':
      return JSON.stringify({
        calmPalette: results.calmPalette,
        energizingPalette: results.energizingPalette,
        confidence: results.confidence,
        skinToneGroup: results.skinToneGroup,
        lightingCondition: results.lightingCondition,
      }, null, 2);
  }
}
