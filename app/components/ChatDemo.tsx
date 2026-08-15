"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VisualTokens, defaultTokens, VisualMode, modeMeta } from '@/app/lib/designTokens';

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

interface EmotionRecord {
  emotion: string;
  color: string;
  timestamp: Date;
  heartRate: number | null;
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
  const [cameraReady, setCameraReady] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [autoBackground, setAutoBackground] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sampleBufferRef = useRef<number[]>([]);
  const bpmHistoryRef = useRef<number[]>([]);
  const mountedRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sessionDuration > 0 && sessionDuration % 30 === 0 && emotionHistory.length > 0) {
      const records = emotionHistory.slice(-10);
      const emotionCounts: Record<string, number> = {};
      records.forEach((r) => {
        emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
      });
      const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
      if (dominant) {
        const bestColor = records.find((r) => r.emotion === dominant[0])?.color || '#F3F4F6';
        const hrRecords = records.filter((r) => r.heartRate);
        const avgHR = hrRecords.length > 0
          ? hrRecords.reduce((a, b) => a + (b.heartRate || 0), 0) / hrRecords.length
          : null;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Insight: When you were feeling ${dominant[0]}, the ${bestColor} background felt most natural.${avgHR ? ` Your average heart rate was ${Math.round(avgHR)} bpm.` : ''}`,
            sender: 'other',
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [sessionDuration, emotionHistory]);

  const detectEmotion = useCallback((blend: { categoryName: string; score: number }[]): string => {
    const get = (name: string) => blend.find((b) => b.categoryName === name)?.score ?? 0;
    const smile = (get('mouthSmileLeft') + get('mouthSmileRight')) / 2;
    const frown = (get('mouthFrownLeft') + get('mouthFrownRight')) / 2;
    const browDown = (get('browDownLeft') + get('browDownRight')) / 2;
    const browUp = get('browInnerUp');
    const jawOpen = get('jawOpen');
    const eyeWide = (get('eyeWideLeft') + get('eyeWideRight')) / 2;

    if (smile > 0.5) return 'happy';
    if (browDown > 0.4 && frown > 0.3) return 'angry';
    if (browUp > 0.4 && jawOpen > 0.3) return 'surprise';
    if (browDown > 0.3 && frown > 0.2) return 'frustrated';
    if (eyeWide > 0.4) return 'curious';
    if (smile > 0.3) return 'calm';
    return 'neutral';
  }, []);

  const extractForeheadColor = useCallback((video: HTMLVideoElement): { r: number; g: number; b: number } | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, video.videoWidth * 0.5, video.videoHeight * 0.3, 10, 10, 0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  }, []);

  const calculateBPM = useCallback((color: { r: number; g: number; b: number }): number | null => {
    const green = color.g / (color.r + color.g + color.b + 1);
    sampleBufferRef.current.push(green);
    if (sampleBufferRef.current.length > 150) sampleBufferRef.current.shift();
    if (sampleBufferRef.current.length < 30) return null;

    const samples = sampleBufferRef.current;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const std = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length);
    const threshold = mean + std * 0.3;

    let peaks: number[] = [];
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i] > samples[i - 1] && samples[i] > samples[i + 1] && samples[i] > threshold) {
        peaks.push(i);
      }
    }

    if (peaks.length < 2) return null;

    let totalInterval = 0;
    let count = 0;
    for (let i = 1; i < peaks.length; i++) {
      const interval = (peaks[i] - peaks[i - 1]) * (1000 / 30);
      if (interval > 300 && interval < 2000) {
        totalInterval += interval;
        count++;
      }
    }

    if (count === 0) return null;

    const avgInterval = totalInterval / count;
    const bpm = Math.round(60000 / avgInterval);

    bpmHistoryRef.current.push(bpm);
    if (bpmHistoryRef.current.length > 5) bpmHistoryRef.current.shift();

    const sorted = [...bpmHistoryRef.current].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, []);

  const startDetection = useCallback(() => {
    const detect = () => {
      if (!mountedRef.current) return;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const result = landmarker.detectForVideo(video, performance.now());
        if (result.faceLandmarks?.length > 0) {
          const blend = result.faceBlendshapes?.[0]?.categories ?? [];
          const emotion = detectEmotion(blend);
          setCurrentEmotion(emotion);

          if (autoBackground) {
            const newColor = emotionColors[emotion] || '#F3F4F6';
            setTokens((prev) => ({
              ...prev,
              color: { ...prev.color, canvas: newColor },
            }));
          }

          const color = extractForeheadColor(video);
          if (color) {
            const bpm = calculateBPM(color);
            if (bpm) setHeartRate(bpm);
          }

          setEmotionHistory((prev) => [
            ...prev.slice(-50),
            {
              emotion,
              color: emotionColors[emotion] || '#F3F4F6',
              timestamp: new Date(),
              heartRate: null,
            },
          ]);
        }
      } catch {
        // ignore detection errors
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
  }, [autoBackground, detectEmotion, extractForeheadColor, calculateBPM]);

  const initCamera = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      if (!mountedRef.current) return;

      landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'GPU' },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      setCameraReady(true);
      startDetection();
    } catch (err) {
      console.error('Camera init failed:', err);
      if (mountedRef.current) setShowCamera(false);
    }
  }, [startDetection]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (showCamera && !cameraReady) {
      initCamera();
    }
  }, [showCamera, cameraReady, initCamera]);

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

  const getEmotionInsights = () => {
    const emotionCounts: Record<string, number> = {};
    emotionHistory.forEach((r) => {
      emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
    });
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({
        emotion,
        count,
        color: emotionColors[emotion],
        percentage: Math.round((count / emotionHistory.length) * 100),
      }));
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
              <span className="text-red-500">♥</span> {heartRate} bpm
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
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: tokens.color.textSecondary }}>
              <input
                type="checkbox"
                checked={autoBackground}
                onChange={(e) => setAutoBackground(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              Auto-adapt to emotion
            </label>
          </div>
          <div className="flex gap-2 flex-wrap">
            {themes.map(({ mode, label }) => {
              const themeTokens = defaultTokens[mode];
              const isActive = tokens.color.accent === themeTokens.color.accent;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setAutoBackground(false);
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
            Applies only to your view · Auto mode uses face detection
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
          <div className="grid grid-cols-3 gap-3 mb-3">
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
              <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Current</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: tokens.color.surfaceRaised }}>
              <p className="text-lg font-bold" style={{ color: tokens.color.textPrimary }}>
                {heartRate || '--'}
              </p>
              <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Heart Rate</p>
            </div>
          </div>
          {emotionHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: tokens.color.textSecondary }}>
                Emotion Distribution
              </p>
              {getEmotionInsights().map((insight) => (
                <div key={insight.emotion} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: insight.color }} />
                  <span className="text-xs capitalize flex-1" style={{ color: tokens.color.textPrimary }}>
                    {insight.emotion}
                  </span>
                  <span className="text-xs" style={{ color: tokens.color.textSecondary }}>
                    {insight.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
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
        <div className="px-4 py-2 border-t" style={{ borderColor: tokens.color.border }}>
          <div className="flex items-center gap-3">
            <video
              ref={videoRef}
              className="w-16 h-12 rounded-lg object-cover"
              muted
              playsInline
              style={{ backgroundColor: tokens.color.surfaceRaised }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: emotionColors[currentEmotion] }}
                />
                <span className="text-xs font-medium capitalize" style={{ color: tokens.color.textPrimary }}>
                  {currentEmotion}
                </span>
              </div>
              {heartRate && (
                <p className="text-xs" style={{ color: tokens.color.textSecondary }}>
                  ♥ {heartRate} bpm
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setShowCamera(false);
                setCameraReady(false);
                streamRef.current?.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
              }}
              className="text-xs px-2 py-1 rounded"
              style={{ color: tokens.color.textSecondary }}
            >
              Hide
            </button>
          </div>
        </div>
      )}

      <div
        className="px-4 py-3 border-t"
        style={{ backgroundColor: tokens.color.surface, borderColor: tokens.color.border }}
      >
        <div className="flex gap-2 items-center">
          {!showCamera && (
            <button
              onClick={() => setShowCamera(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ backgroundColor: tokens.color.surfaceRaised, color: tokens.color.textSecondary }}
              title="Enable camera for emotion detection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
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
