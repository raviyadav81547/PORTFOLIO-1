import { useEffect, useRef } from "react";
import "./styles/Certifications.css";

const certs = [
  {
    id: "google",
    name: "Google AI Essentials",
    issuer: "Google",
    year: "2024",
    image: "/images/certs/cert_google.webp",
    color: "#4285F4",
  },
  {
    id: "genai",
    name: "Gen AI Developer",
    issuer: "IBM × Microsoft",
    year: "2025",
    image: "/images/certs/cert_genai.webp",
    color: "#c481ff",
  },
  {
    id: "outskill",
    name: "Generative AI Mastermind",
    issuer: "Outskill",
    year: "2025",
    image: "/images/certs/cert_outskill.webp",
    color: "#39D353",
  },
  {
    id: "be10x",
    name: "AI Tools Workshop",
    issuer: "Be10x",
    year: "2025",
    image: "/images/certs/cert_be10x.webp",
    color: "#FF8C00",
  },
  {
    id: "semrush",
    name: "AI-Powered Marketer",
    issuer: "Semrush Academy",
    year: "2025",
    image: "/images/certs/cert_semrush.webp",
    color: "#FF6B35",
  },
  {
    id: "apple",
    name: "Accredited Creator",
    issuer: "Apple Creator Studio",
    year: "2025",
    image: "/images/certs/cert_apple.webp",
    color: "#E8E8E8",
  },
];

const Certifications = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = trackRef.current?.querySelectorAll<HTMLElement>(".cert-card");
    if (!cards) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("cert-visible");
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="cert-section section-container" id="certifications">
      <h3 className="cert-heading">Certifications</h3>
      <p className="cert-sub">Verified credentials & achievements</p>

      <div className="cert-grid" ref={trackRef}>
        {certs.map((c, i) => (
          <div
            key={c.id}
            className="cert-card"
            style={{
              "--cert-color": c.color,
              "--delay": `${i * 0.1}s`,
            } as React.CSSProperties}
          >
            <div className="cert-img-wrap">
              <img src={c.image} alt={c.name} loading="lazy" />
              <div className="cert-img-overlay" />
            </div>
            <div className="cert-info">
              <span className="cert-issuer">{c.issuer}</span>
              <h4 className="cert-name">{c.name}</h4>
              <span className="cert-year">{c.year}</span>
            </div>
            <div className="cert-glow" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
