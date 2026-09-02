"use client";

import React, { createContext, useContext } from 'react';
import type { VisualTokens } from '../designTokens';
import { getTypographyStyles } from './engine';

/**
 * Carries the variant-under-test's tokens to every node in the assessment
 * subtree.
 *
 * Why context and not prop-drilling: the whole point of the assessment is that
 * the interface visibly changes between trials. Before this existed,
 * `getTypographyStyles` was applied to exactly one element (the reading-passage
 * body), so a "large type" trial changed one paragraph while the heading,
 * question, buttons and nav stayed fixed — the factor under test was almost
 * invisible to the participant. Anything that renders text during a trial
 * should read from here so the manipulation is actually perceptible.
 *
 * Why not CSS custom properties: `VisualTokens` is already a typed object
 * consumed across the app; stringly-typed CSS vars would lose that. Custom
 * properties remain the right mechanism for the *exported* Interface Kit
 * (`tokensToCSS`), which is a different job.
 */
const VisualTokensContext = createContext<VisualTokens | null>(null);

export const VisualTokensProvider: React.FC<{
  tokens: VisualTokens;
  children: React.ReactNode;
}> = ({ tokens, children }) => (
  <VisualTokensContext.Provider value={tokens}>{children}</VisualTokensContext.Provider>
);

export function useVisualTokens(): VisualTokens {
  const tokens = useContext(VisualTokensContext);
  if (!tokens) {
    throw new Error('useVisualTokens must be used inside a VisualTokensProvider');
  }
  return tokens;
}

/** Tokens plus the derived type styles, since most callers want both. */
export function useVisualStyles() {
  const tokens = useVisualTokens();
  return { tokens, typography: getTypographyStyles(tokens) };
}
