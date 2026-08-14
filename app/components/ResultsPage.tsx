"use client";

import React, { useState } from 'react';
import { AssessmentResults, generateWallpaperCSS, exportResults, ColorTheme } from '@/app/lib/colorThemes';

interface ResultsPageProps {
  results: AssessmentResults;
}

type ExportFormat = 'hex' | 'oklch' | 'css' | 'json';

export const ResultsPage: React.FC<ResultsPageProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'calm' | 'energizing' | 'uncertain'>('calm');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('hex');
  const [copied, setCopied] = useState(false);

  const wallpaperCSS = generateWallpaperCSS(results.calmPalette);
  const exportData = exportResults(results, exportFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${exportFormat}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ColorSwatch = ({ theme }: { theme: ColorTheme }) => (
    <div className="group relative">
      <div
        className="w-full h-24 rounded-xl shadow-inner transition-transform group-hover:scale-105"
        style={{ backgroundColor: theme.hex }}
      />
      <div className="mt-2">
        <p className="font-medium text-gray-800">{theme.name}</p>
        <p className="text-xs text-gray-500">{theme.hex}</p>
        <p className="text-xs text-gray-400">{theme.oklch}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Your Color Palette Results</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Based on your responses, we've identified colors that tend to help you feel calm
          and colors that tend to energize you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-800 mb-2">Calm Palette</h3>
          <p className="text-3xl font-bold text-green-600">{results.calmPalette.length}</p>
          <p className="text-sm text-green-600">colors identified</p>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <h3 className="font-semibold text-orange-800 mb-2">Energizing Palette</h3>
          <p className="text-3xl font-bold text-orange-600">{results.energizingPalette.length}</p>
          <p className="text-sm text-orange-600">colors identified</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Confidence</h3>
          <p className="text-3xl font-bold text-gray-600">{Math.round(results.confidence * 100)}%</p>
          <p className="text-sm text-gray-600">signal quality</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('calm')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calm'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Calm Colors
          </button>
          <button
            onClick={() => setActiveTab('energizing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'energizing'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Energizing Colors
          </button>
          {results.uncertainColors.length > 0 && (
            <button
              onClick={() => setActiveTab('uncertain')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'uncertain'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Uncertain
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeTab === 'calm' &&
            results.calmPalette.map((theme) => <ColorSwatch key={theme.id} theme={theme} />)}
          {activeTab === 'energizing' &&
            results.energizingPalette.map((theme) => <ColorSwatch key={theme.id} theme={theme} />)}
          {activeTab === 'uncertain' &&
            results.uncertainColors.map((theme) => <ColorSwatch key={theme.id} theme={theme} />)}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Wallpaper Preview</h3>
        <div
          className="w-full h-48 rounded-xl"
          style={{ background: wallpaperCSS }}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Export Your Palette</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['hex', 'oklch', 'css', 'json'] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                exportFormat === format
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>

        <pre className="p-4 rounded-lg bg-gray-50 text-sm text-gray-800 overflow-x-auto font-mono">
          {exportData}
        </pre>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCopy}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Download File
          </button>
        </div>
      </div>

      {results.skinToneGroup && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Skin-tone & Lighting Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Skin-tone Group</p>
              <p className="font-medium text-gray-800 capitalize">{results.skinToneGroup}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Lighting Condition</p>
              <p className="font-medium text-gray-800 capitalize">{results.lightingCondition}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 pb-8">
        <p>Results generated locally. No data was uploaded.</p>
        <p className="mt-1">
          These colors are based on your self-reported responses and should be interpreted
          as suggestions, not medical recommendations.
        </p>
      </div>
    </div>
  );
};
