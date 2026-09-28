import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?login=required");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.first_name || !profile?.last_name) {
    redirect("/profile?welcome=1");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050712] text-[#eef2ff]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
          <Link href="/" className="font-mono text-xs font-bold uppercase tracking-[0.24em]">AI Joke Lab</Link>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="rounded-full border border-white/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">Edit profile</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-full border border-white/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">Sign out</button>
            </form>
          </div>
        </nav>

        <header className="grid min-h-[72vh] content-center gap-10 py-16 md:grid-cols-[1fr_0.55fr] md:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#63e6ff]">Neural lounge · Access granted</p>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              Welcome to the
              <span className="block bg-gradient-to-r from-[#8b7cff] to-[#63e6ff] bg-clip-text text-transparent">latent space.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">
              Hi {profile.first_name}. Your human credentials passed. This route appears only after Supabase verifies your session and profile.
            </p>
          </div>

          <aside className="rotate-2 rounded-[2rem] border border-[#7c5cff]/35 bg-[#7c5cff]/10 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#63e6ff]">Members-only inference #001</p>
            <p className="mt-7 text-2xl font-medium leading-9 tracking-[-0.025em]">Why did the AI refuse to tell the secret joke?</p>
            <p className="mt-6 border-l-2 border-[#d27cff] pl-4 text-base leading-7 text-white/60">It was outside the public context window.</p>
          </aside>
        </header>

        <footer className="border-t border-white/15 py-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Protected by Supabase Auth · Powered by questionable intelligence</footer>
      </div>
    </main>
  );
}
