import { useEffect, useRef } from "react";
import * as THREE from "three";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import { setProgress } from "../Loading";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import { setCharTimeline, setAllTimeline } from "../utils/GsapScroll";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ════════════════════════════════════════════════════════
//  GLASSES — purple neon, 360 spin drop
// ════════════════════════════════════════════════════════
function createGlasses(): THREE.Group {
  const g = new THREE.Group();
  const S = 0.19;
  const frame = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.95, roughness: 0.05 });
  const lens  = new THREE.MeshPhysicalMaterial({ color: 0x000820, transparent: true, opacity: 0.88, roughness: 0, emissive: 0x001133, emissiveIntensity: 0.4 });
  const glow  = new THREE.MeshBasicMaterial({ color: 0xc481ff, transparent: true, opacity: 0.28 });

  const addLens = (x: number) => {
    g.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(S*.70,S*.07,20,80), frame), { position: new THREE.Vector3(x,0,0) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.CircleGeometry(S*.63,60), lens), { position: new THREE.Vector3(x,0,.002) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(S*.74,S*.04,12,80), glow), { position: new THREE.Vector3(x,0,-.003) }));
  };
  addLens(-S*1.2); addLens(S*1.2);

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,S*.5,12), frame);
  bridge.rotation.z = Math.PI/2; bridge.position.set(0,.01,.01); g.add(bridge);

  [-S*2.5, S*2.5].forEach(x => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.006,.004,S*2.1,10), frame);
    arm.rotation.z = Math.PI/2; arm.position.set(x, 0, -S*.3); g.add(arm);
  });
  return g;
}

