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

function createGlasses(): THREE.Group {
  const glasses = new THREE.Group();
  const S = 0.20;

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.95, roughness: 0.05 });
  const lensMat  = new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.92, roughness: 0 });
  const glowMat  = new THREE.MeshBasicMaterial({ color: 0xc481ff, transparent: true, opacity: 0.18 });

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
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, S*2.1, 10), frameMat);
  rightArm.rotation.z = Math.PI/2; rightArm.position.set(S*2.5, 0, -S*0.3); glasses.add(rightArm);

  const leftGlow = new THREE.Mesh(new THREE.TorusGeometry(S*0.73, S*0.04, 12, 80), glowMat);
  leftGlow.position.set(-S*1.2, 0, -0.003); glasses.add(leftGlow);
  const rightGlow = new THREE.Mesh(new THREE.TorusGeometry(S*0.73, S*0.04, 12, 80), glowMat);
  rightGlow.position.set(S*1.2, 0, -0.003); glasses.add(rightGlow);

  return glasses;
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone:     THREE.Object3D | null = null;
    let _screenLight: THREE.Object3D | null = null;
    let mixer:        THREE.AnimationMixer | null = null;
    let glasses:      THREE.Group | null = null;
    let glassesFloatT = 0;
    let glassesLanded = false;
    let dropY = 5.0;
    const landY = 0.10;
    let spinZ = 0;

    // ✅ ORIGINAL call — setCharacter(scene) only
    const { loadCharacter } = setCharacter(scene);
    const light    = setLighting(scene);
    const progress = setProgress(setLoading);

    const fallbackTimer = setTimeout(() => {
      progress.loaded().then(() => {});
    }, 6000);

    loadCharacter().then((gltf) => {
      clearTimeout(fallbackTimer);
      if (!gltf) { progress.loaded().then(() => {}); return; }

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;

      const char = gltf.scene;
      scene.add(char);

      headBone     = char.getObjectByName("spine006") || char.getObjectByName("Head") || char.getObjectByName("head") || null;
      _screenLight = char.getObjectByName("screenlight") || null;

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
        }, 2500);
      });

      window.addEventListener("resize", () => handleResize(renderer, camera, canvasDiv, char));
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
      if (headBone) handleHeadRotation(headBone, mouse.x, mouse.y, interpolation.x, interpolation.y);

      if (glasses) {
        if (!glassesLanded) {
          dropY += (landY - dropY) * 0.045;
          spinZ += 0.14;
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
      <div className="character-rim" />
      <div ref={canvasDiv} style={{ width: "100%", height: "100%" }} />
      <div ref={hoverDivRef} className="character-hover" />
    </div>
  );
};

export default Scene;
