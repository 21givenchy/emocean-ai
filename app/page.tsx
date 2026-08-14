"use client";

import { useState } from 'react';
import { CameraFeed, VitalSignsData } from './components/CameraFeed';
import { AssessmentFlow } from './components/AssessmentFlow';

type AppMode = 'assessment' | 'camera';

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>('assessment');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [vitalSigns, setVitalSigns] = useState<VitalSignsData>({
    heartRate: null,
    heartRateVariability: null,
    sdnn: null,
    rmssd: null,
    breathRate: null,
    spo2: null,
    signalQuality: 0,
    beatTimestamps: [],
    bvp: [],
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800">Coloring AI</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode('assessment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'assessment'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Assessment
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'camera'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Camera Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {mode === 'assessment' && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <label className="flex items-center justify-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cameraEnabled}
                  onChange={(e) => setCameraEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Enable optional camera sensing for physiological data
                </span>
              </label>
            </div>

            {cameraEnabled && (
              <div className="max-w-2xl mx-auto">
                <CameraFeed
                  onVitalSignsChange={(vitals) => setVitalSigns(vitals)}
                />
              </div>
            )}

            <AssessmentFlow
              cameraEnabled={cameraEnabled}
              vitals={{
                heartRate: vitalSigns.heartRate,
                rmssd: vitalSigns.rmssd,
              }}
            />
          </div>
        )}

        {mode === 'camera' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Camera Demo</h1>
              <p className="text-gray-600">
                Real-time facial expression analysis with vital signs monitoring
              </p>
            </div>

            <CameraFeed
              onEmotionChange={(e) => console.log('Emotion:', e)}
              onVitalSignsChange={(v) => setVitalSigns(v)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
