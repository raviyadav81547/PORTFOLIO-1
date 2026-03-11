import { useRef, useEffect } from "react";
import "./styles/Contact.css";

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.";

function scrambleText(el: HTMLElement, finalText: string) {
  let frame = 0;
  const totalFrames = 24;
  const tick = () => {
    el.textContent = finalText
      .split("")
      .map((char, i) => {
        if (frame >= Math.floor((i / finalText.length) * totalFrames * 0.7)) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(tick);
    else el.textContent = finalText;
  };
  requestAnimationFrame(tick);
}

const socials = [
  { label: "WhatsApp",  icon: "💬", href: "https://wa.me/917497817064", color: "#25D366" },
  { label: "Instagram", icon: "📸", href: "https://instagram.com/ravikumar", color: "#e1306c" },
  { label: "LinkedIn",  icon: "💼", href: "https://linkedin.com/in/raviyadav81547", color: "#0077b5" },
  { label: "GitHub",    icon: "🐙", href: "https://github.com/raviyadav81547", color: "#c481ff" },
  { label: "YouTube",   icon: "🎬", href: "https://youtube.com/@ravikumar", color: "#ff0000" },
  { label: "Telegram",  icon: "✈️", href: "https://t.me/ravikumar", color: "#29b6f6" },
  { label: "Website",   icon: "🌐", href: "https://tapautomate.in", color: "#4fffb0" },
  { label: "Facebook",  icon: "👤", href: "https://facebook.com/ravikumar", color: "#1877f2" },
];

const Contact = () => {
  const emailRef = useRef<HTMLAnchorElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = emailRef.current;
    if (!el) return;
    const email = "collabxravi@gmail.com";
    const handleEnter = () => scrambleText(el, email);
    el.addEventListener("mouseenter", handleEnter);
    return () => el.removeEventListener("mouseenter", handleEnter);
  }, []);

  return (
    <section ref={sectionRef} className="contact-section section-reveal" id="contact">
      {/* Aurora borealis background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
        <div className="aurora-blob aurora-4" />
      </div>

      {/* Constellation dots */}
      <canvas className="contact-constellation" aria-hidden="true" />

      <div className="contact-inner">
        <div className="section-label">GET IN TOUCH</div>
        <h2 className="contact-heading split-heading">
          <span className="ch-word">Let's</span>
          <span className="ch-word ch-connect">Connect</span>
        </h2>

        <a
          ref={emailRef}
          href="mailto:collabxravi@gmail.com"
          className="contact-email"
        >
          collabxravi@gmail.com
        </a>

        {/* Social bubbles */}
        <div className="social-bubbles">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-bubble"
              style={{
                "--bubble-color": s.color,
                animationDelay: `${i * 0.4}s`,
              } as React.CSSProperties}
              aria-label={s.label}
            >
              <div
                className="bubble-sphere"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${s.color}33, ${s.color}11 60%, transparent 100%)`,
                  boxShadow: `0 0 20px ${s.color}44, inset 0 0 20px ${s.color}11`,
                  borderColor: `${s.color}33`,
                }}
              >
                <span className="bubble-icon">{s.icon}</span>
                <div
                  className="bubble-glint"
                  style={{ background: `radial-gradient(circle at 30% 25%, ${s.color}88, transparent 60%)` }}
                />
              </div>
              <span className="bubble-label">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