// ════════════════════════════════════════════════════════
//  FULL CHARACTER — prompt-based Three.js build
// ════════════════════════════════════════════════════════
function buildCharacter(scene: THREE.Scene): {
  root: THREE.Group;
  headGroup: THREE.Group;
  screenlight: THREE.Mesh;
  neckBone: THREE.Group;
  particleGroup: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = "character";

  // ── MATERIALS ──
  const skin     = new THREE.MeshStandardMaterial({ color: 0xc27a45, roughness: 0.5, metalness: 0.0 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0x9e5e2e, roughness: 0.6 });
  const armor    = new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.25, metalness: 0.92, envMapIntensity: 2 });
  const armorEdge= new THREE.MeshStandardMaterial({ color: 0x22222e, roughness: 0.18, metalness: 0.96 });
  const hexM     = new THREE.MeshStandardMaterial({ color: 0x1e2230, roughness: 0.35, metalness: 0.85, emissive: 0x050810, emissiveIntensity: 0.5 });
  const cyan     = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ccff, emissiveIntensity: 3.0, roughness: 0.05, metalness: 0.2 });
  const cyanDim  = new THREE.MeshStandardMaterial({ color: 0x0088bb, emissive: 0x0066aa, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0.6 });
  const purple   = new THREE.MeshStandardMaterial({ color: 0xc481ff, emissive: 0xaa44ff, emissiveIntensity: 2.0, roughness: 0.08 });
  const hair     = new THREE.MeshStandardMaterial({ color: 0x080504, roughness: 0.85 });
  const beard    = new THREE.MeshStandardMaterial({ color: 0x110c06, roughness: 0.9 });
  const eyeW     = new THREE.MeshStandardMaterial({ color: 0xfff8f2, roughness: 0.15 });
  const irisM    = new THREE.MeshStandardMaterial({ color: 0x3d1f00, roughness: 0.08, emissive: 0x1a0d00, emissiveIntensity: 0.4 });
  const pupilM   = new THREE.MeshStandardMaterial({ color: 0x030202 });
  const glossM   = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, roughness: 0 });
  const capGlass = new THREE.MeshPhysicalMaterial({ color: 0x66aaee, transparent: true, opacity: 0.32, roughness: 0.04, transmission: 0.65, emissive: 0x003366, emissiveIntensity: 0.35 });

  // ══════════════ TORSO ══════════════
  const torso = new THREE.Group();
  torso.name = "torso";
  root.add(torso);

  // Body cylinder
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.46, 1.15, 18), armor);
  body.position.y = -0.58; torso.add(body);

  // Chest plates L/R
  [[-0.19, 0.18], [0.19, -0.18]].forEach(([x, ry]) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.58, 0.20), armorEdge);
    plate.position.set(x as number, -0.38, 0.37);
    plate.rotation.y = ry as number;
    torso.add(plate);
  });

  // Hex micro-details on chest
  for (let i = 0; i < 16; i++) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 6), hexM);
    h.rotation.x = Math.PI/2;
    const col = i % 4, row = Math.floor(i / 4);
    h.position.set(-0.22 + col * 0.155, -0.18 - row * 0.13, 0.44);
    torso.add(h);
  }

  // ── ARC REACTOR ──
  const reactor = new THREE.Group();
  reactor.name = "arcReactor";
  reactor.position.set(0, -0.26, 0.53);
  torso.add(reactor);

  reactor.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.020, 16, 60), cyanDim)));
  reactor.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.013, 14, 40), cyanDim)));
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.060, 32),
    new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 5.0 }));
  core.position.z = 0.005; reactor.add(core);
  for (let i = 0; i < 6; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.098, 0.007), cyanDim);
    sp.rotation.z = (i/6)*Math.PI*2;
    sp.position.set(Math.sin((i/6)*Math.PI*2)*0.045, Math.cos((i/6)*Math.PI*2)*0.045, 0.003);
    reactor.add(sp);
  }
  const rLight = new THREE.PointLight(0x00ffff, 4.0, 2.8);
  rLight.position.z = 0.12; reactor.add(rLight);

  // ── ENERGY STRIPS ──
  [[-0.40,-0.24,0.36,0.32],[ 0.40,-0.24,0.36,0.32],[-0.40,-0.56,0.30,0.26],[ 0.40,-0.56,0.30,0.26]].forEach(([x,y,z,h]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.011, h as number, 0.007), cyan);
    s.position.set(x as number, y as number, z as number); torso.add(s);
  });

  // ── SHOULDERS ──
  [-1, 1].forEach(side => {
    const sg = new THREE.Group();
    sg.position.set(side * 0.65, -0.08, 0); torso.add(sg);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI*2, 0, Math.PI*0.58), armor);
    pad.rotation.z = side * 0.28; sg.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.016, 10, 40), cyan);
    ring.rotation.x = Math.PI/2; ring.position.y = 0.09; sg.add(ring);
    const mod = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.042, 16), armorEdge);
    mod.position.y = 0.13; sg.add(mod);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.036, 16), cyan);
    dot.position.set(0, 0.15, 0); dot.rotation.x = -Math.PI/2; sg.add(dot);
    const sLight = new THREE.PointLight(0x00ffff, 1.2, 1.0);
    sLight.position.set(0, 0.14, 0); sg.add(sLight);
  });

  // ══════════════ NECK ══════════════
  const neckBone = new THREE.Group();
  neckBone.name = "spine005";
  neckBone.position.y = 0.24; torso.add(neckBone);

  neckBone.add(new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.205, 0.34, 14), skin));
  [0.04, 0.13].forEach(y => {
    const cr = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.015, 10, 36), armorEdge);
    cr.rotation.x = Math.PI/2; cr.position.y = y - 0.13; neckBone.add(cr);
    for (let i = 0; i < 5; i++) {
      const a = (i/5)*Math.PI*2 + 0.4;
      const cond = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.022, 0.009), cyanDim);
      cond.position.set(Math.cos(a)*0.20, y-0.13, Math.sin(a)*0.20); neckBone.add(cond);
    }
  });

  // ══════════════ HEAD ══════════════
  const headGroup = new THREE.Group();
  headGroup.name = "spine006";
  headGroup.position.y = 0.62; neckBone.add(headGroup);

  // Head base
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.40, 30, 22), skin);
  head.scale.set(1.0, 1.14, 0.96); headGroup.add(head);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.31, 22, 14), skin);
  jaw.scale.set(1.0, 0.62, 0.90); jaw.position.y = -0.23; headGroup.add(jaw);

  // Ears
  [-1,1].forEach(s => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), skin);
    e.scale.set(0.52, 1.0, 0.68); e.position.set(s*0.39, 0.02, 0); headGroup.add(e);
    const ei = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinDark);
    ei.scale.set(0.42, 0.78, 0.48); ei.position.set(s*0.41, 0.02, 0.02); headGroup.add(ei);
  });

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.078, 14, 10), skin);
  nose.scale.set(1.0, 0.82, 1.12); nose.position.set(0, -0.04, 0.355); headGroup.add(nose);
  const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.15, 0.042), skin);
  noseBridge.position.set(0, 0.07, 0.335); headGroup.add(noseBridge);

  // Eyes
  [-1,1].forEach(s => {
    const eg = new THREE.Group();
    eg.position.set(s*0.135, 0.06, 0.318); headGroup.add(eg);
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.078, 14, 12), skinDark);
    socket.scale.set(1.18, 0.88, 0.58); socket.position.z = -0.012; eg.add(socket);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 12), eyeW);
    white.scale.set(1.12, 0.84, 0.72); eg.add(white);
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.040, 26), irisM);
    iris.position.z = 0.046; eg.add(iris);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.021, 20), pupilM);
    pupil.position.z = 0.048; eg.add(pupil);
    const gloss = new THREE.Mesh(new THREE.CircleGeometry(0.013, 12), glossM);
    gloss.position.set(0.013, 0.013, 0.050); eg.add(gloss);
  });

  // Eyebrows — thick, angled down toward center
  [-1,1].forEach(s => {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.024, 0.026),
      new THREE.MeshStandardMaterial({ color: 0x060402, roughness: 0.9 }));
    br.position.set(s*0.135, 0.145, 0.308);
    br.rotation.z = s * -0.20;
    br.rotation.x = -0.18;
    headGroup.add(br);
  });

  // Smile / lips
  const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.030, 0.030), skinDark);
  upperLip.position.set(0, -0.148, 0.332); upperLip.rotation.x = -0.1; headGroup.add(upperLip);
  const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 8), skin);
  lowerLip.scale.set(1.35, 0.52, 0.66); lowerLip.position.set(0, -0.178, 0.332); headGroup.add(lowerLip);
  [-1,1].forEach(s => {
    const sm = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.042, 0.014), skinDark);
    sm.position.set(s*0.078, -0.132, 0.338); sm.rotation.z = s*0.32; headGroup.add(sm);
  });

  // Beard + mustache
  const must = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.034, 0.024), beard);
  must.position.set(0, -0.120, 0.338); headGroup.add(must);
  const beardMain = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 12), beard);
  beardMain.scale.set(0.96, 0.52, 0.68); beardMain.position.set(0, -0.29, 0.175); headGroup.add(beardMain);
  [-1,1].forEach(s => {
    const bs = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), beard);
    bs.scale.set(0.68, 0.62, 0.58); bs.position.set(s*0.19, -0.20, 0.20); headGroup.add(bs);
  });

  // Hair
  const hairTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.41, 24, 14, 0, Math.PI*2, 0, Math.PI*0.46), hair);
  hairTop.position.y = 0.03; headGroup.add(hairTop);
  const hairFront = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), hair);
  hairFront.scale.set(1.22, 0.58, 0.82); hairFront.position.set(0, 0.31, 0.23); headGroup.add(hairFront);

  // ══════════════ HOLOGRAPHIC CAP ══════════════
  const capGroup = new THREE.Group();
  capGroup.position.y = 0.30; headGroup.add(capGroup);

  const capDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 26, 14, 0, Math.PI*2, 0, Math.PI*0.40), capGlass);
  capGroup.add(capDome);

  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.50, 0.46, 0.030, 22, 1, false, -Math.PI*0.14, Math.PI*1.28), capGlass);
  brim.position.set(0.04, -0.13, 0.07); capGroup.add(brim);

  const capRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.013, 10, 60, Math.PI*1.38), cyan);
  capRim.rotation.x = Math.PI*0.1; capRim.position.y = -0.07; capGroup.add(capRim);

  // Cap orb — this acts as our "screenlight" / bindi
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xc481ff, emissive: 0xc481ff, emissiveIntensity: 5.0,
    transparent: true, opacity: 1.0,
  });
  const screenlight = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 12), orbMat);
  screenlight.name = "screenlight";
  screenlight.position.y = 0.32; capGroup.add(screenlight);
  const capOrbLight = new THREE.PointLight(0xc481ff, 3.0, 1.2);
  capOrbLight.position.y = 0.32; capGroup.add(capOrbLight);

  // Purple patch on cap
  const capPurple = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 10, 0.8, 1.2, 0.1, 0.5), purple);
  capPurple.scale.set(1.85, 1.18, 1.0); capPurple.position.set(-0.1, 0.06, 0); capGroup.add(capPurple);

  // ══════════════ FLOATING PARTICLES ══════════════
  const particleGroup = new THREE.Group();
  particleGroup.name = "particles";
  root.add(particleGroup);

  const pColors = [0x00ffff, 0xc481ff, 0x4488ff, 0x00ffaa, 0x8844ff];
  for (let i = 0; i < 32; i++) {
    const sz = 0.011 + Math.random()*0.024;
    const pc = pColors[Math.floor(Math.random()*pColors.length)];
    const pm = new THREE.MeshStandardMaterial({
      color: pc, emissive: pc, emissiveIntensity: 2.5 + Math.random()*2.0,
    });
    const p = new THREE.Mesh(new THREE.SphereGeometry(sz, 8, 6), pm);
    const angle = (i/32)*Math.PI*2;
    const radius = 0.75 + Math.random()*0.55;
    const height = -0.9 + Math.random()*1.8;
    p.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius*0.55 - 0.2);
    p.userData = {
      baseAngle: angle, radius, height,
      speed:      0.25 + Math.random()*0.55,
      floatSpeed: 0.45 + Math.random()*1.1,
      floatAmp:   0.038 + Math.random()*0.085,
      floatOff:   Math.random()*Math.PI*2,
    };
    particleGroup.add(p);
  }

  // ── HOLOGRAPHIC TECH PANEL (behind right shoulder) ──
  const panelGroup = new THREE.Group();
  panelGroup.position.set(0.85, -0.1, -0.35);
  panelGroup.rotation.y = -0.6;
  root.add(panelGroup);

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x001833, transparent: true, opacity: 0.22,
    emissive: 0x002244, emissiveIntensity: 0.8,
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), panelMat);
  panelGroup.add(panel);
  // Panel grid lines
  for (let i = 0; i < 6; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.005, 0.002),
      new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x0088cc, emissiveIntensity: 1.5, transparent: true, opacity: 0.5 }));
    line.position.y = -0.3 + i*0.12; panelGroup.add(line);
  }
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.70, 0.002),
      new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x0088cc, emissiveIntensity: 1.5, transparent: true, opacity: 0.4 }));
    line.position.x = -0.20 + i*0.14; panelGroup.add(line);
  }

  // Add root to scene
  scene.add(root);

  return { root, headGroup, screenlight, neckBone, particleGroup };
}

