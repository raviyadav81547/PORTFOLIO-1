import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Navbar.css";

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function scramble(el: HTMLElement, finalText: string) {
  let frame = 0;
  const totalFrames = 18;
  const tick = () => {
    el.textContent = finalText
      .split("")
      .map((char, i) => {
        if (frame >= Math.floor((i / finalText.length) * totalFrames * 0.65)) return char;
        return char === "." ? "." : CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(tick);
    else el.textContent = finalText;
  };
  requestAnimationFrame(tick);
}

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const scroller = document.querySelector(".smooth-wrapper") as HTMLElement;
    if (!scroller || !navRef.current) return;

    const handleScroll = () => {
      const scrolled = scroller.scrollTop > 60;
      if (scrolled !== hasScrolled.current) {
        hasScrolled.current = scrolled;
        if (navRef.current) {
          navRef.current.classList.toggle("navbar-scrolled", scrolled);
        }
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoHover = () => {
    if (logoRef.current) scramble(logoRef.current, "RAVI.");
  };

  const scrollTo = (id: string) => {
    const scroller = document.querySelector(".smooth-wrapper") as HTMLElement;
    const target = document.getElementById(id);
    if (scroller && target) {
      scroller.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <nav ref={navRef} className="navbar">
      <a href="/" className="navbar-logo" onMouseEnter={handleLogoHover} aria-label="Home">
        <span ref={logoRef}>RAVI.</span>
      </a>

      <div className="navbar-email">
        <a href="mailto:collabxravi@gmail.com">collabxravi@gmail.com</a>
      </div>

      <div className="navbar-links">
        {["about", "work", "certifications", "contact"].map((id) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="navbar-link"
          >
            {id.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
