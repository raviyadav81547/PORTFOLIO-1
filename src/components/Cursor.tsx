import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Cursor.css";

const Cursor = () => {
  const cursorsRef = useRef<HTMLDivElement[]>([]);
  const trailRef = useRef<HTMLDivElement[]>([]);
  const rippleContainerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorPositions = useRef(Array(6).fill({ x: -100, y: -100 }));
  const trailPositions = useRef(Array(8).fill({ x: -100, y: -100 }));
  const animFrameRef = useRef<number>(0);
  const viewTextRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lags = [0.12, 0.18, 0.24, 0.30, 0.36, 0.45];

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!rippleContainerRef.current) return;
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement("div");
        ring.className = "cursor-ripple-ring";
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
        ring.style.animationDelay = `${i * 0.08}s`;
        rippleContainerRef.current.appendChild(ring);
        setTimeout(() => ring.remove(), 600);
      }
    };

    // Hover state: text
    const onTextEnter = () => {
      cursorsRef.current[0]?.classList.add("cursor-text");
    };
    const onTextLeave = () => {
      cursorsRef.current[0]?.classList.remove("cursor-text");
    };

    // Hover state: button/link
    const onLinkEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      cursorsRef.current[0]?.classList.add("cursor-link");
      if (arrowRef.current) arrowRef.current.style.opacity = "1";
      gsap.to(el, { x: 3, y: 3, duration: 0.2, ease: "power2.out" });
    };
    const onLinkLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      cursorsRef.current[0]?.classList.remove("cursor-link");
      if (arrowRef.current) arrowRef.current.style.opacity = "0";
      gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "elastic.out(1,0.5)" });
    };

    // Hover state: card/image
    const onCardEnter = () => {
      cursorsRef.current[0]?.classList.add("cursor-card");
      if (viewTextRef.current) viewTextRef.current.style.opacity = "1";
    };
    const onCardLeave = () => {
      cursorsRef.current[0]?.classList.remove("cursor-card");
      if (viewTextRef.current) viewTextRef.current.style.opacity = "0";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);

    // Attach to text elements
    document.querySelectorAll("p, h1, h2, h3, h4, span, label").forEach((el) => {
      el.addEventListener("mouseenter", onTextEnter);
      el.addEventListener("mouseleave", onTextLeave);
    });

    // Attach to links/buttons
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      el.addEventListener("mouseenter", onLinkEnter);
      el.addEventListener("mouseleave", onLinkLeave);
    });

    // Attach to cards
    document.querySelectorAll(".work-card, .cert-card, [class*='card']").forEach((el) => {
      el.addEventListener("mouseenter", onCardEnter);
      el.addEventListener("mouseleave", onCardLeave);
    });

    // Animate loop
    const animate = () => {
      // Update 6 cursor layers with different lags
      cursorPositions.current = cursorPositions.current.map((pos, i) => {
        const lag = lags[i];
        return {
          x: pos.x + (mousePos.current.x - pos.x) * lag,
          y: pos.y + (mousePos.current.y - pos.y) * lag,
        };
      });

      cursorsRef.current.forEach((cursor, i) => {
        if (cursor) {
          cursor.style.left = `${cursorPositions.current[i].x}px`;
          cursor.style.top = `${cursorPositions.current[i].y}px`;
        }
      });

      // Update trail
      trailPositions.current = trailPositions.current.map((pos, i) => {
        const source = i === 0 ? mousePos.current : trailPositions.current[i - 1];
        return {
          x: pos.x + (source.x - pos.x) * 0.25,
          y: pos.y + (source.y - pos.y) * 0.25,
        };
      });

      trailRef.current.forEach((dot, i) => {
        if (dot) {
          dot.style.left = `${trailPositions.current[i].x}px`;
          dot.style.top = `${trailPositions.current[i].y}px`;
          dot.style.opacity = String(((8 - i) / 8) * 0.35);
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* 6 cursor layers */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) cursorsRef.current[i] = el; }}
          className={`cursor-layer cursor-layer-${i}`}
          style={{ zIndex: 10000 - i }}
        >
          {i === 0 && (
            <>
              <div ref={viewTextRef} className="cursor-view-text">VIEW</div>
              <div ref={arrowRef} className="cursor-arrow">→</div>
            </>
          )}
        </div>
      ))}
      {/* Trail dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => { if (el) trailRef.current[i] = el; }}
          className="cursor-trail-dot"
          style={{ zIndex: 9990 - i }}
        />
      ))}
      {/* Ripple container */}
      <div ref={rippleContainerRef} className="cursor-ripple-container" />
    </>
  );
};

export default Cursor;
