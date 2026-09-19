export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ec] px-6 py-16 text-[#201f1b]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ff7a59]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#6d5dfc]/20 blur-3xl"
      />

      <section className="relative w-full max-w-3xl rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-[0_30px_90px_rgba(32,31,27,0.12)] backdrop-blur sm:p-12 md:p-16">
        <p className="mb-8 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#6d5dfc] sm:text-sm">
          Designing for GenAI · Week 1
        </p>

        <h1 className="text-6xl font-semibold tracking-[-0.06em] sm:text-7xl md:text-8xl">
          Hello
          <span className="block text-[#ff5c35]">World.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-8 text-black/60 sm:text-xl">
          A small first step: built with Next.js, versioned with GitHub, and
          deployed on Vercel.
        </p>

        <div className="mt-12 flex items-center gap-3 text-sm font-medium text-black/65">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          Ready for the internet
        </div>
      </section>
    </main>
  );
}
