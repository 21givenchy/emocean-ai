"use client";

import React, { useState, useEffect } from 'react';
import { VisualMode, VisualTokens, modeMeta } from '@/app/lib/designTokens';

interface SavedMode {
  id: string;
  name: string;
  mode: VisualMode;
  tokens: VisualTokens;
  createdAt: Date;
}

interface MyModesProps {
  onNewMode: () => void;
  onSelectMode: (tokens: VisualTokens) => void;
}

export const MyModes: React.FC<MyModesProps> = ({ onNewMode, onSelectMode }) => {
  const [modes, setModes] = useState<SavedMode[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('coloring-ai-modes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setModes(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = modes.filter((m) => m.id !== id);
    setModes(updated);
    localStorage.setItem('coloring-ai-modes', JSON.stringify(updated));
    if (activeId === id) {
      setActiveId(updated[0]?.id || null);
    }
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    const mode = modes.find((m) => m.id === id);
    if (mode) {
      onSelectMode(mode.tokens);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-lg">Coloring AI</span>
        <button
          onClick={onNewMode}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          + New mode
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My visual modes</h1>
        <p className="text-gray-600 mb-8">
          Switch between modes for different contexts.
        </p>

        {modes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎨</div>
            <p className="text-gray-600 mb-6">No modes saved yet.</p>
            <button
              onClick={onNewMode}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Create your first mode
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {modes.map((m) => {
              const meta = modeMeta[m.mode];
              const isActive = m.id === activeId;
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleSelect(m.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: m.tokens.color.accent,
                          color: m.tokens.color.accentText,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{m.name}</p>
                        <p className="text-sm text-gray-500">{meta.label} mode</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {[
                      m.tokens.color.canvas,
                      m.tokens.color.surface,
                      m.tokens.color.accent,
                      m.tokens.color.textPrimary,
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-4">Settings</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Motion</span>
              <span className="font-medium">Reduced</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Contrast</span>
              <span className="font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data storage</span>
              <span className="font-medium">This device only</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
