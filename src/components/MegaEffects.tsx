import { useEffect } from "react";
import "./styles/MegaEffects.css";

const MegaEffects = () => {

  // 1. MAGNETIC BUTTONS
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>("a, button, .cert-card, .work-box, .career-info-box").forEach((el) => {
        el.classList.add("magnetic");
        el.addEventListener("mousemove", (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.25;
          const y = (e.clientY - r.top - r.height / 2) * 0.25;
          el.style.transform = `translate(${x}px, ${y}px)`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "";
          el.style.transition = "transform 0.4s cubic-bezier(0.16,1,0.3,1)";
        });
      });
    };
    const t = setTimeout(apply, 800);
    return () => clearTimeout(t);
  }, []);

  // 2. AURORA BACKGROUND - DISABLED
  // useEffect(() => { ... }, []);

  // 3. NEON GLOW BORDERS on scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".career-info-box, .cert-card, .what-content");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add("neon-border-active");
        } else {
          (e.target as HTMLElement).classList.remove("neon-border-active");
        }
      });
    }, { threshold: 0.3 });
    const t = setTimeout(() => els.forEach((el) => io.observe(el)), 600);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);

  // 4. COUNTER ANIMATION
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = parseInt(el.dataset.count || "0");
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current) + (el.dataset.suffix || "");
          if (current >= target) clearInterval(timer);
        }, 16);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    const t = setTimeout(() => counters.forEach((c) => io.observe(c)), 600);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);

  // 5. MORPHING SHAPES - DISABLED
  // useEffect(() => { ... }, []);

  // 6. NOISE GRAIN OVERLAY
  useEffect(() => {
    const grain = document.createElement("div");
    grain.className = "grain-overlay";
    document.body.appendChild(grain);
    return () => grain.remove();
  }, []);

  // 7. 3D DEPTH PARALLAX LAYERS
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      document.querySelectorAll<HTMLElement>(".depth-1").forEach(el => {
        el.style.transform = `translateY(${y * 0.08}px)`;
      });
      document.querySelectorAll<HTMLElement>(".depth-2").forEach(el => {
        el.style.transform = `translateY(${y * -0.05}px)`;
      });
      document.querySelectorAll<HTMLElement>(".depth-3").forEach(el => {
        el.style.transform = `translateY(${y * 0.12}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 8. SPLIT SCREEN REVEAL
  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".split-reveal").forEach((el) => {
        const inner = el.innerHTML;
        el.innerHTML = `<div class="split-mask"><div class="split-inner">${inner}</div></div>`;
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("split-active");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      document.querySelectorAll(".split-reveal").forEach(el => io.observe(el));
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // 9. LIQUID METAL TEXT
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>(".landing-intro h1");
    if (!heading) return;
    heading.classList.add("liquid-metal");
  }, []);

  // 10. 3D GYROSCOPE TILT - enhanced on all cards
  useEffect(() => {
    const applyGyro = () => {
      document.querySelectorAll<HTMLElement>(".cert-card, .work-box, .career-info-box").forEach((card) => {
        card.classList.add("gyro-card");
        card.addEventListener("mousemove", (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          const rotX = y * -15;
          const rotY = x * 15;
          const glowX = 50 + x * 60;
          const glowY = 50 + y * 60;
          card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
          card.style.setProperty("--glow-x", `${glowX}%`);
          card.style.setProperty("--glow-y", `${glowY}%`);
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    };
    const t = setTimeout(applyGyro, 1000);
    return () => clearTimeout(t);
  }, []);

  return null;
};

export default MegaEffects;
