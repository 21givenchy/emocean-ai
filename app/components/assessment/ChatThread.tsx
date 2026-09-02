"use client";

import React, { useEffect, useRef } from 'react';
import { ChatBubble } from './ChatBubble';
import { useVisualTokens } from '@/app/lib/assessment/VisualTokensContext';

export interface ThreadMessage {
  id: string;
  role: 'incoming' | 'outgoing';
  content: React.ReactNode;
  plain?: boolean;
}

interface ChatThreadProps {
  messages: ThreadMessage[];
  /** Renders the typing indicator, which stands in for the washout gap. */
  typing?: boolean;
  /** Rendered under the last bubble — the chip row for the current step. */
  footer?: React.ReactNode;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ messages, typing, footer }) => {
  const tokens = useVisualTokens();
  const endRef = useRef<HTMLDivElement>(null);
  const gap = tokens.layout.density === 'compact' ? '8px' : '12px';

  // Keep the newest bubble in view as the exchange grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, typing, footer]);

  return (
    <div className="flex flex-col" style={{ gap }}>
      {messages.map((m) => (
        <ChatBubble key={m.id} role={m.role} plain={m.plain}>
          {m.content}
        </ChatBubble>
      ))}

      {typing && (
        <ChatBubble role="incoming" plain>
          <span className="flex items-center gap-1 py-1" aria-label="Typing">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="inline-block h-2 w-2 animate-bounce rounded-full"
                style={{ background: 'currentColor', animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        </ChatBubble>
      )}

      {footer}
      <div ref={endRef} />
    </div>
  );
};
