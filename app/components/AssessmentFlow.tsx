"use client";

import React, { useState, useCallback, useRef } from 'react';
import { colorThemes, ColorTheme, TrialResult, AssessmentResults } from '@/app/lib/colorThemes';
import { ColorTrial } from './ColorTrial';
import { SelfReport } from './SelfReport';
import { ScreenIlluminationGate } from './ScreenIlluminationGate';
import { ResultsPage } from './ResultsPage';

type AssessmentPhase = 'intro' | 'calibration' | 'baseline' | 'trials' | 'results';

interface AssessmentFlowProps {
  cameraEnabled: boolean;
  vitals: {
    heartRate: number | null;
    rmssd: number | null;
  };
}

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ cameraEnabled, vitals }) => {
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [calibrationData, setCalibrationData] = useState<{
    baselineIllumination: number;
    acceptable: boolean;
  } | null>(null);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trialResults, setTrialResults] = useState<TrialResult[]>([]);
  const [showSelfReport, setShowSelfReport] = useState(false);
  const [currentColorId, setCurrentColorId] = useState<string | null>(null);

  const trialsPerColor = 2;
  const colorOrder = useRef<ColorTheme[]>(shuffleArray([...colorThemes]));
  const allTrials = colorOrder.current.flatMap((color) =>
    Array.from({ length: trialsPerColor }, (_, i) => ({
      color,
      exposureNumber: i + 1,
    }))
  );

  const currentTrial = allTrials[currentTrialIndex];
  const totalTrials = allTrials.length;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const handleCalibration = (data: { baselineIllumination: number; acceptable: boolean }) => {
    setCalibrationData(data);
    if (data.acceptable) {
      setPhase('baseline');
    }
  };

  const handleBaselineComplete = () => {
    setPhase('trials');
  };

  const handleTrialComplete = useCallback(
    (exposureData: {
      colorId: string;
      duration: number;
      motionScore: number;
      vitalsSnapshot: { heartRate: number | null; rmssd: number | null };
    }) => {
      setCurrentColorId(exposureData.colorId);
      setShowSelfReport(true);
    },
    []
  );

  const handleSelfReportSubmit = (rating: number, label: string) => {
    if (!currentTrial || !currentColorId) return;

    const result: TrialResult = {
      colorId: currentColorId,
      colorHex: currentTrial.color.hex,
      exposureNumber: currentTrial.exposureNumber,
      selfReport: rating,
      vitalsBefore: { heartRate: null, rmssd: null },
      vitalsDuring: vitals,
      vitalsAfter: { heartRate: null, rmssd: null },
      motionScore: 0.9,
      signalQuality: 0.8,
      timestamp: new Date(),
      screenIllumination: calibrationData?.baselineIllumination || 0,
    };

    setTrialResults((prev) => [...prev, result]);
    setShowSelfReport(false);

    if (currentTrialIndex < totalTrials - 1) {
      setCurrentTrialIndex((prev) => prev + 1);
    } else {
      setPhase('results');
    }
  };

  const generateResults = (): AssessmentResults => {
    const colorScores: Record<string, { calm: number; energizing: number; count: number }> = {};

    trialResults.forEach((result) => {
      if (!colorScores[result.colorId]) {
        colorScores[result.colorId] = { calm: 0, energizing: 0, count: 0 };
      }
      colorScores[result.colorId].count++;
      if (result.selfReport >= 5) {
        colorScores[result.colorId].calm += result.selfReport;
      } else if (result.selfReport <= 3) {
        colorScores[result.colorId].energizing += (8 - result.selfReport);
      }
    });

    const calmPalette: ColorTheme[] = [];
    const energizingPalette: ColorTheme[] = [];
    const uncertainColors: ColorTheme[] = [];

    Object.entries(colorScores).forEach(([colorId, scores]) => {
      const theme = colorThemes.find((t) => t.id === colorId);
      if (!theme) return;

      if (scores.calm > scores.energizing && scores.calm > 6) {
        calmPalette.push(theme);
      } else if (scores.energizing > scores.calm && scores.energizing > 6) {
        energizingPalette.push(theme);
      } else {
        uncertainColors.push(theme);
      }
    });

    const totalRatings = trialResults.length;
    const validRatings = trialResults.filter((r) => r.motionScore > 0.5).length;
    const confidence = totalRatings > 0 ? validRatings / totalRatings : 0;

    return {
      calmPalette: calmPalette.length > 0 ? calmPalette : colorThemes.filter((t) => t.category === 'calm'),
      energizingPalette: energizingPalette.length > 0 ? energizingPalette : colorThemes.filter((t) => t.category === 'energizing'),
      uncertainColors,
      confidence,
      skinToneGroup: null,
      lightingCondition: calibrationData?.baselineIllumination
        ? calibrationData.baselineIllumination < 100
          ? 'dim'
          : calibrationData.baselineIllumination > 150
          ? 'bright'
          : 'normal'
        : null,
      trials: trialResults,
    };
  };

  if (phase === 'results') {
    return <ResultsPage results={generateResults()} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {phase === 'intro' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Coloring AI: Find Your Palette</h2>

          <p className="text-gray-600 max-w-md mx-auto">
            Discover which colors help you feel calm or energized. This personalized assessment
            uses {cameraEnabled ? 'optional camera sensing' : 'self-report ratings'} to find your
            unique color palette.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-sm font-medium text-blue-800">8 Colors</p>
              <p className="text-xs text-blue-600">Matched lightness</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <p className="text-sm font-medium text-purple-800">2 Trials Each</p>
              <p className="text-xs text-purple-600">For reliability</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-sm font-medium text-green-800">~10 Minutes</p>
              <p className="text-xs text-green-600">Quick assessment</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-sm font-medium text-amber-800">100% Private</p>
              <p className="text-xs text-amber-600">Local processing</p>
            </div>
          </div>

          <button
            onClick={() => setPhase('calibration')}
            className="w-full max-w-xs mx-auto rounded-lg bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Begin Assessment
          </button>
        </div>
      )}

      {phase === 'calibration' && (
        <ScreenIlluminationGate onCalibrated={handleCalibration} />
      )}

      {phase === 'baseline' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Baseline Period</h2>
          <p className="text-gray-600">
            Please relax and look at the gray screen for 30 seconds.
            This establishes your baseline physiological state.
          </p>
          <ColorTrial
            color={colorThemes[0]}
            trialNumber={0}
            onComplete={handleBaselineComplete}
            vitals={vitals}
          />
        </div>
      )}

      {phase === 'trials' && currentTrial && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Trial {currentTrialIndex + 1} of {totalTrials}
            </h2>
            <span className="text-sm text-gray-500">
              {currentTrial.color.name} (Exposure {currentTrial.exposureNumber})
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentTrialIndex + 1) / totalTrials) * 100}%` }}
            />
          </div>

          {showSelfReport ? (
            <SelfReport
              colorName={currentTrial.color.name}
              colorHex={currentTrial.color.hex}
              onSubmit={handleSelfReportSubmit}
            />
          ) : (
            <ColorTrial
              key={`${currentTrial.color.id}-${currentTrial.exposureNumber}`}
              color={currentTrial.color}
              trialNumber={currentTrial.exposureNumber}
              onComplete={handleTrialComplete}
              vitals={vitals}
            />
          )}
        </div>
      )}
    </div>
  );
};
