"use client";

import React, { useState, useRef, useEffect } from 'react';
import { VisualTokens, defaultTokens, VisualMode, modeMeta } from '@/app/lib/designTokens';
import { useSensorHub } from '@/app/hooks/useSensorHub';

interface ChatDemoProps {
  initialTokens?: VisualTokens;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

const emotionColors: Record<string, string> = {
  happy: '#FCD34D',
  calm: '#86EFAC',
  focus: '#93C5FD',
  surprise: '#FCA5A5',
  tense: '#D1D5DB',
  curious: '#A5B4FC',
  drowsy: '#C4B5FD',
  sad: '#93C5FD',
  angry: '#E5E7EB',
  frustrated: '#FDBA74',
  neutral: '#F3F4F6',
};

const autoReplies = [
  "That sounds great!",
  "I'm here whenever you need me.",
  "Let me know how it goes.",
  "Thanks for sharing that.",
  "I totally agree with you.",
  "Interesting perspective!",
  "Take your time, no rush.",
  "That's a really good point.",
];

export const ChatDemo: React.FC<ChatDemoProps> = ({ initialTokens, onBack }) => {
  const [tokens, setTokens] = useState<VisualTokens>(initialTokens || defaultTokens.focus);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing today?',
      sender: 'other',
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      text: 'Pretty good, just trying out this new chat theme.',
      sender: 'me',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: '3',
      text: 'Oh nice! It looks really clean.',
      sender: 'other',
      timestamp: new Date(Date.now() - 10000),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { videoRef, snapshot, status, start, stop } = useSensorHub();
  const cameraRunning = status === 'running' || status === 'paused' || status === 'initializing';

  const currentEmotion = snapshot?.facialExpression.value?.label ?? 'neutral';
  const emotionScores = snapshot?.facialExpression.value?.scores ?? {};
  const heartRate = snapshot?.heartRate.available ? snapshot.heartRate.value : null;

  const topEmotions = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleCamera = () => {
    if (showCamera) {
      stop();
      setShowCamera(false);
    } else {
      setShowCamera(true);
      start();
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          sender: 'other',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const themes: { mode: VisualMode; label: string }[] = [
    { mode: 'focus', label: 'Focus' },
    { mode: 'calm', label: 'Calm' },
    { mode: 'create', label: 'Create' },
    { mode: 'connect', label: 'Connect' },
    { mode: 'night', label: 'Night' },
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500"
      style={{ backgroundColor: tokens.color.canvas }}
    >
      <nav
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{
          backgroundColor: tokens.color.surface,
          borderColor: tokens.color.border,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ color: tokens.color.textSecondary }}
            className="hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: tokens.color.accent, color: tokens.color.accentText }}
          >
            A
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: tokens.color.textPrimary }}>
              Amina
            </p>
            <p className="text-xs" style={{ color: tokens.color.textSecondary }}>
              Active now · {formatTime(sessionDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {heartRate && (
            <div
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ backgroundColor: tokens.color.surfaceRaised, color: tokens.color.textSecondary }}
            >
              <span className="text-red-500">♥</span> {Math.round(heartRate)} bpm
            </div>
          )}
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: tokens.color.surfaceRaised, color: tokens.color.textSecondary }}
          >
            Insights
          </button>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: tokens.color.surfaceRaised }}
          >
            <svg className="w-4 h-4" fill="none" stroke={tokens.color.textSecondary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
        </div>
      </nav>

      {showThemePicker && (
        <div
          className="px-4 py-3 border-b"
          style={{ backgroundColor: tokens.color.surface, borderColor: tokens.color.border }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: tokens.color.textSecondary }}>
              Conversation atmosphere
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {themes.map(({ mode, label }) => {
              const themeTokens = defaultTokens[mode];
              const isActive = tokens.color.accent === themeTokens.color.accent;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setTokens(themeTokens);
                    setShowThemePicker(false);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: isActive ? themeTokens.color.accent : themeTokens.color.surface,
                    color: isActive ? themeTokens.color.accentText : themeTokens.color.textPrimary,
                    borderColor: themeTokens.color.border,
                  }}
                >
                  {modeMeta[mode].icon} {label}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-2" style={{ color: tokens.color.textSecondary }}>
            Applies only to your view
          </p>
        </div>
      )}

      {showAnalysis && (
        <div
          className="px-4 py-4 border-b"
          style={{ backgroundColor: tokens.color.surface, borderColor: tokens.color.border }}
        >
          <h3 className="font-medium text-sm mb-3" style={{ color: tokens.color.textPrimary }}>
            Session Insights
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: tokens.color.surfaceRaised }}>
              <p className="text-lg font-bold" style={{ color: tokens.color.textPrimary }}>
                {formatTime(sessionDuration)}
              </p>
              <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Duration</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: tokens.color.surfaceRaised }}>
              <p className="text-lg font-bold capitalize" style={{ color: tokens.color.textPrimary }}>
                {currentEmotion}
              </p>
              <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Expression</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: tokens.color.surfaceRaised }}>
              <p className="text-lg font-bold" style={{ color: tokens.color.textPrimary }}>
                {heartRate ? Math.round(heartRate) : '--'}
              </p>
              <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Heart Rate</p>
            </div>
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundColor: tokens.color.canvas }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] px-4 py-2 text-sm"
              style={{
                backgroundColor: msg.sender === 'me' ? tokens.color.outgoingBubble : tokens.color.incomingBubble,
                color: msg.sender === 'me' ? tokens.color.outgoingBubbleText : tokens.color.incomingBubbleText,
                borderRadius: '1rem',
              }}
            >
              <p>{msg.text}</p>
              <p
                className="text-xs mt-1 opacity-60"
                style={{ color: msg.sender === 'me' ? tokens.color.outgoingBubbleText : tokens.color.incomingBubbleText }}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 text-sm"
              style={{ backgroundColor: tokens.color.incomingBubble, color: tokens.color.textSecondary, borderRadius: '1rem' }}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showCamera && (
        <div
          className="fixed bottom-20 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            width: '180px',
            height: '140px',
            backgroundColor: tokens.color.surface,
            border: `2px solid ${emotionColors[currentEmotion] || tokens.color.border}`,
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div
            className="absolute bottom-0 inset-x-0 px-2 py-1.5 space-y-0.5"
            style={{ backgroundColor: `${tokens.color.surface}ee` }}
          >
            {topEmotions.length > 0 ? (
              topEmotions.map(([emotion, score]) => (
                <div key={emotion} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: emotionColors[emotion] || '#888' }}
                  />
                  <span className="text-[9px] capitalize w-12 shrink-0" style={{ color: tokens.color.textPrimary }}>
                    {emotion}
                  </span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${tokens.color.border}` }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, score * 100)}%`,
                        backgroundColor: emotionColors[emotion] || '#888',
                      }}
                    />
                  </div>
                  <span className="text-[8px] w-6 text-right" style={{ color: tokens.color.textSecondary }}>
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: emotionColors['neutral'] }} />
                <span className="text-[9px] capitalize" style={{ color: tokens.color.textPrimary }}>Detecting...</span>
              </div>
            )}
            {heartRate && (
              <div className="flex items-center gap-1 pt-0.5 border-t" style={{ borderColor: `${tokens.color.border}` }}>
                <span className="text-[9px] text-red-500">♥</span>
                <span className="text-[9px]" style={{ color: tokens.color.textSecondary }}>{Math.round(heartRate)} bpm</span>
              </div>
            )}
          </div>
          <button
            onClick={handleToggleCamera}
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-60 hover:opacity-100 transition-opacity"
            style={{ backgroundColor: `${tokens.color.surface}cc`, color: tokens.color.textSecondary }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="px-4 py-3 border-t"
        style={{ backgroundColor: tokens.color.surface, borderColor: tokens.color.border }}
      >
        <div className="flex gap-2 items-center">
          <button
            onClick={handleToggleCamera}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              backgroundColor: showCamera ? tokens.color.accent : tokens.color.surfaceRaised,
              color: showCamera ? tokens.color.accentText : tokens.color.textSecondary,
            }}
            title={showCamera ? 'Disable camera' : 'Enable camera for facial expression sensing'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Write a message..."
            className="flex-1 px-4 py-2 rounded-full text-sm outline-none transition-colors"
            style={{ backgroundColor: tokens.color.surfaceRaised, color: tokens.color.textPrimary }}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: tokens.color.accent, color: tokens.color.accentText }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
