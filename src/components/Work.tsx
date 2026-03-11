import { useRef, useEffect } from "react";
import gsap from "gsap";
import "./styles/Work.css";

interface Project {
  id: number;
  title: string;
  desc: string;
  tech: string[];
  img: string;
  link?: string;
}

const projects: Project[] = [
  { id: 1, title: "TapAutomate", desc: "AI automation platform — intelligent workflows at scale", tech: ["Python", "Flask", "GenAI"], img: "/images/project01.webp", link: "https://tapautomate.in" },
  { id: 2, title: "Image & Visual AI", desc: "AI-powered image generation and visual processing system", tech: ["Python", "OpenAI", "React"], img: "/images/project02.webp" },
  { id: 3, title: "Video Motion AI", desc: "Automated video content creation with AI motion graphics", tech: ["Python", "FFmpeg", "AI"], img: "/images/project03.webp" },
  { id: 4, title: "UGC Brand Automation", desc: "User-generated content automation pipeline for brands", tech: ["Node.js", "AI", "APIs"], img: "/images/project04.webp" },
  { id: 5, title: "Validation Engine", desc: "Intelligent data validation framework with ML scoring", tech: ["Python", "ML", "Flask"], img: "/images/project05.webp" },
  { id: 6, title: "AI Workflow Framework", desc: "Modular AI workflow orchestration and task automation", tech: ["Python", "GSAP", "GenAI"], img: "/images/project06.webp" },
];

const Work = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(".work-card");
    if (!cards) return;

    cards.forEach((card) => {
      const inner = card.querySelector<HTMLElement>(".work-card-inner");
      const spotlight = card.querySelector<HTMLElement>(".work-spotlight");
      if (!inner || !spotlight) return;

      const handleMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -8;
        const tiltY = (x - 0.5) * 8;

        gsap.to(inner, {
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 900,
        });

        spotlight.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(196,129,255,0.12) 0%, transparent 60%)`;
      };

      const handleLeave = () => {
        gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "back.out(1.5)" });
        spotlight.style.background = "transparent";
      };

      const handleEnter = () => {
        gsap.to(card, { y: -20, duration: 0.4, ease: "back.out(1.5)" });
      };
      const handleLeaveCard = () => {
        gsap.to(card, { y: 0, duration: 0.5, ease: "back.out(1.5)" });
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);
      card.addEventListener("mouseenter", handleEnter);
      card.addEventListener("mouseleave", handleLeaveCard);
    });
  }, []);

  return (
    <section ref={sectionRef} className="work-section section-reveal" id="work">
      <div className="section-label">SELECTED WORK</div>
      <h2 className="split-heading work-heading">My Work</h2>

      <div className="work-grid">
        {projects.map((project) => (
          <div key={project.id} className="work-card">
            <div className="work-card-inner">
              {/* Spotlight overlay */}
              <div className="work-spotlight" />

              <div className="work-img-wrap">
                <img
                  src={project.img}
                  alt={project.title}
                  className="work-img"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              <div className="work-card-body">
                <div className="work-card-title">{project.title}</div>
                <div className="work-card-desc">{project.desc}</div>
                <div className="work-card-tech">
                  {project.tech.map((t) => (
                    <span key={t} className="work-tech-tag">{t}</span>
                  ))}
                </div>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="work-card-link">
                    View Project ↗
                  </a>
                )}
              </div>

              {/* Google TV neon border */}
              <div className="work-card-border" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Work;
