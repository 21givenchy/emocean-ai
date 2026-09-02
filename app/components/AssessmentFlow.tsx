"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { defaultTokens, modeMeta } from '@/app/lib/designTokens';
import type { VisualMode, VisualTokens } from '@/app/lib/designTokens';
import {
  AssessmentMode,
  Protocol,
  Trial,
  TrialResult,
  TaskMetrics,
  FactorType,
  generateProtocol,
  applyVariant,
  scoreAssessment,
  AssessmentScore,
  getTypographyStyles,
  FACTORS,
} from '@/app/lib/assessment/engine';
import {
  ReadingPassage,
  SearchItem,
  ChatPrompt,
  getReadingPassages,
  getSearchItems,
  getChatPrompts,
} from '@/app/lib/assessment/tasks';
import { VisualTokensProvider } from '@/app/lib/assessment/VisualTokensContext';
import { TrialBubbleExchange } from '@/app/components/assessment/TrialBubbleExchange';

// ── Props ───────────────────────────────────────────────────────────

interface AssessmentFlowProps {
  mode: VisualMode;
  assessmentMode: AssessmentMode;
  onComplete: (result: {
    mode: VisualMode;
    assessmentMode: AssessmentMode;
    score: AssessmentScore;
    tokens: VisualTokens;
    results: TrialResult[];
  }) => void;
  onBack: () => void;
}

// ── Washout duration ────────────────────────────────────────────────

const WASHOUT_MS = 1500;

