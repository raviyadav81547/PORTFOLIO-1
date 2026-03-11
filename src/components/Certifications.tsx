import { useRef } from "react";
import "./styles/Certifications.css";

interface CertCard {
  name: string;
  issuer: string;
  year: string;
  badge: string;
  color: string;
  img?: string;
}

const certs: CertCard[] = [
  { name: "Google AI Essentials", issuer: "Google", year: "2024", badge: "G", color: "#4285F4", img: "/images/certs/cert_google.webp" },
  { name: "Microsoft Azure AI", issuer: "Microsoft", year: "2024", badge: "M", color: "#00a4ef" },
  { name: "Be10x AI Tools", issuer: "Be10x", year: "2024", badge: "B", color: "#f97316", img: "/images/certs/cert_be10x.webp" },
  { name: "Prompt Engineering", issuer: "DeepLearning.AI", year: "2024", badge: "DE", color: "#c481ff" },
  { name: "GenAI Fundamentals", issuer: "Google Cloud", year: "2024", badge: "GO", color: "#34A853", img: "/images/certs/cert_genai.webp" },
  { name: "AI Automation Pro", issuer: "Coursera", year: "2023", badge: "CO", color: "#0056d3", img: "/images/certs/cert_outskill.webp" },
];

const Certifications = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="certifications-section section-reveal" id="certifications">
      {/* Neural network background */}
      <canvas className="cert-neural-bg" aria-hidden="true" />

      <div className="section-label">VERIFIED SKILLS</div>
      <h2 className="split-heading cert-heading">
        Certifi<span className="cert-heading-accent">cations</span>
      </h2>
      <p className="cert-subtext">
        Industry-recognized credentials in AI, Cloud &amp; Automation
      </p>

      <div className="cert-grid">
        {certs.map((cert, i) => (
          <div
            key={i}
            className="cert-card"
            style={{ "--cert-color": cert.color } as React.CSSProperties}
          >
            {/* Neon spinning border */}
            <div className="cert-card-border" />

            <div className="cert-card-inner">
              {cert.img ? (
                <div className="cert-img-wrap">
                  <img src={cert.img} alt={cert.name} className="cert-img" loading="lazy" />
                </div>
              ) : (
                <div
                  className="cert-badge"
                  style={{ background: `${cert.color}22`, borderColor: `${cert.color}44` }}
                >
                  <span style={{ color: cert.color }}>{cert.badge}</span>
                </div>
              )}
              <div className="cert-info">
                <div className="cert-name">{cert.name}</div>
                <div className="cert-issuer">{cert.issuer}</div>
              </div>
              <div className="cert-footer">
                <div className="cert-verified">
                  <span className="cert-check">✓</span> Verified
                </div>
                <div className="cert-year">{cert.year}</div>
              </div>
              {/* Lens flare */}
              <div className="cert-lens-flare" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;