// ════════════════════════════════════════════════════════
//  SCENE COMPONENT
// ════════════════════════════════════════════════════════
const Scene = () => {
  const canvasDiv   = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef    = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;
    const rect   = canvasDiv.current.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    const scene  = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled  = true;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(26, aspect, 0.1, 100);
    camera.position.set(0, 0.18, 3.9);
    camera.lookAt(0, 0.1, 0);

    // ── CINEMATIC LIGHTS ──
    scene.add(new THREE.AmbientLight(0x0d0d1a, 1.0));
    // Key light — front left warm
    const key = new THREE.DirectionalLight(0xfff4e0, 3.0);
    key.position.set(-2.2, 2.2, 3.2); key.castShadow = true; scene.add(key);
    // Fill — front right cool
    const fill = new THREE.DirectionalLight(0xc8d8ff, 1.4);
    fill.position.set(2.2, 1.2, 2.2); scene.add(fill);
    // Cyan rim — shoulders + cap
    const rimCyan = new THREE.DirectionalLight(0x00ffff, 2.5);
    rimCyan.position.set(0, 3.5, -2.5); scene.add(rimCyan);
    // Purple back halo
    const backP = new THREE.PointLight(0xaa44ff, 3.5, 7);
    backP.position.set(0, 1.2, -2.5); scene.add(backP);
    // Bottom bounce
    const bounce = new THREE.PointLight(0x0033aa, 1.2, 3.5);
    bounce.position.set(0, -2.2, 1.0); scene.add(bounce);

    // ── BUILD CHARACTER ──
    const { root: charRoot, headGroup, screenlight, neckBone, particleGroup }
      = buildCharacter(scene);
    charRoot.position.y = -1.05;

    // ── GLASSES DROP ──
    let glasses: THREE.Group | null = createGlasses();
    let glassesFloatT = 0;
    let glassesLanded = false;
    let dropY = 4.5;
    const landY = 0.09;
    let spinZ = 0;
    glasses.position.set(0, dropY, 0.18);
    glasses.rotation.x = Math.PI * 0.5;
    headGroup.add(glasses);

    // ── GSAP SCROLL TIMELINES ──
    // Pass a mock GLTF-like object so setCharTimeline still runs
    // We patch screenlight manually via the built object
    setTimeout(() => {
      try {
        // Patch screenlight material to work with GsapScroll expectations
        (screenlight.material as THREE.MeshStandardMaterial).transparent = true;
        (screenlight.material as THREE.MeshStandardMaterial).emissive.set("#C8BFFF");

        // setCharTimeline expects (object, camera) — pass charRoot as character
        setCharTimeline(charRoot, camera);
        setAllTimeline();
      } catch(e) {
        // fallback — GSAP timelines optional
      }
    }, 200);

    // ── LOADING ──
    const progress = setProgress(setLoading);
    // Fast load — no heavy model decryption
    setTimeout(() => { progress.loaded().then(() => {}); }, 600);

    // ── MOUSE TRACKING ──
    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (e: MouseEvent) =>
      handleMouseMove(e, (x, y) => (mouse = { x, y }));

    let debounce: number | undefined;
    const onTouchStart = (e: TouchEvent) => {
      const el = e.target as HTMLElement;
      debounce = setTimeout(() => {
        el?.addEventListener("touchmove", (ev: TouchEvent) =>
          handleTouchMove(ev, (x, y) => (mouse = { x, y }))
        );
      }, 200);
    };
    const onTouchEnd = () =>
      handleTouchEnd((x, y, ix, iy) => {
        mouse = { x, y }; interpolation = { x: ix, y: iy };
      });

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    // ── RESIZE ──
    const onResize = () => {
      if (!canvasDiv.current) return;
      const r = canvasDiv.current.getBoundingClientRect();
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    };
    window.addEventListener("resize", onResize);

    // ── ANIMATE ──
    const clock = new THREE.Clock();
    let reactorPulse = 0;
    let orbPulse = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Head mouse tracking
      if (headGroup && window.scrollY < 200) {
        handleHeadRotation(
          headGroup, mouse.x, mouse.y,
          interpolation.x, interpolation.y, lerp
        );
      }

      // Glasses drop + float
      if (glasses) {
        if (!glassesLanded) {
          dropY += (landY - dropY) * 0.045;
          spinZ  += 0.14;
          glasses.position.y = dropY;
          glasses.rotation.z = spinZ;
          glasses.rotation.x = Math.PI*0.5 + Math.sin(spinZ*1.5)*0.06;
          if (Math.abs(dropY - landY) < 0.004) {
            glassesLanded = true;
            glasses.position.y = landY;
            glasses.rotation.z = 0;
            glasses.rotation.x = Math.PI*0.5;
          }
        } else {
          glassesFloatT += delta;
          glasses.position.y = landY + Math.sin(glassesFloatT*1.2)*0.005;
          glasses.position.x = Math.sin(glassesFloatT*0.7)*0.003;
          glasses.rotation.z = Math.sin(glassesFloatT*0.9)*0.012;
        }
      }

      // Arc reactor pulse
      reactorPulse += delta * 2.8;
      const reactor = charRoot.getObjectByName("arcReactor");
      if (reactor) {
        const rL = reactor.children.find(c => c instanceof THREE.PointLight) as THREE.PointLight;
        if (rL) rL.intensity = 3.0 + Math.sin(reactorPulse)*1.5;
      }

      // Screenlight / bindi pulse (rocket bindi effect)
      orbPulse += delta * 3.5;
      if (screenlight) {
        const mat = screenlight.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 4.0 + Math.sin(orbPulse)*2.5;
        screenlight.scale.setScalar(0.9 + Math.sin(orbPulse*0.8)*0.22);
      }

      // Floating particles orbit
      particleGroup.children.forEach(p => {
        const d = p.userData;
        const a = d.baseAngle + elapsed * d.speed;
        p.position.x = Math.cos(a) * d.radius;
        p.position.z = Math.sin(a) * d.radius * 0.55 - 0.2;
        p.position.y = d.height + Math.sin(elapsed*d.floatSpeed + d.floatOff)*d.floatAmp;
        p.scale.setScalar(0.8 + Math.sin(elapsed*d.floatSpeed*2 + d.floatOff)*0.28);
      });

      // Subtle body breathe
      charRoot.rotation.y = Math.sin(elapsed*0.28)*0.032;
      charRoot.position.y = -1.05 + Math.sin(elapsed*0.48)*0.009;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      clearTimeout(debounce);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="character-model character-loaded">
      <div className="character-rim" />
      <div ref={canvasDiv} style={{ width: "100%", height: "100%" }} />
      <div ref={hoverDivRef} className="character-hover" />
    </div>
  );
};

export default Scene;
