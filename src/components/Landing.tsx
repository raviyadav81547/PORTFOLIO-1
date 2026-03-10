import { PropsWithChildren, useEffect, useRef } from "react";
import "./styles/Landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const WORDS = ["AI Builder.", "Automation.", "GenAI Dev.", "Problem Solver.", "Creator."];

const Landing = ({ children }: PropsWithChildren) => {
  const nameRef    = useRef<HTMLDivElement>(null);
  const typeRef    = useRef<HTMLSpanElement>(null);
  const rightRef   = useRef<HTMLDivElement>(null);

  // ── PAGE LOAD: NAME DROP ──
  useEffect(() => {
    const letters = nameRef.current?.querySelectorAll<HTMLElement>(".nl");
    if (!letters?.length) return;
    gsap.set(letters, { y: -100, opacity: 0, rotateX: 80, scale: 0.7 });
    gsap.to(letters, {
      y: 0, opacity: 1, rotateX: 0, scale: 1,
      duration: 0.7, stagger: 0.06, delay: 3.4,
      ease: "back.out(2)",
    });
    letters.forEach((el, i) => {
      gsap.to(el, {
        y: `+=${2 + i * 0.3}`,
        duration: 1.8 + i * 0.15,
        repeat: -1, yoyo: true,
        ease: "sine.inOut", delay: i * 0.2,
      });
    });
  }, []);

  // ── PAGE LOAD: RIGHT SIDE CINEMATIC ENTRY ──
  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;

    const anAI    = el.querySelector(".an-ai-line");
    const line1   = el.querySelector(".word-line-1");
    const line2   = el.querySelector(".word-line-2");
    const tagline = el.querySelector(".right-tagline");
    const badge   = el.querySelector(".right-badge");

    // Set initial states
    gsap.set(anAI,    { x: -60, opacity: 0 });
    gsap.set(line1,   { y: 80, opacity: 0, rotateX: 45, skewX: -8 });
    gsap.set(line2,   { y: 80, opacity: 0, rotateX: 45, skewX: -8 });
    gsap.set(tagline, { x: 40, opacity: 0 });
    gsap.set(badge,   { scale: 0, opacity: 0, rotation: -15 });

    const tl = gsap.timeline({ delay: 3.8 });

    tl.to(anAI,    { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .to(line1,   { y: 0, opacity: 1, rotateX: 0, skewX: 0, duration: 0.7, ease: "expo.out" }, "-=0.2")
      .to(line2,   { y: 0, opacity: 1, rotateX: 0, skewX: 0, duration: 0.7, ease: "expo.out" }, "-=0.5")
      .to(tagline, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .to(badge,   { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2");

    // ── SCROLL: AUTOMATION → BUILDER swap ──
    gsap.set(".w-automation", { y: 0, opacity: 1 });
    gsap.set(".w-builder",    { y: "100%", opacity: 0 });

    const st = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-section",
        start: "15% top", end: "55% top",
        scrub: 1.2,
      },
    });
    st.to(".w-automation",  { y: "-110%", opacity: 0, duration: 1 }, 0)
      .to(".an-ai-line",    { y: "-30px", opacity: 0, duration: 0.8 }, 0)
      .fromTo(".w-builder", { y: "110%", opacity: 0 },
                            { y: "0%", opacity: 1, duration: 1 }, 0.1)
      .fromTo(".builder-sub",{ y: "30px", opacity: 0 },
                             { y: "0", opacity: 1, duration: 0.8 }, 0.2);

    return () => { tl.kill(); st.kill(); };
  }, []);

  // ── HOVER SCRAMBLE ──
  useEffect(() => {
    const wrap = nameRef.current;
    if (!wrap) return;
    const onEnter = () => {
      wrap.querySelectorAll<HTMLElement>(".nl").forEach((el) => {
        const orig = el.dataset.char || "";
        let tick = 0;
        const iv = setInterval(() => {
          if (tick++ > 10) { clearInterval(iv); el.textContent = orig; return; }
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }, 45);
      });
    };
    wrap.addEventListener("mouseenter", onEnter);
    return () => wrap.removeEventListener("mouseenter", onEnter);
  }, []);

  // ── TYPEWRITER ──
  useEffect(() => {
    const el = typeRef.current;
    if (!el) return;
    let wi = 0, ci = 0, del = false;
    let t: ReturnType<typeof setTimeout>;
    let gt: ReturnType<typeof setTimeout>;
    const glitch = () => {
      const orig = el.textContent || "";
      let g = 0;
      const gl = () => {
        if (g++ > 6) { el.textContent = orig; return; }
        el.textContent = orig.split("").map(c =>
          Math.random() > 0.7 ? CHARS[Math.floor(Math.random() * CHARS.length)] : c
        ).join("");
        gt = setTimeout(gl, 50);
      };
      gl();
    };
    const type = () => {
      const w = WORDS[wi];
      if (!del) {
        el.textContent = w.slice(0, ++ci);
        if (ci === w.length) { del = true; t = setTimeout(() => { glitch(); type(); }, 1800); return; }
        t = setTimeout(type, 80);
      } else {
        el.textContent = w.slice(0, --ci);
        if (ci === 0) { del = false; wi = (wi + 1) % WORDS.length; t = setTimeout(type, 300); return; }
        t = setTimeout(type, 40);
      }
    };
    t = setTimeout(type, 1200);
    return () => { clearTimeout(t); clearTimeout(gt); };
  }, []);

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-container">

        {/* ── LEFT: NAME ── */}
        <div className="landing-intro">
          <h2 className="hello-text">Hello! I'm</h2>
          <div className="name-wrap" ref={nameRef}>
            <div className="name-row">
              {"RAVI".split("").map((c, i) => (
                <span key={i} className="nl" data-char={c}>{c}</span>
              ))}
            </div>
            <div className="name-row kumar-row">
              {"KUMAR".split("").map((c, i) => (
                <span key={i} className="nl nl-purple" data-char={c}>{c}</span>
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

        {/* ── RIGHT: 3D MOTION TEXT ── */}
        <div className="landing-info" ref={rightRef}>

          {/* "An AI" label */}
          <div className="an-ai-line">
            <span className="an-ai-text">An AI</span>
            <span className="an-ai-dot"></span>
          </div>

          {/* AUTOMATION word — clips and scrolls out */}
          <div className="big-word-clip">
            <div className="w-automation big-word">
              <span className="bw-auto">AUTO</span><span className="bw-mation">MATION</span>
            </div>
            {/* BUILDER slides up on scroll */}
            <div className="w-builder big-word">
              <span className="bw-build">BUILD</span><span className="bw-er">ER</span>
            </div>
          </div>

          {/* Sub tagline — changes with scroll */}
          <div className="right-taglines-wrap">
            <div className="word-line-1 right-sub">Systems that think.</div>
            <div className="builder-sub right-sub" style={{ opacity: 0, position: "absolute", top: 0 }}>
              Workflows that scale.
            </div>
          </div>

          {/* Tagline */}
          <div className="right-tagline">
            <span className="rt-dash">—</span> Ravi Kumar
          </div>

          {/* Badge */}
          <div className="right-badge">
            <span className="rb-dot"></span> Available for Projects
          </div>

        </div>
      </div>
      {children}
    </div>
  );
};

export default Landing;
