/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  // ✅ FIX: moved out of render — only fire once when percent hits 100
  useEffect(() => {
    if (percent < 100 || doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    const t = setTimeout(() => {
      import("./utils/initialFX").then((m) => {
        if (m.initialFX) m.initialFX();
        setIsLoading(false);
      });
    }, 650);
    return () => clearTimeout(t);
  }, [percent, setIsLoading]);

  const pct = Math.min(percent, 100);

  return (
    <div className={`rv-loader${exiting ? " rv-loader--exit" : ""}`}>
      {/* Top bar */}
      <div className="rv-loader__topbar" />

      {/* Center capsule */}
      <div className="rv-loader__center">
        <div className="rv-loader__name">
          <span className="rv-ln-ravi">RAVI</span>
          <span className="rv-ln-dot"> · </span>
          <span className="rv-ln-kumar">KUMAR</span>
        </div>
        <div className="rv-loader__sub">AI · AUTOMATION · GENAI</div>

        <div className="rv-loader__track">
          <div
            className="rv-loader__fill"
            style={{ width: `${pct}%` }}
          />
          <div
            className="rv-loader__glow"
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="rv-loader__pct">{pct}%</div>
      </div>

      {/* Ambient orbs */}
      <div className="rv-loader__orb rv-orb1" />
      <div className="rv-loader__orb rv-orb2" />
    </div>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;

  // 0→85% in ~1.8s buttery smooth easing
  const totalMs = 1800;
  const steps = 120;
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
