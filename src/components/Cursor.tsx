import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef  = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── PARTICLE TRAIL ──
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; color: string;
    }

    const particles: Particle[] = [];
    let mx = -200, my = -200;
    let lastX = -200, lastY = -200;
    let _isMoving = false;
    let moveTimeout: ReturnType<typeof setTimeout>;

    const COLORS = ["#c481ff", "#9B59B6", "#FF69B4", "#4285F4", "#FFD700", "#39D353"];

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      _isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => { _isMoving = false; }, 100);

      // Spawn particles based on distance moved
      const dist = Math.hypot(mx - lastX, my - lastY);
      if (dist > 4) {
        const count = Math.min(Math.floor(dist / 4), 4);
        for (let i = 0; i < count; i++) {
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          particles.push({
            x: mx + (Math.random() - 0.5) * 8,
            y: my + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5,
            life: 1,
            maxLife: 0.6 + Math.random() * 0.6,
            size: 2 + Math.random() * 3,
            color,
          });
        }
        lastX = mx; lastY = my;
      }
    });

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.04; // slight gravity
        p.life -= 0.016 / p.maxLife;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const alpha = p.life * 0.85;
        const size  = p.size * p.life;

        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
        grad.addColorStop(0, p.color + Math.floor(alpha * 255).toString(16).padStart(2,"0"));
        grad.addColorStop(1, p.color + "00");

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2,"0");
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── MAIN CURSOR + TRAIL ──
  useEffect(() => {
    let hover = false;
    const cursor = cursorRef.current!;
    const trail  = trailRef.current!;
    const glow   = glowRef.current!;
    const mousePos = { x: 0, y: 0 };
    const trailPos = { x: 0, y: 0 };

    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      gsap.to(cursor, { x: e.clientX - 6, y: e.clientY - 6, duration: 0.05 });
      gsap.to(glow,   { x: e.clientX, y: e.clientY, duration: 0.55, ease: "power2.out" });
    });

    requestAnimationFrame(function loop() {
      if (!hover) {
        trailPos.x += (mousePos.x - trailPos.x) / 10;
        trailPos.y += (mousePos.y - trailPos.y) / 10;
        gsap.to(trail, { x: trailPos.x - 20, y: trailPos.y - 20, duration: 0.1 });
      }
      requestAnimationFrame(loop);
    });

    document.querySelectorAll("a, button, .work-box, .what-content, [data-cursor]").forEach((item) => {
      const el = item as HTMLElement;
      el.addEventListener("mouseover", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        if (el.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        } else if (el.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
          trail.classList.add("trail-disable");
        } else {
          cursor.classList.add("cursor-hover");
          trail.classList.add("trail-hover");
        }
      });
      el.addEventListener("mouseout", () => {
        cursor.classList.remove("cursor-disable", "cursor-icons", "cursor-hover");
        trail.classList.remove("trail-disable", "trail-hover");
        hover = false;
      });
    });
  }, []);

  return (
    <>
      <canvas className="cursor-blob-canvas" ref={canvasRef} />
      <div className="cursor-main"  ref={cursorRef}></div>
      <div className="cursor-trail" ref={trailRef}></div>
      <div className="cursor-glow"  ref={glowRef}></div>
    </>
  );
};

export default Cursor;
