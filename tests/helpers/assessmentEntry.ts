/**
 * Single bundle entry for the assessment UI under test.
 *
 * Both symbols must come from ONE esbuild bundle. Bundling the provider and
 * the consumer separately gives each bundle its own copy of the context
 * module, so the provider writes to a different React context than
 * `useVisualTokens` reads from, and every render throws
 * "must be used inside a VisualTokensProvider".
 */
export { VisualTokensProvider } from '../../app/lib/assessment/VisualTokensContext';
export { TrialBubbleExchange } from '../../app/components/assessment/TrialBubbleExchange';
