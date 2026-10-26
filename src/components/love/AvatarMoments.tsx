import { lazy, Suspense, useEffect, useState } from "react";

const AvatarScene = lazy(() => import("./avatar/AvatarScene"));

function useClientGL() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d4af6a]/30 shadow-[0_0_60px_rgba(255,60,100,0.25)]">
      {children}
    </div>
  );
}

const fallback = (
  <div className="flex h-full items-center justify-center text-sm text-white/60">Loading…</div>
);

export function RoseMoment() {
  const gl = useClientGL();
  return (
    <section className="px-6 py-20 text-center">
      <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d4af6a]">For you</p>
      <h2 className="mb-8 font-serif text-3xl text-white md:text-4xl">A rose, from my heart</h2>
      <Stage>
        {gl ? (
          <Suspense fallback={fallback}>
            <AvatarScene pose="rose" />
          </Suspense>
        ) : (
          fallback
        )}
      </Stage>
      <p className="mx-auto mt-6 max-w-sm text-white/75">
        Every petal is a moment I fell for you all over again.
      </p>
    </section>
  );
}

export function KissMoment() {
  const gl = useClientGL();
  const [burst, setBurst] = useState(0);
  return (
    <section className="px-6 py-20 text-center">
      <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d4af6a]">Catch it</p>
      <h2 className="mb-8 font-serif text-3xl text-white md:text-4xl">A kiss, flying your way</h2>
      <Stage>
        {gl ? (
          <Suspense fallback={fallback}>
            <AvatarScene pose="kiss" burst={burst} />
          </Suspense>
        ) : (
          fallback
        )}
      </Stage>
      <button
        type="button"
        onClick={() => setBurst((b) => b + 1)}
        className="mt-6 rounded-full border border-[#d4af6a]/60 bg-[#5a0f22] px-7 py-3 text-sm tracking-wide text-[#f6e2b3] shadow-[0_0_24px_rgba(212,175,106,0.35)] transition hover:bg-[#6e1429]"
      >
        Send me another kiss 💋
      </button>
    </section>
  );
}