// ── Component ───────────────────────────────────────────────────────

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({
  mode,
  assessmentMode,
  onComplete,
  onBack,
}) => {
  const [protocol] = useState(() => generateProtocol(assessmentMode));
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState<'washout' | 'task' | 'selfreport' | 'finishing'>('washout');

  /**
   * Callbacks handed to task components must not close over stale state.
   *
   * The previous implementation memoised `handleSelfReport` with an empty
   * dependency array, so it captured render-1's `advanceTrial`, which captured
   * `trialIndex === 0`. The terminal branch (`trialIndex === totalTrials - 1`)
   * was therefore never reachable: the assessment ran past its last trial and
   * crashed reading `protocol.trials[trialIndex].taskId` on the next render.
   * Only users who skipped every trial ever reached the results page.
   *
   * These refs are the source of truth for the callbacks; the useState values
   * remain the source of truth for rendering.
   */
  const resultsRef = useRef<TrialResult[]>([]);
  const trialIndexRef = useRef(0);

  // Preload task content
  const readingPassages = useMemo(() => getReadingPassages(12), []);
  const searchItems = useMemo(() => getSearchItems(12), []);
  const chatPrompts = useMemo(() => getChatPrompts(12), []);

  const currentTrial: Trial | undefined = protocol.trials[trialIndex];
  const totalTrials = protocol.trials.length;
  const progress = ((trialIndex + 1) / totalTrials) * 100;

  // Map trial to task content. Optional chaining is deliberate: `trialIndex`
  // can momentarily sit one past the end while the completion handoff runs.
  const readingIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= trialIndex; i++) {
      if (protocol.trials[i]?.taskId === 'reading') count++;
    }
    return count - 1;
  }, [trialIndex, protocol]);

  const searchIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= trialIndex; i++) {
      if (protocol.trials[i]?.taskId === 'search') count++;
    }
    return count - 1;
  }, [trialIndex, protocol]);

  const chatIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= trialIndex; i++) {
      if (protocol.trials[i]?.taskId === 'chat') count++;
    }
    return count - 1;
  }, [trialIndex, protocol]);

  // Washout timer
  useEffect(() => {
    if (phase === 'washout') {
      const timer = setTimeout(() => setPhase('task'), WASHOUT_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, trialIndex]);

  // Compute tokens for current trial
  const currentTokens = useMemo(() => {
    if (!currentTrial) return defaultTokens[mode];
    return applyVariant(defaultTokens[mode], currentTrial.variantId);
  }, [currentTrial, mode]);

  // Factor label
  const factorLabel = useMemo(() => {
    if (!currentTrial) return '';
    const factor = FACTORS.find((f) => f.id === currentTrial.factorId);
    return factor?.label || '';
  }, [currentTrial]);

  /**
   * Append a result. Held in a ref rather than state: nothing renders the list,
   * and every caller already triggers a re-render via `phase` / `trialIndex`.
   */
  const commitResult = useCallback((result: TrialResult) => {
    resultsRef.current = [...resultsRef.current, result];
  }, []);

  /**
   * Score and hand off. Reads `resultsRef`, not the `results` closure, so the
   * final trial is included — the old implementation scored a snapshot taken
   * before the last result was appended and silently dropped it.
   */
  const finishAssessment = useCallback(() => {
    const allResults = resultsRef.current;
    const score = scoreAssessment(allResults);

    let bestTokens = defaultTokens[mode];
    for (const fs of score.factorScores) {
      const factor = FACTORS.find((f) => f.id === fs.factorId);
      const variant = factor?.variants.find((v) => v.id === fs.bestVariantId);
      if (variant) bestTokens = variant.apply(bestTokens);
    }

    onComplete({
      mode,
      assessmentMode,
      score,
      tokens: bestTokens,
      results: allResults,
    });
  }, [mode, assessmentMode, onComplete]);

  /**
   * Advance or finish. Declared before its callers, and derives the terminal
   * condition from `trialIndexRef` rather than a captured `trialIndex`, so it
   * stays correct however it was memoised. No side effects inside a state
   * updater: those run twice under StrictMode.
   */
  const advanceTrial = useCallback(() => {
    const next = trialIndexRef.current + 1;

    if (next < totalTrials) {
      trialIndexRef.current = next;
      setTrialIndex(next);
      setPhase('washout');
    } else {
      setPhase('finishing');
      finishAssessment();
    }
  }, [totalTrials, finishAssessment]);

  // Handle task completion (from task components)
  const handleTaskComplete = useCallback(
    (metrics: TaskMetrics) => {
      if (!currentTrial) return;
      commitResult({
        trialId: currentTrial.id,
        factorId: currentTrial.factorId,
        variantId: currentTrial.variantId,
        taskId: currentTrial.taskId,
        repeatIndex: currentTrial.repeatIndex,
        skipped: false,
        taskMetrics: metrics,
        selfReport: null,
        timestamp: Date.now(),
      });
      setPhase('selfreport');
    },
    [currentTrial, commitResult]
  );

  // Handle skip — a skipped trial is missing data, not a zero score.
  const handleSkip = useCallback(() => {
    if (!currentTrial) return;
    commitResult({
      trialId: currentTrial.id,
      factorId: currentTrial.factorId,
      variantId: currentTrial.variantId,
      taskId: currentTrial.taskId,
      repeatIndex: currentTrial.repeatIndex,
      skipped: true,
      taskMetrics: null,
      selfReport: null,
      timestamp: Date.now(),
    });
    advanceTrial();
  }, [currentTrial, commitResult, advanceTrial]);

  /**
   * A trial in the chat thread returns both measurements at once: the answer
   * tap and the feeling tap. Committing them together removes the separate
   * `'selfreport'` phase, which is what previously doubled the number of
   * full-screen steps in a session.
   */
  const handleExchangeComplete = useCallback(
    (metrics: TaskMetrics, selfReport: number) => {
      if (!currentTrial) return;
      commitResult({
        trialId: currentTrial.id,
        factorId: currentTrial.factorId,
        variantId: currentTrial.variantId,
        taskId: currentTrial.taskId,
        repeatIndex: currentTrial.repeatIndex,
        skipped: false,
        taskMetrics: metrics,
        selfReport,
        timestamp: Date.now(),
      });
      advanceTrial();
    },
    [currentTrial, commitResult, advanceTrial],
  );

  // Handle self-report submit
  const handleSelfReport = useCallback(
    (rating: number) => {
      // Replace the last result immutably; the old code mutated an object that
      // was already in state, which is unreliable under StrictMode.
      const updated = [...resultsRef.current];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0) {
        updated[lastIndex] = { ...updated[lastIndex], selfReport: rating };
        resultsRef.current = updated;
      }
      advanceTrial();
    },
    [advanceTrial]
  );

  // Current factor number
  const currentFactorNum = useMemo(() => {
    if (!currentTrial) return 0;
    return protocol.factorOrder.indexOf(currentTrial.factorId) + 1;
  }, [currentTrial, protocol]);

  const totalFactors = protocol.factorOrder.length;

  /**
   * Reached when every trial is done and we are handing off to the results
   * page, or if a protocol ever runs short. Renders a visible state rather than
   * `null`, which would leave a blank page with no way forward.
   */
  if (!currentTrial || phase === 'finishing') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ backgroundColor: '#071318', color: '#F5F7F2' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }}
        />
        <p style={{ color: '#A9BAB8' }}>Scoring your session…</p>
        <button onClick={onBack} className="mt-4 text-sm underline" style={{ color: '#A9BAB8' }}>
          Cancel and go back
        </button>
      </div>
    );
  }

  return (
    <VisualTokensProvider tokens={currentTokens}>
      {/*
        Fixed full-bleed backdrop. `min-h-dvh` alone leaves iOS Safari showing
        the default page background behind the content when the URL bar
        collapses, so the canvas colour is painted by a fixed layer underneath
        rather than only on the scrolling wrapper.
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 transition-colors duration-500"
        style={{ backgroundColor: currentTokens.color.canvas }}
      />
    <div
      className="min-h-dvh transition-colors duration-500"
      style={{
        backgroundColor: currentTokens.color.canvas,
        color: currentTokens.color.textPrimary,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Nav */}
      <nav
        className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: currentTokens.color.border }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: currentTokens.color.textSecondary }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="text-sm" style={{ color: currentTokens.color.textSecondary }}>
          {factorLabel} · Trial {trialIndex + 1}/{totalTrials}
        </div>
      </nav>

      {/* Progress bar */}
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: currentTokens.color.surface }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: currentTokens.color.accent }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: currentTokens.color.textSecondary }}>
          <span>Factor {currentFactorNum} of {totalFactors}</span>
          <span>{assessmentMode === 'quick' ? 'Quick' : 'Deep'} mode</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Washout screen */}
        {phase === 'washout' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4"
              style={{ borderColor: currentTokens.color.accent, borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: currentTokens.color.textSecondary }}>
              Preparing next comparison…
            </p>
          </div>
        )}

        {/* Task phase — one bubble exchange per trial. */}
        {phase === 'task' && currentTrial.taskId === 'reading' && (
          <TrialBubbleExchange
            // Remounts per trial so answer/feeling state never leaks forward.
            key={currentTrial.id}
            trialKey={currentTrial.id}
            passage={readingPassages[readingIndex % readingPassages.length]}
            onComplete={handleExchangeComplete}
            onSkip={handleSkip}
          />
        )}

        {phase === 'task' && currentTrial.taskId === 'search' && (
          <SearchTask
            item={searchItems[searchIndex % searchItems.length]}
            tokens={currentTokens}
            onComplete={handleTaskComplete}
            onSkip={handleSkip}
          />
        )}

        {phase === 'task' && currentTrial.taskId === 'chat' && (
          <ChatTask
            prompt={chatPrompts[chatIndex % chatPrompts.length]}
            tokens={currentTokens}
            onComplete={handleTaskComplete}
            onSkip={handleSkip}
          />
        )}

        {/*
          Self-report phase. Reading trials now collect the feeling check
          inline as the last tap of their bubble exchange, so this only runs
          for the search/chat tasks still used by Deep mode.
        */}
        {phase === 'selfreport' && (
          <SelfReportPhase
            tokens={currentTokens}
            variantLabel={currentTrial.variantId}
            onSubmit={handleSelfReport}
          />
        )}
      </div>
    </div>
    </VisualTokensProvider>
  );
};

