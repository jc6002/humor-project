import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Joke = {
  id: number;
  setup: string;
  punchline: string;
  category: string;
  author: string;
};

type JokeResult =
  | { status: "ready"; jokes: Joke[] }
  | { status: "missing-config" }
  | { status: "error"; message: string };

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function getJokes(): Promise<JokeResult> {
  if (!hasSupabaseEnv()) {
    return { status: "missing-config" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_jokes")
    .select("id, setup, punchline, category, author")
    .order("id", { ascending: true });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "ready", jokes: data ?? [] };
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const result = await getJokes();
  const jokes = result.status === "ready" ? result.jokes : [];
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const user = authData.user;

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b16] text-[#eef2ff]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]">
            AI Joke Lab
          </p>
          <div className="flex items-center gap-3">
            <p className="rounded-full border border-[#7c5cff]/40 bg-[#7c5cff]/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9abff]">
              Week 3 · AI Mode
            </p>
            {user ? (
              <Link href="/members" className="nav-pill border-white/20 bg-[#eef2ff] text-[#080b16]">
                Neural lounge
              </Link>
            ) : (
              <Link href="/auth/signin" className="nav-pill border-white/20 bg-[#eef2ff] text-[#080b16]">
                Sign in with Google
              </Link>
            )}
          </div>
        </nav>

        {params.login === "required" && (
          <div className="mt-6 rounded-2xl border border-[#7c5cff]/35 bg-[#7c5cff]/10 px-5 py-4 text-sm text-[#c9c0ff]">
            Sign in with Google to enter the neural lounge.
          </div>
        )}
        {params.authError === "signin" && (
          <div className="mt-6 rounded-2xl border border-[#ff6b8a]/30 bg-[#ff6b8a]/10 px-5 py-4 text-sm text-[#ffb4c3]">
            Google sign-in is not configured yet. Check the Supabase provider and redirect settings.
          </div>
        )}

        <header className="relative grid gap-8 overflow-hidden border-b border-white/15 py-14 md:grid-cols-[1fr_0.42fr] md:items-end md:py-20">
          <div className="pointer-events-none absolute right-0 top-8 h-48 w-48 rounded-full bg-[#39d9ff]/15 blur-3xl" />
          <div>
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#63e6ff]">
              Humor, hallucinated responsibly
            </p>
            <h1 className="max-w-4xl text-6xl font-semibold leading-[0.88] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              Prompt.
              <span className="block bg-gradient-to-r from-[#8b7cff] via-[#d27cff] to-[#63e6ff] bg-clip-text text-transparent">Punchline.</span>
              Repeat.
            </h1>
          </div>
          <p className="max-w-sm text-base leading-7 text-white/55 md:pb-1">
            A live collection of AI, LLM, robot, and agent jokes fetched from a dedicated Supabase dataset.
          </p>
        </header>

        <section aria-labelledby="collection-heading" className="py-10 sm:py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#63e6ff]">
                Model output · Batch 001
              </p>
              <h2 id="collection-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Fresh from the latent space
              </h2>
            </div>
            {result.status === "ready" && (
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                {jokes.length} {jokes.length === 1 ? "entry" : "entries"}
              </p>
            )}
          </div>

          {result.status === "missing-config" && (
            <StatusCard
              eyebrow="Setup needed"
              title="Connect the database"
              body="Add the Supabase URL and anon key to the environment, then the AI joke batch will appear automatically."
            />
          )}

          {result.status === "error" && (
            <StatusCard
              eyebrow="Connection note"
              title="The model timed out"
              body={`Supabase returned: ${result.message}`}
            />
          )}

          {result.status === "ready" && jokes.length === 0 && (
            <StatusCard
              eyebrow="Empty collection"
              title="No output tokens yet"
              body="Add the first row to the ai_jokes table in Supabase and it will show up here."
            />
          )}

          {jokes.length > 0 && (
            <ol className="grid gap-5 md:grid-cols-2">
              {jokes.map((joke, index) => (
                <li
                  key={joke.id}
                  className="group flex min-h-72 flex-col justify-between rounded-[1.75rem] border border-white/15 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#7c5cff]/60 hover:bg-white/[0.085] sm:p-8"
                >
                  <div>
                    <div className="mb-8 flex items-center justify-between gap-4">
                      <span className="font-mono text-xs font-bold text-[#63e6ff]">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full border border-[#9b87ff]/30 bg-[#7c5cff]/15 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9c0ff]">
                        {joke.category}
                      </span>
                    </div>
                    <p className="text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl">
                      {joke.setup}
                    </p>
                    <p className="mt-5 border-l-2 border-[#d27cff] pl-4 text-base leading-7 text-white/60">
                      {joke.punchline}
                    </p>
                  </div>
                  <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                    Submitted by {joke.author}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/15 py-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Next.js × Supabase Auth × AI Humor</p>
          <p>Human reviewed · Model approved</p>
        </footer>
      </div>
    </main>
  );
}

function StatusCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/20 bg-white/[0.05] p-8 sm:p-10">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#63e6ff]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{title}</h3>
      <p className="mt-3 max-w-2xl leading-7 text-white/55">{body}</p>
    </div>
  );
}
