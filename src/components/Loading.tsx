/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  if (percent >= 100) {
    setTimeout(() => {
      setLoaded(true);
      setTimeout(() => { setIsLoaded(true); }, 400);
    }, 200);
  }

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) module.initialFX();
          setIsLoading(false);
        }, 400);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, setIsLoading]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    target.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">Logo</a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, i) => <div className="loaderGame-line" key={i}></div>)}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> AI Automation Builder</span> <span>GenAI Developer</span>
            <span> Workflow Architect</span> <span>Problem Solver</span>
          </Marquee>
        </div>
        <div className={`loading-wrap ${clicked && "loading-clicked"}`} onMouseMove={handleMouseMove}>
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2"><span>Welcome</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;

  // 0→85% in ~1.5s smooth easing
  const totalMs = 1500;
  const steps = 85;
  const baseInterval = totalMs / steps;

  let step = 0;
  const interval = setInterval(() => {
    step++;
    // easeInOut curve — fast middle, slow start/end
    const t = step / steps;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    percent = Math.round(eased * 85);
    setLoading(percent);
    if (step >= steps) clearInterval(interval);
  }, baseInterval);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      let p = percent;
      const finish = setInterval(() => {
        p = Math.min(100, p + 2);
        setLoading(p);
        if (p >= 100) { resolve(p); clearInterval(finish); }
      }, 16);
    });
  }

  return { loaded, percent, clear };
};
