export interface ReadingPassage {
  id: string;
  title: string;
  body: string;
  question: string;
  answers: string[];
  correctIndex: number;
}

export interface SearchItem {
  id: string;
  target: string;
  distractors: string[];
  instruction: string;
}

export interface ChatPrompt {
  id: string;
  context: string;
  prompt: string;
  sampleReply: string;
}

// ── Reading passages (3-4 sentences, accessible vocabulary) ─────────

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'r1',
    title: 'Tidal pools',
    body: 'Tidal pools form in depressions along rocky coastlines. As the tide recedes, water trapped in these basins supports a miniature ecosystem. Anemones, crabs, and small fish depend on the daily rhythm of inflow and evaporation. The temperature in a shallow pool can swing ten degrees in a single afternoon.',
    question: 'What causes temperature swings in tidal pools?',
    answers: [
      'Daily changes in water level',
      'The color of the rocks',
      'Wind blowing across the surface',
      'Fish swimming near the bottom',
    ],
    correctIndex: 0,
  },
  {
    id: 'r2',
    title: 'Paper记忆力',
    body: 'Researchers tested whether handwriting notes improves memory compared to typing. Participants who wrote by hand recalled 15 percent more details after a one-hour delay. The team concluded that the motor act of forming letters strengthens the memory trace. However, typing speed was not a factor in the results.',
    question: 'According to the passage, what improves memory in the study?',
    answers: [
      'Typing speed',
      'The motor act of forming letters',
      'The length of the notes',
      'The color of the pen',
    ],
    correctIndex: 1,
  },
  {
    id: 'r3',
    title: 'Urban bees',
    body: 'Honeybees in cities face different challenges than rural bees. Urban forage often comes from ornamental plants that bloom out of season. Traffic noise can mask the waggle dance bees use to communicate. Despite this, some urban colonies thrive by visiting rooftop gardens and park flower beds.',
    question: 'What helps some urban bee colonies thrive?',
    answers: [
      'Reduced traffic noise at night',
      'Rooftop gardens and park flower beds',
      'Seasonal blooms in rural areas',
      'The waggle dance becoming louder',
    ],
    correctIndex: 1,
  },
  {
    id: 'r4',
    title: 'Sleep cycles',
    body: 'A full sleep cycle lasts roughly ninety minutes. During the deep-slow-wave phase, the body repairs tissue and consolidates factual memories. In the REM phase, the brain processes emotions and consolidates procedural memories. Waking someone mid-cycle can leave them groggy even after eight hours in bed.',
    question: 'What happens during the REM phase of sleep?',
    answers: [
      'Tissue repair occurs',
      'Factual memories are consolidated',
      'The brain processes emotions',
      'Heart rate drops to its lowest',
    ],
    correctIndex: 2,
  },
  {
    id: 'r5',
    title: 'Soil networks',
    body: 'Beneath a single hectare of forest floor, fungal threads can stretch for kilometers. These mycorrhizal networks connect trees and allow them to share nutrients. A seedling in deep shade may receive carbon from a sunlit neighbor through the fungal web. Scientists call this the wood wide web.',
    question: 'What do mycorrhizal networks allow trees to share?',
    answers: [
      'Sunlight',
      'Seeds',
      'Nutrients',
      'Root space',
    ],
    correctIndex: 2,
  },
  {
    id: 'r6',
    title: 'Color naming',
    body: 'Languages divide the color spectrum differently. Russian distinguishes light blue from dark blue as separate basic terms. The Himba people of Namibia group greens and blues together but have distinct terms for shades of green that look identical to English speakers. Studies show these linguistic boundaries affect how quickly people detect color differences.',
    question: 'What effect do linguistic color boundaries have?',
    answers: [
      'They change the physical spectrum of light',
      'They affect how quickly people detect color differences',
      'They determine which colors appear in nature',
      'They eliminate the need for color correction',
    ],
    correctIndex: 1,
  },
];

// ── Visual search items ─────────────────────────────────────────────

export const SEARCH_ITEMS: SearchItem[] = [
  {
    id: 's1',
    target: '△',
    distractors: ['▽', '◇', '○', '□', '☆', '△', '□', '◇', '○', '☆', '△', '▽'],
    instruction: 'Find the upward-pointing triangle',
  },
  {
    id: 's2',
    target: 'Q',
    distractors: ['O', 'D', 'Q', 'P', 'O', 'G', 'Q', 'D', 'O', 'P', 'G', 'Q'],
    instruction: 'Find the letter Q among similar shapes',
  },
  {
    id: 's3',
    target: '●',
    distractors: ['○', '◉', '●', '○', '◎', '●', '○', '◉', '◎', '○', '●', '○'],
    instruction: 'Find the solid black circle',
  },
  {
    id: 's4',
    target: 'K',
    distractors: ['X', 'K', 'Y', 'X', 'K', 'H', 'X', 'Y', 'K', 'H', 'X', 'Y'],
    instruction: 'Find the letter K among similar letters',
  },
  {
    id: 's5',
    target: '★',
    distractors: ['☆', '★', '☆', '★', '☆', '★', '☆', '★', '☆', '★', '☆', '★'],
    instruction: 'Find the filled star',
  },
  {
    id: 's6',
    target: '6',
    distractors: ['9', '6', '9', '6', '9', '6', '9', '6', '9', '6', '9', '6'],
    instruction: 'Find the number 6 among 9s',
  },
];

// ── Chat reply prompts ──────────────────────────────────────────────

export const CHAT_PROMPTS: ChatPrompt[] = [
  {
    id: 'c1',
    context: 'Amina: Hey, are you free for a quick call later?',
    prompt: 'Reply to Amina in one or two sentences.',
    sampleReply: 'Sure, I am free after 3pm. Want me to send a calendar invite?',
  },
  {
    id: 'c2',
    context: 'Marcus: I finished the draft. Can you take a look when you get a chance?',
    prompt: 'Reply to Marcus in one or two sentences.',
    sampleReply: 'Nice work. I will review it this afternoon and send feedback.',
  },
  {
    id: 'c3',
    context: 'Lena: The meeting moved to Thursday. Sorry for the late heads-up.',
    prompt: 'Reply to Lena in one or two sentences.',
    sampleReply: 'No worries, thanks for letting me know. Thursday works for me.',
  },
  {
    id: 'c4',
    context: 'Jordan: Do you have the link for the design file?',
    prompt: 'Reply to Jordan in one or two sentences.',
    sampleReply: 'Here it is. Let me know if you need edit access.',
  },
  {
    id: 'c5',
    context: 'Priya: Great presentation today! The team loved the demo.',
    prompt: 'Reply to Priya in one or two sentences.',
    sampleReply: 'Thanks Priya. Glad the demo landed well. Excited for the next step.',
  },
  {
    id: 'c6',
    context: 'Sam: Running 10 minutes late. Start without me?',
    prompt: 'Reply to Sam in one or two sentences.',
    sampleReply: 'Sure, we will get started. I will catch you up when you arrive.',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getReadingPassages(count: number): ReadingPassage[] {
  return pickRandom(READING_PASSAGES, Math.min(count, READING_PASSAGES.length));
}

export function getSearchItems(count: number): SearchItem[] {
  return pickRandom(SEARCH_ITEMS, Math.min(count, SEARCH_ITEMS.length));
}

export function getChatPrompts(count: number): ChatPrompt[] {
  return pickRandom(CHAT_PROMPTS, Math.min(count, CHAT_PROMPTS.length));
}
