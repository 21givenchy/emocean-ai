"use client";

import { useState, useEffect } from 'react';
import { VisualMode, VisualTokens } from './lib/designTokens';
import { Landing } from './components/Landing';
import { IntentSelect } from './components/IntentSelect';
import { AssessmentFlow } from './components/AssessmentFlow';
import { ResultsPage } from './components/ResultsPage';
import { MyModes } from './components/MyModes';
import { CameraFeed } from './components/CameraFeed';
import { ChatDemo } from './components/ChatDemo';

type AppScreen = 'landing' | 'intent' | 'assessment' | 'results' | 'mymodes' | 'camera' | 'chat';

interface SavedMode {
  id: string;
  name: string;
  mode: VisualMode;
  tokens: VisualTokens;
  createdAt: Date;
}

export default function HomePage() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [selectedMode, setSelectedMode] = useState<VisualMode | null>(null);
  const [resultTokens, setResultTokens] = useState<VisualTokens | null>(null);
  const [resultName, setResultName] = useState('');
  const [savedModes, setSavedModes] = useState<SavedMode[]>([]);
  const [activeTokens, setActiveTokens] = useState<VisualTokens | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('coloring-ai-modes');
    if (stored) {
      try {
        setSavedModes(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSaveMode = () => {
    if (!resultTokens || !selectedMode) return;
    const newMode: SavedMode = {
      id: Date.now().toString(),
      name: resultName,
      mode: selectedMode,
      tokens: resultTokens,
      createdAt: new Date(),
    };
    const updated = [...savedModes, newMode];
    setSavedModes(updated);
    localStorage.setItem('coloring-ai-modes', JSON.stringify(updated));
    setActiveTokens(resultTokens);
    setScreen('mymodes');
  };

  const handleSelectMode = (tokens: VisualTokens) => {
    setActiveTokens(tokens);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: activeTokens?.color.canvas,
        color: activeTokens?.color.textPrimary,
      }}
    >
      {screen === 'landing' && (
        <Landing onStart={() => setScreen('intent')} />
      )}

      {screen === 'intent' && (
        <IntentSelect
          onSelect={(mode) => {
            setSelectedMode(mode);
            setScreen('assessment');
          }}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'assessment' && selectedMode && (
        <AssessmentFlow
          mode={selectedMode}
          onComplete={(profile) => {
            setResultTokens(profile.tokens);
            setResultName(profile.name);
            setScreen('results');
          }}
          onBack={() => setScreen('intent')}
        />
      )}

      {screen === 'results' && resultTokens && selectedMode && (
        <ResultsPage
          mode={selectedMode}
          name={resultName}
          tokens={resultTokens}
          onSave={handleSaveMode}
          onMyModes={() => setScreen('mymodes')}
        />
      )}

      {screen === 'mymodes' && (
        <MyModes
          onNewMode={() => setScreen('intent')}
          onSelectMode={handleSelectMode}
        />
      )}

      {screen === 'chat' && (
        <ChatDemo
          initialTokens={activeTokens || undefined}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'camera' && (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <button
              onClick={() => setScreen('landing')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </nav>
          <div className="max-w-2xl mx-auto px-6 py-8">
            <CameraFeed
              onEmotionChange={(e) => console.log('Emotion:', e)}
              onVitalSignsChange={(v) => console.log('Vitals:', v)}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex gap-3">
        {screen !== 'landing' && screen !== 'mymodes' && screen !== 'chat' && (
          <button
            onClick={() => setScreen('mymodes')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50 transition-colors"
          >
            My modes
          </button>
        )}
        <button
          onClick={() => setScreen('chat')}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50 transition-colors"
        >
          Chat demo
        </button>
        <button
          onClick={() => setScreen('camera')}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50 transition-colors"
        >
          Camera demo
        </button>
      </div>
    </div>
  );
}
