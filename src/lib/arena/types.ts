export type ModelRow = { id:string; name:string; version:string; rating:number; wins:number; losses:number; ties:number; bad:number; battles:number };
export type TopJoke = { id:string; setup:string; punchline:string; model:string; version:string; target:string; wins:number; decisive:number; score:number };
export type PublicArena = { models:ModelRow[]; topJokes:TopJoke[]; stats:{ battles:number; votes:number; open:number } };
export type Joke = { setup:string; punchline:string; model?:string; version?:string; rating?:number };
export type Battle = { id:string; status:'ready'|'generating'|'failed'|'closed'; target?:string; angle?:string; context?:string; choice?:string; prompt?:string; left?:Joke; right?:Joke };
export type Quota = { remaining:number; attemptsRemaining:number; busy:boolean; nextRecovery:string|null };
export const TARGETS = ['Claude','GPT','Gemini','DeepSeek','AI models in general'] as const;
export const ANGLES = ['Confident hallucinations','Endless explanations','Coding disasters','Forgotten context','Overthinking everything','Overly polite refusals'] as const;