// ── Reading Task ────────────────────────────────────────────────────

interface TaskProps {
  tokens: VisualTokens;
  onComplete: (metrics: TaskMetrics) => void;
  onSkip: () => void;
}

function ReadingTask({
  passage,
  tokens,
  onComplete,
  onSkip,
}: TaskProps & { passage: ReadingPassage }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startTime] = useState(() => Date.now());

  const handleSubmit = () => {
    if (selected === null) return;
    const responseTimeMs = Date.now() - startTime;
    onComplete({
      taskType: 'reading',
      correct: selected === passage.correctIndex,
      responseTimeMs,
      details: {
        passageId: passage.id,
        questionId: passage.id,
        selectedAnswer: selected,
        correctAnswer: passage.correctIndex,
      },
    });
  };

  const typoStyles = getTypographyStyles(tokens);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{passage.title}</h2>
      <div
        className="rounded-xl p-5 mb-6 leading-relaxed"
        style={{
          backgroundColor: tokens.color.surface,
          border: `1px solid ${tokens.color.border}`,
          ...typoStyles,
        }}
      >
        {passage.body}
      </div>
      <p className="font-medium mb-4">{passage.question}</p>
      <div className="space-y-2 mb-6">
        {passage.answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="w-full text-left p-3 rounded-xl border transition-all"
            style={{
              borderColor: selected === i ? tokens.color.accent : tokens.color.border,
              backgroundColor: selected === i ? `${tokens.color.accent}15` : tokens.color.surface,
              color: tokens.color.textPrimary,
            }}
          >
            <span className="font-medium mr-2" style={{ color: tokens.color.accent }}>
              {String.fromCharCode(65 + i)}.
            </span>
            {answer}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="flex-1 py-3 rounded-xl font-medium transition-colors"
          style={{
            backgroundColor: selected !== null ? tokens.color.accent : tokens.color.surface,
            color: selected !== null ? tokens.color.accentText : tokens.color.textSecondary,
          }}
        >
          Submit
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: tokens.color.surface,
            color: tokens.color.textSecondary,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ── Search Task ─────────────────────────────────────────────────────

function SearchTask({
  item,
  tokens,
  onComplete,
  onSkip,
}: TaskProps & { item: SearchItem }) {
  const [found, setFound] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [scanned, setScanned] = useState(0);

  const handleItemClick = (char: string, index: number) => {
    setScanned((prev) => prev + 1);
    if (char === item.target) {
      setFound(true);
      const searchTimeMs = Date.now() - startTime;
      onComplete({
        taskType: 'search',
        correct: true,
        responseTimeMs: searchTimeMs,
        details: {
          targetFound: true,
          searchTimeMs,
          distractorsScanned: scanned,
        },
      });
    }
  };

  return (
    <div>
      <p className="text-sm mb-2" style={{ color: tokens.color.textSecondary }}>
        {item.instruction}
      </p>
      <p className="font-medium mb-6">
        Find: <span className="text-2xl ml-2">{item.target}</span>
      </p>
      <div
        className="grid grid-cols-4 gap-3 mb-6"
        style={{ opacity: found ? 0.5 : 1, transition: 'opacity 0.3s' }}
      >
        {item.distractors.map((char, i) => (
          <button
            key={i}
            onClick={() => handleItemClick(char, i)}
            disabled={found}
            className="aspect-square rounded-xl flex items-center justify-center text-2xl font-medium border transition-all hover:scale-105"
            style={{
              backgroundColor: tokens.color.surface,
              borderColor: tokens.color.border,
              color: tokens.color.textPrimary,
            }}
          >
            {char}
          </button>
        ))}
      </div>
      {found && (
        <p className="text-center font-medium" style={{ color: tokens.color.success }}>
          Found in {scanned + 1} taps
        </p>
      )}
      {!found && (
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: tokens.color.surface,
            color: tokens.color.textSecondary,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}

// ── Chat Task ───────────────────────────────────────────────────────

function ChatTask({
  prompt,
  tokens,
  onComplete,
  onSkip,
}: TaskProps & { prompt: ChatPrompt }) {
  const [reply, setReply] = useState('');
  const [startTime] = useState(() => Date.now());

  const handleSubmit = () => {
    if (reply.trim().length === 0) return;
    const responseTimeMs = Date.now() - startTime;
    onComplete({
      taskType: 'chat',
      correct: reply.trim().length > 0,
      responseTimeMs,
      details: {
        replyLength: reply.trim().length,
        sentimentScore: 0.5,
        responseTimeMs,
      },
    });
  };

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: tokens.color.textSecondary }}>
        {prompt.context}
      </p>
      <p className="font-medium mb-4">{prompt.prompt}</p>
      <div
        className="rounded-xl p-4 mb-6 min-h-[100px]"
        style={{ backgroundColor: tokens.color.surface, border: `1px solid ${tokens.color.border}` }}
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="w-full bg-transparent outline-none resize-none"
          style={{
            color: tokens.color.textPrimary,
            minHeight: '80px',
            fontSize: tokens.typography.scale === 'large' ? '18px' : tokens.typography.scale === 'compact' ? '14px' : '16px',
          }}
          rows={3}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={reply.trim().length === 0}
          className="flex-1 py-3 rounded-xl font-medium transition-colors"
          style={{
            backgroundColor: reply.trim().length > 0 ? tokens.color.accent : tokens.color.surface,
            color: reply.trim().length > 0 ? tokens.color.accentText : tokens.color.textSecondary,
          }}
        >
          Send
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: tokens.color.surface,
            color: tokens.color.textSecondary,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ── Self-Report Phase ───────────────────────────────────────────────

function SelfReportPhase({
  tokens,
  variantLabel,
  onSubmit,
}: {
  tokens: VisualTokens;
  variantLabel: string;
  onSubmit: (rating: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const labels = [
    { value: 1, label: 'Too much' },
    { value: 2, label: '' },
    { value: 3, label: '' },
    { value: 4, label: '' },
    { value: 5, label: 'Feels right' },
  ];

  return (
    <div className="text-center py-8">
      <p className="text-lg font-medium mb-2">How did this feel?</p>
      <p className="text-sm mb-8" style={{ color: tokens.color.textSecondary }}>
        {variantLabel}
      </p>
      <div className="flex justify-center gap-3 mb-4">
        {labels.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelected(value)}
            className="w-12 h-12 rounded-full border-2 transition-all hover:scale-110"
            style={{
              borderColor: selected === value ? tokens.color.accent : tokens.color.border,
              backgroundColor: selected === value ? tokens.color.accent : tokens.color.surface,
              color: selected === value ? tokens.color.accentText : tokens.color.textPrimary,
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs max-w-xs mx-auto mb-8" style={{ color: tokens.color.textSecondary }}>
        <span>Too much</span>
        <span>Feels right</span>
      </div>
      <button
        onClick={() => selected !== null && onSubmit(selected)}
        disabled={selected === null}
        className="px-8 py-3 rounded-xl font-medium transition-colors"
        style={{
          backgroundColor: selected !== null ? tokens.color.accent : tokens.color.surface,
          color: selected !== null ? tokens.color.accentText : tokens.color.textSecondary,
        }}
      >
        Continue
      </button>
    </div>
  );
}
