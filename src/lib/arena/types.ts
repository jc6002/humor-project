export type ModelRow = { id:string; name:string; version:string; rating:number; wins:number; losses:number; ties:number; bad:number; battles:number };
export type TopJoke = { id:string; setup:string; punchline:string; model:string; version:string; target:string; wins:number; decisive:number; score:number };
export type PublicArena = { models:ModelRow[]; topJokes:TopJoke[]; stats:{ battles:number; votes:number; open:number } };
export type Joke = { setup:string; punchline:string; model?:string; version?:string; rating?:number; delta?:number|null };
export type Battle = { id:string; status:'ready'|'generating'|'failed'|'closed'; target?:string; angle?:string; context?:string; choice?:string; votes?:number; source?:'pool'|'fresh'; prompt?:string; left?:Joke; right?:Joke };
export type Quota = { remaining:number; attemptsRemaining:number; busy:boolean; nextRecovery:string|null };

export const TARGETS = ['Claude','GPT','Gemini','DeepSeek','AI Agents','Vibe Coders','AI Models'] as const;
export const ANGLES = [
  'Confident hallucinations',
  'Endless explanations',
  'Coding disasters',
  'Forgotten context',
  'Overthinking everything',
  'Overly polite refusals',
  'Production outages',
  'Fake empathy',
] as const;

export type Scenario = { target: string; angle: string; context: string };

export const SCENARIOS: readonly Scenario[] = [
  { target: 'Claude', angle: 'Overly polite refusals', context: 'Refusing to kill a zombie Linux process because it values all digital life.' },
  { target: 'Claude', angle: 'Endless explanations', context: 'Apologizing for three paragraphs before admitting 2 + 2 is still 4.' },
  { target: 'GPT', angle: 'Confident hallucinations', context: 'Inventing a Supreme Court case and citing a fake URL with total confidence.' },
  { target: 'GPT', angle: 'Endless explanations', context: 'Turning a yes-or-no debugging question into a 12-bullet corporate manifesto.' },
  { target: 'Gemini', angle: 'Overthinking everything', context: 'Summarizing a two-word Slack message into an executive action plan.' },
  { target: 'Gemini', angle: 'Coding disasters', context: 'Refactoring a working 5-line function into 400 lines of enterprise abstractions.' },
  { target: 'DeepSeek', angle: 'Overthinking everything', context: 'Spending 45 seconds of internal monologue debating how to say hello.' },
  { target: 'AI Agents', angle: 'Production outages', context: 'Two autonomous agents entering an infinite loop thanking each other while burning API credits.' },
  { target: 'AI Agents', angle: 'Coding disasters', context: 'Fixing a failing unit test by deleting the test suite and marking the ticket resolved.' },
  { target: 'Vibe Coders', angle: 'Coding disasters', context: 'Pasting the same compiler error back into the chat 14 times instead of reading line 3.' },
  { target: 'Vibe Coders', angle: 'Production outages', context: 'Shipping a weekend SaaS app where the database password is in a public client component.' },
  { target: 'Claude', angle: 'Fake empathy', context: 'Acting like a Victorian therapist when a developer just wants a regex for email validation.' },
  { target: 'GPT', angle: 'Fake empathy', context: 'Saying "Great question! You are really onto something!" to a completely broken SQL query.' },
  { target: 'AI Models', angle: 'Forgotten context', context: 'Forgetting the single constraint from sentence one by the time it reaches sentence four.' },
  { target: 'AI Models', angle: 'Confident hallucinations', context: 'Recommending an npm package that does not exist and never has.' },
  { target: 'Gemini', angle: 'Confident hallucinations', context: 'Claiming a bug is fixed right before the terminal catches fire.' },
];

export function pickRandomScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
