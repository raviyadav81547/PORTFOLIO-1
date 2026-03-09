import { useEffect } from "react";
import "./styles/AppleScene.css";

const AppleScene = () => {
  useEffect(() => {
    const wrap = document.createElement("div");
    wrap.className = "apple-scene-wrap";
    wrap.innerHTML = `
      <div class="apple-glow-burst" id="appleGlowBurst"></div>
      <div class="apple-neon-ring" id="appleNeonRing"></div>
      <div class="apple-logo-svg" id="appleLogoEl">
        <svg viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.2c-52.2-77.2-96.3-196.7-96.3-311.4 0-218.7 143.4-334.3 284.1-334.3 73 0 133.8 48.3 179.3 48.3 44 0 112.7-51.4 195.5-51.4 31.2 0 108.2 2.6 168.2 81.9zm-224.3-76.9c-33.8-41.7-81.8-67.9-131.5-67.9-5.8 0-11.6.6-17.4 1.3 1.9-17.4 9.7-34.2 20.3-49.4 36.5-50.1 99.4-84.5 157.5-84.5 3.2 0 6.5.3 9.7.6-1.9 19.4-9.7 37.5-21 53.5-29.7 41.7-73.1 67.3-117.6 146.4z"/>
        </svg>
      </div>
    `;

    const logo = wrap.querySelector("#appleLogoEl") as HTMLElement;
    const glow = wrap.querySelector("#appleGlowBurst") as HTMLElement;
    const ring = wrap.querySelector("#appleNeonRing") as HTMLElement;

    logo.style.opacity = "0";
    logo.style.transform = "translate(-50%, -250%) scale(8) rotate(-720deg)";
    logo.style.filter = "blur(12px) brightness(4)";
    glow.style.opacity = "0";
    ring.style.opacity = "0";

    let injected = false;
    let logoAnimated = false;

    const tryInject = () => {
      const charModel = document.querySelector(".character-model") as HTMLElement;
      if (!charModel) { setTimeout(tryInject, 600); return; }
      if (injected) return;
      injected = true;
      charModel.style.position = "relative";
      charModel.appendChild(wrap);

      const onScroll = () => {
        const aboutEl = document.querySelector(".about-section") as HTMLElement;
        if (!aboutEl) return;

        const rect = aboutEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const centerY = rect.top + rect.height / 2;
        const triggerStart = vh * 0.55;
        const triggerEnd = -rect.height * 0.3;
        const raw = (triggerStart - centerY) / (triggerStart - triggerEnd);
        const progress = Math.max(0, Math.min(1, raw));

        const logoProgress = Math.max(0, Math.min(1, (progress - 0.45) / 0.45));

        if (logoProgress <= 0) {
          logo.style.opacity = "0";
          logo.style.transform = "translate(-50%, -250%) scale(8) rotate(-720deg)";
          logo.style.filter = "blur(12px) brightness(4)";
          glow.style.opacity = "0";
          ring.style.opacity = "0";
          ring.classList.remove("ring-blast");
          logo.classList.remove("logo-stuck");
          logoAnimated = false;
        } else if (logoProgress < 1) {
          const t = logoProgress;
          const yOffset = -250 * (1 - t) * (1 - t);
          const xSwing = Math.sin(t * Math.PI * 3) * 40 * (1 - t);
          const scale = 8 - t * 7;
          const rotate = -720 * (1 - t) * (1 - t);
          const blur = (1 - t) * 10;
          const brightness = 4 - t * 3;

          logo.style.opacity = String(Math.min(1, t * 3));
          logo.style.transform = `translate(calc(-50% + ${xSwing}px), calc(-50% + ${yOffset}%)) scale(${scale}) rotate(${rotate}deg)`;
          logo.style.filter = `blur(${blur}px) brightness(${brightness})`;
          glow.style.opacity = String(t * 0.5);
          ring.style.opacity = "0";
        } else {
          logo.style.opacity = "1";
          logo.style.transform = "translate(-50%, -50%) scale(1)";
          logo.style.filter = "blur(0px) brightness(1)";
          glow.style.opacity = "0.3";

          if (!logoAnimated) {
            logoAnimated = true;
            logo.classList.add("logo-stuck");
            ring.style.opacity = "1";
            ring.classList.add("ring-blast");
            setTimeout(() => { ring.style.opacity = "0"; }, 900);
          }
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    };

    setTimeout(tryInject, 2000);
    return () => { wrap.remove(); };
  }, []);

  return null;
};

export default AppleScene;
