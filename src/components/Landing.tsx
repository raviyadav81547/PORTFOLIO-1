import { PropsWithChildren, useEffect, useRef } from "react";
import "./styles/Landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const WORDS = ["AI Builder.", "Automation.", "GenAI Dev.", "Problem Solver.", "Creator."];

function scramble(el: HTMLElement, finalText: string, duration = 900) {
  let frame = 0;
  const totalFrames = Math.floor(duration / 30);
  const revealAt = (i: number) => Math.floor((i / finalText.length) * totalFrames * 0.6);
  const tick = () => {
    el.textContent = finalText.split("").map((char, i) => {
      if (frame >= revealAt(i)) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join("");
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(tick);
    else el.textContent = finalText;
  };
  requestAnimationFrame(tick);
}

const Landing = ({ children }: PropsWithChildren) => {
  const raviRef   = useRef<HTMLDivElement>(null);
  const kumarRef  = useRef<HTMLDivElement>(null);
  const helloRef  = useRef<HTMLDivElement>(null);
  const typeRef   = useRef<HTMLSpanElement>(null);
  const rightRef  = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // ── RAVI stamp + KUMAR chrome + Hello compress ──
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline({ delay: 3.4 });

    if (helloRef.current) {
      gsap.set(helloRef.current, { opacity: 0, letterSpacing: "20px", y: 20 });
      tl.to(helloRef.current, { opacity: 1, letterSpacing: "5px", y: 0, duration: 0.7, ease: "power3.out" });
    }
    if (raviRef.current) {
      gsap.set(raviRef.current, { y: 80, opacity: 0 });
      tl.to(raviRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, "-=0.3");
    }
    if (kumarRef.current) {
      gsap.set(kumarRef.current, { y: 80, opacity: 0 });
      tl.to(kumarRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, "-=0.45");
    }

    // Float letters
    raviRef.current?.querySelectorAll<HTMLElement>(".nl").forEach((el, i) => {
      gsap.to(el, { y: `+=${1.5 + i * 0.2}`, duration: 2.0 + i * 0.12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.18 });
    });
    kumarRef.current?.querySelectorAll<HTMLElement>(".nl").forEach((el, i) => {
      gsap.to(el, { y: `+=${1.5 + i * 0.2}`, duration: 2.0 + i * 0.12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.18 });
    });

    // Auto scramble once after load
    setTimeout(() => { if (raviRef.current) scramble(raviRef.current, "RAVI", 800); }, 5200);
    setTimeout(() => { if (kumarRef.current) scramble(kumarRef.current, "KUMAR", 900); }, 5500);

    // Hover scramble
    if (raviRef.current) {
      const r = raviRef.current;
      r.addEventListener("mouseenter", () => scramble(r, "RAVI", 700));
    }
    if (kumarRef.current) {
      const k = kumarRef.current;
      k.addEventListener("mouseenter", () => scramble(k, "KUMAR", 700));
    }
  }, []);

  // ── RIGHT SIDE ENTRY + SCROLL SWAP ──
  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;

    const anAI   = el.querySelector(".an-ai-line");
    const wAuto  = el.querySelector(".w-automation");
    const wBuild = el.querySelector(".w-builder");
    const sub    = el.querySelector(".right-sub");
    const badge  = el.querySelector(".right-badge");

    gsap.set([anAI, sub, badge], { opacity: 0, y: 20 });
    gsap.set(wAuto,  { opacity: 0, y: 60, rotateX: 40, skewX: -6 });
    gsap.set(wBuild, { opacity: 0, y: 60 });

    const tl = gsap.timeline({ delay: 3.8 });
    tl.to(anAI,  { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .to(wAuto, { opacity: 1, y: 0, rotateX: 0, skewX: 0, duration: 0.65, ease: "expo.out" }, "-=0.1")
      .to(sub,   { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .to(badge, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, "-=0.1");

    gsap.set(wBuild, { yPercent: 100, opacity: 0 });
    const st = gsap.timeline({
      scrollTrigger: { trigger: ".landing-section", start: "10% top", end: "50% top", scrub: 1.5 },
    });
    st.to(wAuto,  { yPercent: -110, opacity: 0, ease: "none" }, 0)
      .to(anAI,   { y: -20, opacity: 0, ease: "none" }, 0)
      .to(sub,    { opacity: 0, ease: "none" }, 0)
      .fromTo(wBuild, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none" }, 0.05);

    return () => { tl.kill(); st.kill(); };
  }, []);

  // ── TYPEWRITER ──
  useEffect(() => {
    const el = typeRef.current;
    if (!el) return;
    let wi = 0, ci = 0, del = false;
    let t: ReturnType<typeof setTimeout>;
    const type = () => {
      const w = WORDS[wi];
      if (!del) {
        el.textContent = w.slice(0, ++ci);
        if (ci === w.length) { del = true; t = setTimeout(type, 1800); return; }
        t = setTimeout(type, 80);
      } else {
        el.textContent = w.slice(0, --ci);
        if (ci === 0) { del = false; wi = (wi + 1) % WORDS.length; t = setTimeout(type, 300); return; }
        t = setTimeout(type, 40);
      }
    };
    t = setTimeout(type, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-container">

        {/* ── LEFT: NAME ── */}
        <div className="landing-intro">
          <div ref={helloRef} className="hello-text">Hello! I'm</div>

          <div className="name-wrap">
            <div className="name-row" ref={raviRef}>
              {"RAVI".split("").map((c, i) => (
                <span key={i} className="nl" data-char={c}>{c}</span>
              ))}
            </div>
            <div className="name-row kumar-row" ref={kumarRef}>
              {"KUMAR".split("").map((c, i) => (
                <span key={i} className="nl nl-accent nl-chrome" data-char={c}>{c}</span>
              ))}
            </div>
          </div>

          <div className="typewriter-line">
            <span ref={typeRef} className="typewriter-text"></span>
            <span className="typewriter-cursor">|</span>
          </div>

          <div className="landing-tags">
            <span className="tag">AI Systems</span>
            <span className="tag">Automation</span>
            <span className="tag">GenAI</span>
          </div>
        </div>

        {/* ── RIGHT: AN AI + AUTOMATION/BUILDER ── */}
        <div className="landing-info" ref={rightRef}>
          <div className="an-ai-line">
            <span className="an-ai-dot"></span>
            <span className="an-ai-text">An AI</span>
          </div>
          <div className="big-word-clip">
            <div className="w-automation big-word">
              <span className="bw-white">AUTO</span><span className="bw-teal">MATION</span>
            </div>
            <div className="w-builder big-word">
              <span className="bw-white">BUILD</span><span className="bw-purple">ER</span>
            </div>
          </div>
          <p className="right-sub">Systems that think. Workflows that scale.</p>
          <div className="right-badge">
            <span className="rb-dot"></span>
            Available for Projects
          </div>
        </div>

        {/* Glass orbs — decorative, pointer-events none */}
        <div className="landing-orbs" aria-hidden="true">
          {[
            { size: 160, top: "15%", left: "22%" , dur: 7  },
            { size: 80,  top: "65%", left: "8%"  , dur: 9  },
            { size: 100, top: "28%", right: "10%", dur: 6  },
            { size: 55,  top: "72%", right: "22%", dur: 11 },
          ].map((orb, i) => (
            <div
              key={i}
              className="landing-orb"
              style={{
                width: orb.size,
                height: orb.size,
                top: orb.top,
                left: "left" in orb ? (orb as {size:number;top:string;left:string;dur:number}).left : undefined,
                right: "right" in orb ? (orb as {size:number;top:string;right:string;dur:number}).right : undefined,
                animationDuration: `${orb.dur}s`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>

      </div>
      {/* ✅ children = CharacterModel passes through here */}
      {children}
    </div>
  );
};

export default Landing;
