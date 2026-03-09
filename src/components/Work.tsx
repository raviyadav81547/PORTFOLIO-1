import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const projects = [
  {
    name: "TapAutomate",
    cat: "AI Automation Platform",
    tools: "Flask, Python, GenAI, Cloud Deploy",
    image: "/images/project01.webp",
  },
  {
    name: "Image & Visual AI",
    cat: "Brand Creatives System",
    tools: "Generative AI, Prompt Workflows, Visual AI",
    image: "/images/project02.webp",
  },
  {
    name: "Video Motion AI",
    cat: "Content Scaling Engine",
    tools: "Video AI, Motion Automation, Scaling Pipelines",
    image: "/images/project03.webp",
  },
  {
    name: "UGC Brand Automation",
    cat: "Ad Scripting System",
    tools: "AI Scripting, Performance Creatives, Growth",
    image: "/images/project04.webp",
  },
  {
    name: "Validation Engine",
    cat: "Web System",
    tools: "Flask, Hash Logic, Validation, Python",
    image: "/images/project05.webp",
  },
  {
    name: "AI Workflow Framework",
    cat: "GenAI System",
    tools: "LLMs, Automation, n8n, Prompt Engineering",
    image: "/images/project06.webp",
  },
];

const Work = () => {
  useGSAP(() => {
    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: true,
        pin: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>
                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.cat}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
