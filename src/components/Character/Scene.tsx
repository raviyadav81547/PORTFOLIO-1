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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function createGlasses(): THREE.Group {
  const g = new THREE.Group();
  const R = 0.055;
  const T = 0.008;
  const frame = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.92, roughness: 0.08 });
  const lens  = new THREE.MeshPhysicalMaterial({ color: 0x000820, transparent: true, opacity: 0.86, roughness: 0, emissive: 0x001133, emissiveIntensity: 0.25 });
  const glow  = new THREE.MeshBasicMaterial({ color: 0xc481ff, transparent: true, opacity: 0.30 });

  const addLens = (x: number) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, T, 16, 64), frame);
    rim.position.x = x; g.add(rim);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(R - T, 48), lens);
    fill.position.set(x, 0, 0.001); g.add(fill);
    const gl = new THREE.Mesh(new THREE.TorusGeometry(R + 0.004, 0.004, 8, 64), glow);
    gl.position.set(x, 0, -0.001); g.add(gl);
  };
  addLens(-R * 2.2);
  addLens(R * 2.2);

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, R * 2.0, 8), frame);
  bridge.rotation.z = Math.PI / 2; g.add(bridge);
  [-1, 1].forEach(s => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.003, R * 3.8, 8), frame);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(s * R * 4.1, 0, -R * 0.6);
    g.add(arm);
  });
  return g;
}

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
    let dropY = 1.5;
    const landY = 0.13;
    let spinZ = 0;

    // ✅ correct 3 args
    const { loadCharacter } = setCharacter(renderer, scene, camera);
    const light    = setLighting(scene);
    const progress = setProgress(setLoading);

    const fallbackTimer = setTimeout(() => {
      progress.loaded().then(() => {});
    }, 8000);

    loadCharacter().then((gltf) => {
      clearTimeout(fallbackTimer);
      if (!gltf) { progress.loaded().then(() => {}); return; }

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;
      const char = gltf.scene;
      scene.add(char);

      headBone = char.getObjectByName("spine006") || null;

      if (headBone) {
        glasses = createGlasses();
        glasses.position.set(0, dropY, 0.25);
        glasses.rotation.x = Math.PI / 2;
        headBone.add(glasses);
      }

      progress.loaded().then(() => {
        setTimeout(() => {
          light.turnOnLights();
          animations.startIntro();
        }, 2500);
      });

      window.addEventListener("resize", () =>
        handleResize(renderer, camera, canvasDiv, char)
      );
    });

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
        mouse = { x, y };
        interpolation = { x: ix, y: iy };
      });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (headBone) {
        handleHeadRotation(headBone, mouse.x, mouse.y, interpolation.x, interpolation.y, lerp);
      }
      if (glasses) {
        if (!glassesLanded) {
          dropY += (landY - dropY) * 0.05;
          spinZ  += 0.20;
          glasses.position.y = dropY;
          glasses.rotation.z = spinZ;
          glasses.rotation.x = Math.PI / 2 + Math.sin(spinZ * 1.5) * 0.1;
          if (Math.abs(dropY - landY) < 0.003) {
            glassesLanded = true;
            glasses.position.y = landY;
            glasses.rotation.z = 0;
            glasses.rotation.x = Math.PI / 2;
          }
        } else {
          glassesFloatT += delta;
          glasses.position.y = landY + Math.sin(glassesFloatT * 1.1) * 0.004;
          glasses.position.x = Math.sin(glassesFloatT * 0.65) * 0.002;
          glasses.rotation.z = Math.sin(glassesFloatT * 0.85) * 0.010;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const landingDiv = document.getElementById("landingDiv");
    document.addEventListener("mousemove", onMouseMove);
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend",   onTouchEnd);
    }

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend",   onTouchEnd);
      }
      clearTimeout(debounce);
      renderer.dispose();
    };
  // ✅ FIX: setLoading in dependency array
  }, [setLoading]);

  return (
    <div className="character-model">
      <div className="character-rim" />
      <div ref={canvasDiv} style={{ width: "100%", height: "100%" }} />
      <div ref={hoverDivRef} className="character-hover" />
    </div>
  );
};

export default Scene;
