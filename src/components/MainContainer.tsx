import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./About";
import Career from "./Career";
import Certifications from "./Certifications";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";

gsap.registerPlugin(ScrollTrigger);

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [isDesktopView]);

  // Scroll progress bar
  useEffect(() => {
    const bar = document.createElement("div");
    bar.className = "scroll-indicator";
    bar.style.width = "0%";
    document.body.appendChild(bar);
    const onScroll = () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); bar.remove(); };
  }, []);

  // Section reveals
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).classList.add("in-view");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-up, .section-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 3D card tilt
  useEffect(() => {
    const addTilt = () => {
      document.querySelectorAll<HTMLElement>(".work-box, .work-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        });
        card.addEventListener("mouseleave", () => { card.style.transform = ""; });
      });
    };
    const t = setTimeout(addTilt, 1000);
    return () => clearTimeout(t);
  }, []);

  // Tab title when inactive
  useEffect(() => {
    const original = document.title;
    const handler = () => {
      document.title = document.hidden
        ? "👋 Come back — Ravi's portfolio misses you"
        : original;
    };
    document.addEventListener("visibilitychange", handler);
    return () => { document.removeEventListener("visibilitychange", handler); document.title = original; };
  }, []);

  return (
    <div className="container-main">
      {/* Film grain overlay */}
      <div className="film-grain" aria-hidden="true" />

      <Cursor />
      <Navbar />
      <SocialIcons />

      {isDesktopView && children}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            {/* ✅ character passes through as children on mobile */}
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            <Certifications />
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
