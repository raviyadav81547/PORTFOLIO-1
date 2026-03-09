import { MdArrowOutward, MdCopyright, MdSend, MdCheckCircle, MdError } from "react-icons/md";
import {
  FaInstagram, FaLinkedinIn, FaTelegramPlane,
  FaYoutube, FaGithub, FaGlobe
} from "react-icons/fa";
import "./styles/Contact.css";
import { useState, useRef, useEffect } from "react";

type Status = "idle" | "sending" | "sent" | "error";

// ── 6 SOCIAL BUBBLES ──
const SOCIALS = [
  { icon: FaInstagram,     label: "Instagram", href: "https://instagram.com/",              color: "#E1306C", glow: "#E1306C" },
  { icon: FaLinkedinIn,    label: "LinkedIn",  href: "https://linkedin.com/in/ravi-kumar",  color: "#0A66C2", glow: "#0A66C2" },
  { icon: FaTelegramPlane, label: "Telegram",  href: "https://t.me/",                       color: "#229ED9", glow: "#229ED9" },
  { icon: FaYoutube,       label: "YouTube",   href: "https://youtube.com/",                color: "#FF0000", glow: "#FF0000" },
  { icon: FaGithub,        label: "GitHub",    href: "https://github.com/raviyadav81547",   color: "#c481ff", glow: "#c481ff" },
  { icon: FaGlobe,         label: "Website",   href: "https://tapautomate.in",              color: "#39D353", glow: "#39D353" },
];

// ── FLOATING BUBBLE COMPONENT ──
const SocialBubble = ({
  social, index, isVisible
}: {
  social: typeof SOCIALS[0];
  index: number;
  isVisible: boolean;
}) => {
  const delays = [0, 0.15, 0.3, 0.45, 0.6, 0.75];
  const Icon = social.icon;

  // Different float patterns per bubble
  const floatDuration = [3.2, 2.8, 3.6, 3.0, 2.6, 3.4][index];
  const floatDelay    = [0, 0.5, 1.0, 0.3, 0.8, 0.2][index];

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="disable"
      className="social-bubble"
      style={{
        "--bubble-color":    social.color,
        "--bubble-glow":     social.glow,
        "--float-duration":  `${floatDuration}s`,
        "--float-delay":     `${floatDelay}s`,
        "--entry-delay":     `${delays[index]}s`,
        opacity:             isVisible ? 1 : 0,
        transform:           isVisible ? "translateY(0) scale(1)" : "translateY(60px) scale(0.4)",
        transition:          `opacity 0.6s ease ${delays[index]}s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delays[index]}s`,
      } as React.CSSProperties}
    >
      <div className="bubble-sphere">
        <div className="bubble-shine" />
        <div className="bubble-icon">
          <Icon />
        </div>
        <div className="bubble-ring" />
      </div>
      <span className="bubble-label">{social.label}</span>
    </a>
  );
};

const Contact = () => {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [status, setStatus]   = useState<Status>("idle");
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer — trigger bubble entry
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "YOUR_WEB3FORMS_KEY",
          name:    form.name,
          email:   form.email,
          message: form.message,
          subject: `Portfolio Contact from ${form.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else throw new Error();
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="contact-section section-container" id="contact" ref={sectionRef}>
      <div className="contact-container">
        <h3>Contact</h3>

        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p><a href="mailto:collabxravi@gmail.com" data-cursor="disable">collabxravi@gmail.com</a></p>
            <h4>Phone</h4>
            <p><a href="tel:+917497817064" data-cursor="disable">+91 74978 17064</a></p>
          </div>
          <div className="contact-box">
            <h4>Links</h4>
            <a href="https://github.com/raviyadav81547" target="_blank" data-cursor="disable" className="contact-social">Github <MdArrowOutward /></a>
            <a href="https://www.linkedin.com/in/ravi-kumar" target="_blank" data-cursor="disable" className="contact-social">Linkedin <MdArrowOutward /></a>
            <a href="https://www.tapautomate.in" target="_blank" data-cursor="disable" className="contact-social">tapautomate.in <MdArrowOutward /></a>
          </div>
          <div className="contact-box">
            <h2>Designed and Developed <br /> by <span>Ravi Kumar</span></h2>
            <h5><MdCopyright /> 2025</h5>
          </div>
        </div>

        {/* ── 3D FLOATING SOCIAL BUBBLES ── */}
        <div className="social-bubbles-section">
          <p className="bubbles-hint">Find me on</p>
          <div className="social-bubbles-wrap">
            {SOCIALS.map((s, i) => (
              <SocialBubble key={s.label} social={s} index={i} isVisible={visible} />
            ))}
          </div>
        </div>

        {/* ── CONTACT FORM ── */}
        <div className="contact-form-wrap">
          <div className="contact-form-header">
            <h4>Send a Message</h4>
            <p>Reply within 24 hours ⚡</p>
          </div>
          <div className="contact-form">
            <div className="form-row">
              <div className="form-field">
                <label>Name</label>
                <input type="text" name="name" placeholder="Your name"
                  value={form.name} onChange={handleChange}
                  disabled={status === "sending" || status === "sent"} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" name="email" placeholder="your@email.com"
                  value={form.email} onChange={handleChange}
                  disabled={status === "sending" || status === "sent"} />
              </div>
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea name="message" placeholder="Tell me about your project..."
                rows={4} value={form.message} onChange={handleChange}
                disabled={status === "sending" || status === "sent"} />
            </div>
            <button className={`form-submit ${status}`} onClick={handleSubmit}
              disabled={status === "sending" || status === "sent"} data-cursor="disable">
              {status === "idle"    && <><MdSend /> Send Message</>}
              {status === "sending" && <><span className="form-spinner" /> Sending...</>}
              {status === "sent"    && <><MdCheckCircle /> Message Sent! 🎉</>}
              {status === "error"   && <><MdError /> Failed — Try Again</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
