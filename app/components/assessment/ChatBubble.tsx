"use client";

import React from 'react';
import { useVisualStyles } from '@/app/lib/assessment/VisualTokensContext';

interface ChatBubbleProps {
  role: 'incoming' | 'outgoing';
  children: React.ReactNode;
  /**
   * Opt out of the variant typography. Used for the typing indicator and other
   * chrome that isn't part of the material being read — scaling those would add
   * noise to the factor under test without contributing any signal.
   */
  plain?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, children, plain }) => {
  const { tokens, typography } = useVisualStyles();
  const incoming = role === 'incoming';

  // These four token fields existed in designTokens.ts from the beginning but
  // were never referenced anywhere until this component.
  const background = incoming ? tokens.color.incomingBubble : tokens.color.outgoingBubble;
  const color = incoming ? tokens.color.incomingBubbleText : tokens.color.outgoingBubbleText;

  // Density is a real factor in Deep mode, so bubble padding has to respond to
  // it rather than being a fixed Tailwind class.
  const padding = tokens.layout.density === 'compact' ? '8px 12px' : '12px 16px';

  return (
    <div
      className={`w-fit max-w-[85%] ${incoming ? 'mr-auto' : 'ml-auto'}`}
      style={{
        background,
        color,
        padding,
        // Asymmetric corner marks the speaker, the way a message tail does.
        borderRadius: incoming ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        ...(plain ? {} : typography),
      }}
    >
      {children}
    </div>
  );
};
