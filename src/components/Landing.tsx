import { PropsWithChildren, useEffect, useRef } from "react";
import "./styles/Landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const RAVI_DATA = [
  { char: "R", color: "#FF3B3B", glow: "#FF000088", rot: -5 },
  { char: "A", color: "#FF8C00", glow: "#FF8C0088", rot: -2 },
  { char: "V", color: "#FFD700", glow: "#FFD70088", rot: 2  },
  { char: "I", color: "#39D353", glow: "#39D35388", rot: 5  },
];

const KUMAR_DATA = [
  { char: "K", color: "#4285F4", glow: "#4285F488", rot: -6   },
  { char: "U", color: "#7B2FFF", glow: "#7B2FFF88", rot: -3   },
  { char: "M", color: "#c481ff", glow: "#c481ff88", rot: 0    },
  { char: "A", color: "#FF69B4", glow: "#FF69B488", rot: 3    },
  { char: "R", color: "#FF3B3B", glow: "#FF3B3B88", rot: 6    },
];

const WORDS = ["AI Builder.", "Automation.", "GenAI Dev.", "Problem Solver.", "RAVI KUMAR."];

const Landing = ({ children }: PropsWithChildren) => {
  const nameRef  = useRef<HTMLDivElement>(null);
  const typeRef  = useRef<HTMLSpanElement>(null);

  // ── PAGE LOAD ANIMATION ──
  useEffect(() => {
    const letters = nameRef.current?.querySelectorAll<HTMLElement>(".nl");
    if (!letters) return;

    gsap.set(letters, { y: -150, opacity: 0, rotateX: 90, scale: 0.5 });

    gsap.to(letters, {
      y: 0, opacity: 1, rotateX: 0, scale: 1,
      duration: 0.8,
      stagger: 0.07,
      delay: 3.3,
      ease: "back.out(2.2)",
    });

    // ── CONTINUOUS FLOAT ──
    letters.forEach((el, i) => {
      gsap.to(el, {
        y: `+=${3 + i * 0.5}`,
        rotateZ: `+=${1.5}`,
        duration: 1.6 + i * 0.18,
        repeat: -1, yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.22,
      });
    });
  }, []);

  // ── HOVER SCRAMBLE + COLOR FLASH ──
  useEffect(() => {
    const wrap = nameRef.current;
    if (!wrap) return;
    const allData = [...RAVI_DATA, ...KUMAR_DATA];

    const onEnter = () => {
      const letters = wrap.querySelectorAll<HTMLElement>(".nl");
      letters.forEach((el, i) => {
        let tick = 0;
        const orig = allData[i]?.char || "";
        const origColor = allData[i]?.color || "#fff";
        const allColors = [...RAVI_DATA, ...KUMAR_DATA].map(d => d.color);
        const iv = setInterval(() => {
          if (tick++ > 12) {
            clearInterval(iv);
            el.textContent = orig;
            el.style.color = origColor;
            el.style.textShadow = `0 0 20px ${origColor}, 0 0 40px ${origColor}66, 2px 2px 0 ${origColor}99, 4px 4px 0 ${origColor}55, 6px 6px 12px rgba(0,0,0,0.7)`;
            return;
          }
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          const flashColor = allColors[Math.floor(Math.random() * allColors.length)];
          el.style.color = flashColor;
          el.style.textShadow = `0 0 30px ${flashColor}`;
        }, 40);
      });
    };

    wrap.addEventListener("mouseenter", onEnter);
    return () => wrap.removeEventListener("mouseenter", onEnter);
  }, []);

  // ── TYPEWRITER ──
  useEffect(() => {
    const el = typeRef.current;
    if (!el) return;
    let wordIdx = 0, charIdx = 0, deleting = false;
    let timeout: ReturnType<typeof setTimeout>;
    let glitchTimeout: ReturnType<typeof setTimeout>;
    const glitch = () => {
      const orig = el.textContent || "";
      let g = 0;
      const gl = () => {
        if (g++ > 6) { el.textContent = orig; el.classList.remove("glitch-active"); return; }
        el.textContent = orig.split("").map(c => Math.random() > 0.7 ? CHARS[Math.floor(Math.random() * CHARS.length)] : c).join("");
        el.classList.add("glitch-active");
        glitchTimeout = setTimeout(gl, 50);
      };
      gl();
    };
    const type = () => {
      const word = WORDS[wordIdx];
      if (!deleting) {
        el.textContent = word.slice(0, ++charIdx);
        if (charIdx === word.length) { deleting = true; timeout = setTimeout(() => { glitch(); type(); }, 1800); return; }
        timeout = setTimeout(type, 80);
      } else {
        el.textContent = word.slice(0, --charIdx);
        if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % WORDS.length; timeout = setTimeout(type, 300); return; }
        timeout = setTimeout(type, 40);
      }
    };
    timeout = setTimeout(type, 1200);
    return () => { clearTimeout(timeout); clearTimeout(glitchTimeout); };
  }, []);

  // ── RIGHT SIDE SCROLL ──
  useEffect(() => {
    gsap.set(".landing-h2-1",    { y: 0, opacity: 1 });
    gsap.set(".landing-h2-2",    { y: "100%", opacity: 0 });
    gsap.set(".landing-h2-info", { y: "100%", opacity: 0 });
    gsap.set(".landing-h2-info-1",{ y: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-section",
        start: "20% top", end: "60% top",
        scrub: 1,
      },
    });
    tl.to(".landing-h2-1",     { y: "-120%", opacity: 0, duration: 1 }, 0)
      .to(".landing-h2-info-1",{ y: "-120%", opacity: 0, duration: 1 }, 0)
      .fromTo(".landing-h2-2",  { y: "120%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1 }, 0.1)
      .fromTo(".landing-h2-info",{ y: "120%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1 }, 0.1);
    return () => { tl.kill(); };
  }, []);

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-container">
        <div className="landing-intro">
          <h2 className="hello-text">Hello! I'm</h2>

          {/* ── 3D ARC NAME ── */}
          <div className="name-wrap" ref={nameRef}>
            {/* RAVI row */}
            <div className="name-row ravi-row">
              {RAVI_DATA.map((d, i) => (
                <span
                  key={i}
                  className="nl"
                  style={{
                    color: d.color,
                    textShadow: `0 0 20px ${d.glow}, 0 0 40px ${d.glow}, 2px 2px 0 ${d.color}99, 4px 4px 0 ${d.color}55, 6px 6px 14px rgba(0,0,0,0.7)`,
                    transform: `rotate(${d.rot}deg) translateY(${Math.abs(d.rot) * 2}px)`,
                    display: "inline-block",
                  }}
                >{d.char}</span>
              ))}
            </div>

            {/* KUMAR row */}
            <div className="name-row kumar-row">
              {KUMAR_DATA.map((d, i) => (
                <span
                  key={i}
                  className="nl"
                  style={{
                    color: d.color,
                    textShadow: `0 0 20px ${d.glow}, 0 0 40px ${d.glow}, 2px 2px 0 ${d.color}99, 4px 4px 0 ${d.color}55, 6px 6px 14px rgba(0,0,0,0.7)`,
                    transform: `rotate(${d.rot}deg) translateY(${-Math.abs(d.rot) * 2}px)`,
                    display: "inline-block",
                  }}
                >{d.char}</span>
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

        <div className="landing-info">
          <h3>An AI</h3>
          <div className="landing-info-clip">
            <div className="landing-h2-1 landing-word">AUTOMATION</div>
            <div className="landing-h2-2 landing-word purple">BUILDER</div>
          </div>
          <div className="landing-info-clip">
            <div className="landing-h2-info-1 landing-word purple">AUTOMATION</div>
            <div className="landing-h2-info landing-word">BUILDER</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Landing;
