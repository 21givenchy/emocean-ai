"use client";

import React from 'react';
import { useVisualStyles } from '@/app/lib/assessment/VisualTokensContext';

export interface ChipOption {
  id: string;
  label: string;
}

interface QuickReplyChipsProps {
  options: ChipOption[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  /** Marks the chosen chip while the thread advances. */
  selectedId?: string | null;
}

/**
 * Tappable replies, used both for comprehension answers and the feeling check.
 *
 * Chips rather than a textarea in the scored path: free text on a phone raises
 * the keyboard over the thread, and a typed answer can't be scored for
 * correctness without a grader. Chips keep the interaction one tap and the
 * measurement unambiguous.
 */
export const QuickReplyChips: React.FC<QuickReplyChipsProps> = ({
  options,
  onSelect,
  disabled,
  selectedId,
}) => {
  const { tokens, typography } = useVisualStyles();
  const gap = tokens.layout.density === 'compact' ? '6px' : '8px';

  return (
    <div className="flex flex-wrap justify-end" style={{ gap }}>
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            disabled={disabled}
            className="rounded-full transition-opacity disabled:opacity-40"
            style={{
              // Unselected chips are outlined so they read as "available reply",
              // and fill in on selection like a sent message.
              background: isSelected ? tokens.color.accent : 'transparent',
              color: isSelected ? tokens.color.accentText : tokens.color.textPrimary,
              border: `1px solid ${isSelected ? tokens.color.accent : tokens.color.border}`,
              padding: tokens.layout.density === 'compact' ? '6px 12px' : '10px 16px',
              // Keeps the touch target usable while still tracking the type scale.
              minHeight: '44px',
              ...typography,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
