"use client";

import React, { useState, useRef, useEffect } from 'react';

type Emotion = 'joy' | 'calm' | 'focus' | 'surprise' | 'tense' | 'curious' | 'drowsy' | 'talking' | 'sad' | 'angry' | 'frustrated';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EmotionChatProps {
  currentEmotion: Emotion | null;
  confidence: number;
}

const calmingResponses: Record<Emotion, string[]> = {
  joy: [
    "I can see you're feeling great! That positive energy is wonderful.",
    "Your smile is contagious! Keep spreading that joy.",
    "Happiness looks good on you! What's making you feel so positive?"
  ],
  calm: [
    "You seem very centered right now. That's a great state to be in.",
    "Your calm energy is peaceful. Take a moment to appreciate this feeling.",
    "Being calm helps us think clearly. What would you like to focus on?"
  ],
  focus: [
    "I can see you're concentrating deeply. That's impressive focus!",
    "Your dedication shows. Keep channeling that energy.",
    "Deep focus leads to great work. What are you working on?"
  ],
  surprise: [
    "Something caught your attention! What surprised you?",
    "Surprise can be exciting! Tell me what happened.",
    "That unexpected moment created a reaction. How do you feel about it?"
  ],
  tense: [
    "I notice you might be feeling some tension. Would you like to try a breathing exercise?",
    "Let's take a moment to relax. Try breathing in for 4 counts, holding for 4, and out for 4.",
    "Tension often comes from holding onto stress. Would you like to talk about what's bothering you?"
  ],
  curious: [
    "Your curiosity is showing! What are you wondering about?",
    "Being curious is the beginning of wisdom. What would you like to explore?",
    "I love that inquisitive look! What questions do you have?"
  ],
  drowsy: [
    "You seem a bit tired. Would you like to take a short break?",
    "Rest is important for productivity. Maybe step away for a few minutes?",
    "Feeling drowsy? A quick stretch might help energize you."
  ],
  talking: [
    "I see you're engaged in conversation! What are you discussing?",
    "Communication is key. How is the conversation going?",
    "You seem animated while talking. What topic has your attention?"
  ],
  sad: [
    "I notice you might be feeling down. It's okay to feel this way sometimes.",
    "Sadness is a natural emotion. Would you like to talk about what's bothering you?",
    "Remember, it's okay to not be okay. I'm here if you need to talk."
  ],
  angry: [
    "I can see you're feeling frustrated. Let's take a deep breath together.",
    "Anger is a valid emotion. Would you like to talk about what's causing this feeling?",
    "When we feel angry, it helps to pause and breathe. In for 4, hold for 4, out for 4."
  ],
  frustrated: [
    "Frustration can be overwhelming. Let's break this down into smaller steps.",
    "I understand this is difficult. Would you like to talk through what's causing the frustration?",
    "When things feel stuck, taking a short break often helps. Would you like to try that?"
  ]
};

const emotionToColor: Record<Emotion, { bg: string; text: string; border: string }> = {
  joy: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  calm: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  focus: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  surprise: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  tense: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  curious: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  drowsy: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  talking: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  sad: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  angry: { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-400' },
  frustrated: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
};

export const EmotionChat: React.FC<EmotionChatProps> = ({ currentEmotion, confidence }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your emotional wellness assistant. I can adapt my responses based on how you're feeling. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [lastEmotion, setLastEmotion] = useState<Emotion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentEmotion && currentEmotion !== lastEmotion && confidence > 0.6) {
      const responses = calmingResponses[currentEmotion];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setLastEmotion(currentEmotion);
    }
  }, [currentEmotion, confidence, lastEmotion]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const emotion = currentEmotion || 'calm';
      const responses = calmingResponses[emotion];
      const botResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const colors = currentEmotion ? emotionToColor[currentEmotion] : emotionToColor.calm;

  return (
    <div className={`flex flex-col rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden transition-colors duration-500`}>
      <div className={`px-4 py-3 border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${currentEmotion === 'angry' || currentEmotion === 'frustrated' ? 'bg-gray-400' : 'bg-green-500'}`} />
            <span className={`font-medium ${colors.text}`}>Wellness Assistant</span>
          </div>
          {currentEmotion && (
            <span className={`text-xs px-2 py-1 rounded-full ${colors.text} bg-white/50`}>
              {currentEmotion} ({Math.round(confidence * 100)}%)
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[300px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : `bg-white ${colors.text} border ${colors.border}`
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-3 border-t ${colors.border}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className={`flex-1 rounded-full px-4 py-2 text-sm border ${colors.border} bg-white focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          <button
            onClick={handleSend}
            className="rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
        <p className={`text-xs mt-2 ${colors.text} opacity-70`}>
          {currentEmotion === 'angry' || currentEmotion === 'frustrated'
            ? "I've adjusted to calmer colors to help you feel more at ease."
            : currentEmotion === 'sad'
            ? "Using warmer tones to help lift your spirits."
            : "Chat adapts to your emotional state for better support."}
        </p>
      </div>
    </div>
  );
};
