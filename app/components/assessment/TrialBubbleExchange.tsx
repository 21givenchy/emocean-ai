"use client";

import React, { useMemo, useState } from 'react';
import { ChatThread, type ThreadMessage } from './ChatThread';
import { QuickReplyChips, type ChipOption } from './QuickReplyChips';
import type { TaskMetrics } from '@/app/lib/assessment/engine';
import type { ReadingPassage } from '@/app/lib/assessment/tasks';

interface TrialBubbleExchangeProps {
  passage: ReadingPassage;
  /** Changes identity per trial so the exchange remounts with fresh state. */
  trialKey: string;
  onComplete: (metrics: TaskMetrics, selfReport: number) => void;
  onSkip: () => void;
}

/**
 * One trial, as a single bubble exchange.
 *
 * This replaces the old two-screen shape (a task card, then a separate
 * full-screen 1-5 rating). That split is what made a Quick session feel like a
 * survey: 8 trials meant 16 full-screen steps plus washouts. Here a trial is
 * passage -> question -> answer tap -> feeling tap, inside one continuous
 * thread, and both measurements come back in a single `onComplete`.
 *
 * The feeling check stays a *separate tap* from the answer rather than being
 * inferred from it: preference and performance are different results and must
 * not be derived from one another.
 */
export const TrialBubbleExchange: React.FC<TrialBubbleExchangeProps> = ({
  passage,
  trialKey,
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<'answering' | 'feeling'>('answering');
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [feelingId, setFeelingId] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);

  const answerOptions: ChipOption[] = useMemo(
    () => passage.answers.map((label, i) => ({ id: String(i), label })),
    [passage],
  );

  // Three chips instead of a 1-5 row: faster to answer honestly, and the
  // endpoints of the old scale were the only ones ever labelled anyway. Mapped
  // onto the existing 1-5 `selfReport` field so the stored data shape and the
  // scoring engine are unchanged.
  const feelingOptions: ChipOption[] = [
    { id: '2', label: '😕 Hard to read' },
    { id: '3', label: '🙂 Fine' },
    { id: '5', label: '😀 Easy to read' },
  ];

  const messages: ThreadMessage[] = useMemo(() => {
    const list: ThreadMessage[] = [
      {
        id: `${trialKey}-passage`,
        role: 'incoming',
        content: (
          <>
            <strong className="mb-1 block">{passage.title}</strong>
            {passage.body}
          </>
        ),
      },
      { id: `${trialKey}-question`, role: 'incoming', content: passage.question },
    ];

    if (answerId !== null) {
      list.push({
        id: `${trialKey}-answer`,
        role: 'outgoing',
        content: passage.answers[Number(answerId)],
      });
      list.push({
        id: `${trialKey}-feelingq`,
        role: 'incoming',
        content: 'How did that feel to read?',
      });
    }

    if (feelingId !== null) {
      list.push({
        id: `${trialKey}-feeling`,
        role: 'outgoing',
        content: feelingOptions.find((f) => f.id === feelingId)?.label ?? '',
      });
    }

    return list;
    // feelingOptions is a stable literal; excluded deliberately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialKey, passage, answerId, feelingId]);

  const handleAnswer = (id: string) => {
    if (answerId !== null) return;
    setAnswerId(id);
    setAnsweredAt(Date.now());
    setStep('feeling');
  };

  const handleFeeling = (id: string) => {
    if (feelingId !== null) return;
    setFeelingId(id);

    const selected = Number(answerId);
    onComplete(
      {
        taskType: 'reading',
        correct: selected === passage.correctIndex,
        // Timed to the answer tap, not the feeling tap — the feeling question
        // appears after the task is already done and must not inflate latency.
        responseTimeMs: (answeredAt ?? Date.now()) - startedAt,
        details: {
          passageId: passage.id,
          questionId: passage.id,
          selectedAnswer: selected,
          correctAnswer: passage.correctIndex,
        },
      },
      Number(id),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <ChatThread
        messages={messages}
        footer={
          step === 'answering' ? (
            <QuickReplyChips
              options={answerOptions}
              onSelect={handleAnswer}
              selectedId={answerId}
            />
          ) : (
            <QuickReplyChips
              options={feelingOptions}
              onSelect={handleFeeling}
              selectedId={feelingId}
              disabled={feelingId !== null}
            />
          )
        }
      />

      <button
        type="button"
        onClick={onSkip}
        className="self-center text-xs underline opacity-60 transition-opacity hover:opacity-100"
      >
        Skip this one
      </button>
    </div>
  );
};
