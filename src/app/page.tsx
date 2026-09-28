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
    .from("jokes")
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
    <main className="min-h-screen overflow-hidden bg-[#f5f0e5] text-[#1d1d1b]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-black/15 pb-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]">
            The Humor Project
          </p>
          <div className="flex items-center gap-3">
            <p className="rounded-full border border-black/15 bg-white/55 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
              Week 3 · Auth
            </p>
            {user ? (
              <Link href="/members" className="nav-pill bg-[#1d1d1b] text-white">
                Members room
              </Link>
            ) : (
              <Link href="/auth/signin" className="nav-pill bg-[#1d1d1b] text-white">
                Sign in with Google
              </Link>
            )}
          </div>
        </nav>

        {params.login === "required" && (
          <div className="mt-6 rounded-2xl border border-[#6552d9]/25 bg-[#6552d9]/10 px-5 py-4 text-sm text-[#4433aa]">
            Sign in with Google to open that members-only page.
          </div>
        )}
        {params.authError === "signin" && (
          <div className="mt-6 rounded-2xl border border-[#e24d2a]/25 bg-[#e24d2a]/10 px-5 py-4 text-sm text-[#9f3219]">
            Google sign-in is not configured yet. Check the Supabase provider and redirect settings.
          </div>
        )}

        <header className="grid gap-8 border-b border-black/15 py-14 md:grid-cols-[1fr_0.42fr] md:items-end md:py-20">
          <div>
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#e24d2a]">
              A tiny database of big laughs
            </p>
            <h1 className="max-w-4xl text-6xl font-semibold leading-[0.88] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              The Laugh
              <span className="block text-[#6552d9]">List.</span>
            </h1>
          </div>
          <p className="max-w-sm text-base leading-7 text-black/60 md:pb-1">
            A growing collection of setups and punchlines, fetched live from a
            Supabase database.
          </p>
        </header>

        <section aria-labelledby="collection-heading" className="py-10 sm:py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                Collection 001
              </p>
              <h2 id="collection-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Fresh from the database
              </h2>
            </div>
            {result.status === "ready" && (
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-black/45">
                {jokes.length} {jokes.length === 1 ? "entry" : "entries"}
              </p>
            )}
          </div>

          {result.status === "missing-config" && (
            <StatusCard
              eyebrow="Setup needed"
              title="Connect the database"
              body="Add the Supabase URL and anon key to the environment, then this collection will appear automatically."
            />
          )}

          {result.status === "error" && (
            <StatusCard
              eyebrow="Connection note"
              title="The jokes took five"
              body={`Supabase returned: ${result.message}`}
            />
          )}

          {result.status === "ready" && jokes.length === 0 && (
            <StatusCard
              eyebrow="Empty collection"
              title="Quiet room, for now"
              body="Add the first row to the jokes table in Supabase and it will show up here."
            />
          )}

          {jokes.length > 0 && (
            <ol className="grid gap-5 md:grid-cols-2">
              {jokes.map((joke, index) => (
                <li
                  key={joke.id}
                  className="group flex min-h-72 flex-col justify-between rounded-[1.75rem] border border-black/15 bg-white/65 p-6 shadow-[0_18px_50px_rgba(37,32,22,0.06)] transition duration-300 hover:-translate-y-1 hover:bg-white sm:p-8"
                >
                  <div>
                    <div className="mb-8 flex items-center justify-between gap-4">
                      <span className="font-mono text-xs font-bold text-[#6552d9]">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-[#f1d36b]/55 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                        {joke.category}
                      </span>
                    </div>
                    <p className="text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl">
                      {joke.setup}
                    </p>
                    <p className="mt-5 border-l-2 border-[#e24d2a] pl-4 text-base leading-7 text-black/65">
                      {joke.punchline}
                    </p>
                  </div>
                  <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Submitted by {joke.author}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/15 py-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Next.js × Supabase Auth × Vercel</p>
          <p>Designing for GenAI · 2026</p>
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
    <div className="rounded-[1.75rem] border border-dashed border-black/20 bg-white/45 p-8 sm:p-10">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#e24d2a]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{title}</h3>
      <p className="mt-3 max-w-2xl leading-7 text-black/60">{body}</p>
    </div>
  );
}
