import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import "./SceneEffects.css";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function createGlasses(): THREE.Group {
  const glasses = new THREE.Group();
  const S = 0.20;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.95, roughness: 0.05 });
  const lensMat  = new THREE.MeshPhysicalMaterial({ color: 0x000011, transparent: true, opacity: 0.92, roughness: 0, emissive: 0x001133, emissiveIntensity: 0.2 });
  const glowMat  = new THREE.MeshBasicMaterial({ color: 0xc481ff, transparent: true, opacity: 0.22 });
  const leftRim  = new THREE.Mesh(new THREE.TorusGeometry(S*0.70, S*0.07, 20, 80), frameMat);
  leftRim.position.set(-S*1.2, 0, 0); glasses.add(leftRim);
  const leftFill = new THREE.Mesh(new THREE.CircleGeometry(S*0.63, 60), lensMat);
  leftFill.position.set(-S*1.2, 0, 0.002); glasses.add(leftFill);
  const rightRim  = new THREE.Mesh(new THREE.TorusGeometry(S*0.70, S*0.07, 20, 80), frameMat);
  rightRim.position.set(S*1.2, 0, 0); glasses.add(rightRim);
  const rightFill = new THREE.Mesh(new THREE.CircleGeometry(S*0.63, 60), lensMat);
  rightFill.position.set(S*1.2, 0, 0.002); glasses.add(rightFill);
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, S*0.5, 12), frameMat);
  bridge.rotation.z = Math.PI/2; bridge.position.set(0, 0.01, 0.01); glasses.add(bridge);
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, S*2.1, 10), frameMat);
  leftArm.rotation.z = Math.PI/2; leftArm.position.set(-S*2.5, 0, -S*0.3); glasses.add(leftArm);
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, S*2.1,10), frameMat);
  rightArm.rotation.z = Math.PI/2; rightArm.position.set(S*2.5, 0, -S*0.3); glasses.add(rightArm);
  const leftGlow  = new THREE.Mesh(new THREE.TorusGeometry(S*0.73, S*0.04, 12, 80), glowMat);
  leftGlow.position.set(-S*1.2, 0, -0.003); glasses.add(leftGlow);
  const rightGlow = new THREE.Mesh(new THREE.TorusGeometry(S*0.73, S*0.04, 12, 80), glowMat);
  rightGlow.position.set(S*1.2, 0, -0.003); glasses.add(rightGlow);
  return glasses;
}

