import { PropsWithChildren, useEffect, useRef } from "react";
import "./styles/Landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "!<>-_\\/[]{}—=+*^?#@$%ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const WORDS = ["AI AUTOMATION BUILDER", "WORKFLOW ARCHITECT", "GENAI DEVELOPER", "PROBLEM SOLVER", "CREATOR"];

const Landing = ({ children }: PropsWithChildren) => {
  const helloRef = useRef<HTMLDivElement>(null);
  const nameRef  = useRef<HTMLDivElement>(null);
  const typeRef  = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // ── HELLO I'M — strike line + slide up ──
  useEffect(() => {
    const hello = helloRef.current;
    if (!hello) return;
    gsap.set(hello, { y: 40, opacity: 0 });
    gsap.to(hello, { y: 0, opacity: 1, duration: 0.6, delay: 3.2, ease: "power3.out" });
  }, []);

  // ── RAVI KUMAR — neeche se aaye + glitch loop ──
  useEffect(() => {
    const letters = nameRef.current?.querySelectorAll<HTMLElement>(".nl");
    if (!letters?.length) return;

    // Entry: neeche se uthna
    gsap.set(letters, { y: 80, opacity: 0, rotateX: -40 });
    gsap.to(letters, {
      y: 0, opacity: 1, rotateX: 0,
      duration: 0.7, stagger: 0.06, delay: 3.5,
      ease: "back.out(1.6)",
    });

    // Float after entry
    letters.forEach((el, i) => {
      gsap.to(el, {
        y: `+=${1.5 + i * 0.15}`,
        duration: 2.0 + i * 0.1,
        repeat: -1, yoyo: true,
        ease: "sine.inOut", delay: 4.2 + i * 0.15,
      });
    });

    // Auto glitch loop on name
    const glitchLoop = () => {
      letters.forEach((el) => {
        const orig = el.dataset.char || "";
        let tick = 0;
        const iv = setInterval(() => {
          if (tick++ > 8) { clearInterval(iv); el.textContent = orig; return; }
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }, 40);
      });
    };
    const loopTimer = setInterval(glitchLoop, 4000);

    // Hover scramble
    const wrap = nameRef.current!;
    const onHover = () => {
      letters.forEach((el) => {
        const orig = el.dataset.char || "";
        let tick = 0;
        const iv = setInterval(() => {
          if (tick++ > 12) { clearInterval(iv); el.textContent = orig; return; }
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }, 45);
      });
    };
    wrap.addEventListener("mouseenter", onHover);

    return () => {
      clearInterval(loopTimer);
      wrap.removeEventListener("mouseenter", onHover);
    };
  }, []);

  // ── RIGHT SIDE — AN AI + AUTOMATION/BUILDER entry + scroll ──
  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;

    const anAI   = el.querySelector(".an-ai-line");
    const wAuto  = el.querySelector(".w-automation");
    const wBuild = el.querySelector(".w-builder");
    const sub    = el.querySelector(".right-sub");
    const badge  = el.querySelector(".right-badge");

    gsap.set([anAI, sub, badge], { opacity: 0, y: 30 });
    gsap.set(wAuto,  { opacity: 0, y: 80, rotateX: 50, skewX: -8 });
    gsap.set(wBuild, { opacity: 0, y: 80, rotateX: 50 });

    const tl = gsap.timeline({ delay: 3.8 });
    tl.to(anAI,   { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .to(wAuto,  { opacity: 1, y: 0, rotateX: 0, skewX: 0, duration: 0.7, ease: "expo.out" }, "-=0.1")
      .to(sub,    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .to(badge,  { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, "-=0.1");

    // Scroll: AUTOMATION out → BUILDER in
    gsap.set(wBuild, { yPercent: 100, opacity: 0 });
    const st = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-section",
        start: "10% top", end: "50% top",
        scrub: 1.5,
      },
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
    let gt: ReturnType<typeof setTimeout>;

    const glitch = () => {
      const orig = el.textContent || "";
      let g = 0;
      const gl = () => {
        if (g++ > 6) { el.textContent = orig; return; }
        el.textContent = orig.split("").map(c =>
          Math.random() > 0.65 ? CHARS[Math.floor(Math.random() * CHARS.length)] : c
        ).join("");
        gt = setTimeout(gl, 45);
      };
      gl();
    };

    const type = () => {
      const w = WORDS[wi];
      if (!del) {
        el.textContent = w.slice(0, ++ci);
        if (ci === w.length) { del = true; t = setTimeout(() => { glitch(); type(); }, 2000); return; }
        t = setTimeout(type, 75);
      } else {
        el.textContent = w.slice(0, --ci);
        if (ci === 0) { del = false; wi = (wi + 1) % WORDS.length; t = setTimeout(type, 300); return; }
        t = setTimeout(type, 35);
      }
    };
    t = setTimeout(type, 1000);
    return () => { clearTimeout(t); clearTimeout(gt); };
  }, []);

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-container">

        {/* ── LEFT: HELLO + NAME ── */}
        <div className="landing-intro">
          {/* Hello I'm — strike effect */}
          <div className="hello-wrap" ref={helloRef}>
            <span className="hello-text">Hello! I'm</span>
            <span className="hello-strike"></span>
          </div>

          {/* RAVI / KUMAR */}
          <div className="name-wrap" ref={nameRef}>
            <div className="name-row">
              {"RAVI".split("").map((c, i) => (
                <span key={i} className="nl nl-ravi" data-char={c}>{c}</span>
              ))}
            </div>
            <div className="name-row kumar-row">
              {"KUMAR".split("").map((c, i) => (
                <span key={i} className="nl nl-accent" data-char={c}>{c}</span>
              ))}
            </div>
          </div>

          {/* Typewriter */}
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
              <span className="bw-stroke">AUTO</span><span className="bw-teal">MATION</span>
            </div>
            <div className="w-builder big-word">
              <span className="bw-stroke">BUILD</span><span className="bw-purple">ER</span>
            </div>
          </div>

          <p className="right-sub">Systems that think. Workflows that scale.</p>

          <div className="right-badge">
            <span className="rb-dot"></span>
            Available for Projects
          </div>

        </div>
      </div>
      {children}
    </div>
  );
};

export default Landing;