function spawnParticles(container: HTMLDivElement) {
  const COLORS = ["#c481ff","#00c8ff","#4fffb0","#ff6ef7","#00ffcc","#b44fff","#00aaff","#ffffff"];
  function spawn() {
    if (!document.body.contains(container)) return;
    const p = document.createElement("div");
    p.className = "sce-particle";
    const size  = 2 + Math.random() * 7;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const dur   = 2.5 + Math.random() * 3.5;
    p.style.cssText = `
      left:${8+Math.random()*84}%;
      bottom:${35+Math.random()*45}%;
      width:${size}px;height:${size}px;
      background:${color};
      box-shadow:0 0 ${size*2}px ${color},0 0 ${size*5}px ${color}44;
      animation-duration:${dur}s;
      animation-delay:${Math.random()*1.5}s;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), (dur + 2) * 1000);
  }
  const iv = setInterval(spawn, 160);
  return () => clearInterval(iv);
}

function startLightning(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const COLS = ["rgba(180,79,255,","rgba(0,200,255,","rgba(79,255,176,"];
  function resize() { canvas.width = canvas.offsetWidth || 500; canvas.height = canvas.offsetHeight || 700; }
  resize();
  function bolt(x1:number,y1:number,x2:number,y2:number,d:number,col:string) {
    if(d<=0) return;
    const mx=(x1+x2)/2+(Math.random()-.5)*60/d;
    const my=(y1+y2)/2+(Math.random()-.5)*60/d;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2);
    ctx.strokeStyle=col+(0.1+Math.random()*0.3)+")";
    ctx.lineWidth=d*0.35; ctx.shadowColor=col+"0.8)"; ctx.shadowBlur=12; ctx.stroke();
    if(Math.random()<0.4) bolt(mx,my,mx+(Math.random()-.5)*80,my-Math.random()*100,d-1,col);
  }
  function flash() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const W=canvas.width,H=canvas.height;
    const col=COLS[Math.floor(Math.random()*COLS.length)];
    bolt(W*0.15+Math.random()*W*0.7,0,W/2+(Math.random()-.5)*150,H*0.6,4,col);
    setTimeout(()=>ctx.clearRect(0,0,canvas.width,canvas.height),150);
  }
  const iv = setInterval(()=>{ if(Math.random()<0.4) flash(); },1800);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  return () => { clearInterval(iv); ro.disconnect(); };
}

function startHexGrid(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  function hexPath(cx:number,cy:number,r:number){
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=Math.PI/180*(60*i-30);
      i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
    } ctx.closePath();
  }
  function draw(){
    canvas.width=canvas.offsetWidth||500; canvas.height=canvas.offsetHeight||700;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const r=40,W=canvas.width,H=canvas.height;
    const cols=Math.ceil(W/(r*1.732))+2,rows=Math.ceil(H/(r*1.5))+2;
    for(let row=-1;row<rows;row++){
      for(let col=-1;col<cols;col++){
        const cx=col*r*1.732+(row%2===0?0:r*0.866),cy=row*r*1.5;
        const dx=(cx-W/2)/W,dy=(cy-H/2)/H;
        const alpha=Math.max(0,0.06-(Math.sqrt(dx*dx+dy*dy)*0.16));
        if(alpha<=0) continue;
        hexPath(cx,cy,r*0.86);
        ctx.strokeStyle=`rgba(196,129,255,${alpha})`; ctx.lineWidth=0.7; ctx.stroke();
      }
    }
  }
  draw();
  const ro = new ResizeObserver(draw); ro.observe(canvas);
  return () => ro.disconnect();
}

const Scene = () => {
  const canvasDiv    = useRef<HTMLDivElement | null>(null);
  const hoverDivRef  = useRef<HTMLDivElement>(null);
  const particleRef  = useRef<HTMLDivElement>(null);
  const lightRef     = useRef<HTMLCanvasElement>(null);
  const hexRef       = useRef<HTMLCanvasElement>(null);
  const sceneRef     = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    const cleanups: (()=>void)[] = [];
    if (particleRef.current) cleanups.push(spawnParticles(particleRef.current));
    if (lightRef.current)    cleanups.push(startLightning(lightRef.current));
    if (hexRef.current)      cleanups.push(startHexGrid(hexRef.current));
    return () => cleanups.forEach(c=>c());
  }, []);

  useEffect(() => {
    if (!canvasDiv.current) return;
    const rect   = canvasDiv.current.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    const scene  = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone:     THREE.Object3D | null = null;
    let mixer:        THREE.AnimationMixer | null = null;
    let glasses:      THREE.Group | null = null;
    let glassesFloatT = 0;
    let glassesLanded = false;
    let dropY = 5.5;
    const landY = 0.10;
    let spinZ = 0;

    const { loadCharacter } = setCharacter(renderer, scene, camera);
    const light    = setLighting(scene);
    const progress = setProgress(setLoading);

    const fallbackTimer = setTimeout(() => { progress.loaded().then(() => {}); }, 8000);

    loadCharacter().then((gltf) => {
      clearTimeout(fallbackTimer);
      if (!gltf) { progress.loaded().then(() => {}); return; }

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;
      const char = gltf.scene;
      scene.add(char);

      headBone = char.getObjectByName("spine006")
        || char.getObjectByName("Head")
        || char.getObjectByName("head")
        || null;

      if (headBone) {
        glasses = createGlasses();
        glasses.position.set(0, dropY, 0.18);
        glasses.rotation.x = Math.PI * 0.5;
        headBone.add(glasses);
      }

      progress.loaded().then(() => {
        setTimeout(() => {
          light.turnOnLights();
          animations.startIntro();
          document.querySelector(".sce-overlays")?.classList.add("sce-overlays--on");
        }, 2500);
      });

      window.addEventListener("resize", () => handleResize(renderer, camera, canvasDiv, char));
    });

    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e, (x, y) => (mouse = { x, y }));
    let debounce: number | undefined;
    const onTouchStart = (e: TouchEvent) => {
      const el = e.target as HTMLElement;
      debounce = setTimeout(() => {
        el?.addEventListener("touchmove", (ev: TouchEvent) => handleTouchMove(ev, (x, y) => (mouse = { x, y })));
      }, 200);
    };
    const onTouchEnd = () => handleTouchEnd((x, y, ix, iy) => { mouse = { x, y }; interpolation = { x: ix, y: iy }; });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (headBone) handleHeadRotation(headBone, mouse.x, mouse.y, interpolation.x, interpolation.y, lerp);
      if (glasses) {
        if (!glassesLanded) {
          dropY += (landY - dropY) * 0.045;
          spinZ  += 0.14;
          glasses.position.y = dropY;
          glasses.rotation.z = spinZ;
          glasses.rotation.x = Math.PI * 0.5 + Math.sin(spinZ * 1.5) * 0.06;
          if (Math.abs(dropY - landY) < 0.004) {
            glassesLanded = true;
            glasses.position.y = landY;
            glasses.rotation.z = 0;
            glasses.rotation.x = Math.PI * 0.5;
          }
        } else {
          glassesFloatT += delta;
          glasses.position.y = landY + Math.sin(glassesFloatT * 1.2) * 0.005;
          glasses.position.x = Math.sin(glassesFloatT * 0.7) * 0.003;
          glasses.rotation.z = Math.sin(glassesFloatT * 0.9) * 0.012;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const landingDiv = document.getElementById("landingDiv");
    document.addEventListener("mousemove", onMouseMove);
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      clearTimeout(debounce);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="character-model">
      {/* ── HEX GRID — farthest back ── */}
      <canvas ref={hexRef} className="sce-hex-canvas" aria-hidden="true" />

      {/* ── ALL OVERLAY EFFECTS ── */}
      <div className="sce-overlays" aria-hidden="true">
        {/* Neon orbit rings */}
        <div className="sce-orbit sce-o1"><div className="sce-odot"/></div>
        <div className="sce-orbit sce-o2"><div className="sce-odot"/></div>
        <div className="sce-orbit sce-o3"><div className="sce-odot"/></div>

        {/* Back glow blob behind character */}
        <div className="sce-backglow"/>

        {/* Ground glow */}
        <div className="sce-groundglow"/>

        {/* Neon border ring */}
        <div className="sce-borderring"/>

        {/* Floating particles */}
        <div ref={particleRef} className="sce-ptcls"/>

        {/* Lightning canvas */}
        <canvas ref={lightRef} className="sce-lightning" aria-hidden="true"/>

        {/* Scan line sweep */}
        <div className="sce-scanline"/>
      </div>

      {/* ── EXISTING character-rim glow ── */}
      <div className="character-rim"/>

      {/* ── THREE.JS canvas ── */}
      <div ref={canvasDiv} style={{ width:"100%", height:"100%", position:"relative", zIndex:5 }}/>

      <div ref={hoverDivRef} className="character-hover"/>
    </div>
  );
};

export default Scene;
