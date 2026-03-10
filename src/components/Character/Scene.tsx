import gsap from "gsap";
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

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x080808, metalness: 0.98, roughness: 0.02,
  });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x050510, metalness: 0.1, roughness: 0.0,
    transparent: true, opacity: 0.85, reflectivity: 1.0,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc481ff, transparent: true, opacity: 0.7,
  });

  const S = 0.20;

  // LEFT RIM + LENS
  const lRim = new THREE.Mesh(new THREE.TorusGeometry(S, 0.016, 24, 100), frameMat);
  lRim.position.set(-0.24, 0, 0); glasses.add(lRim);
  const lLens = new THREE.Mesh(new THREE.CircleGeometry(S - 0.016, 80), lensMat);
  lLens.position.set(-0.24, 0, 0.002); glasses.add(lLens);

  // RIGHT RIM + LENS
  const rRim = new THREE.Mesh(new THREE.TorusGeometry(S, 0.016, 24, 100), frameMat);
  rRim.position.set(0.24, 0, 0); glasses.add(rRim);
  const rLens = new THREE.Mesh(new THREE.CircleGeometry(S - 0.016, 80), lensMat);
  rLens.position.set(0.24, 0, 0.002); glasses.add(rLens);

  // BRIDGE
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.08, 12), frameMat);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 0.015, 0.01); glasses.add(bridge);

  // LEFT ARM
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.52, 12), frameMat);
  lArm.rotation.z = Math.PI / 2;
  lArm.position.set(-0.60, 0, -0.04); glasses.add(lArm);

  // RIGHT ARM
  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.52, 12), frameMat);
  rArm.rotation.z = Math.PI / 2;
  rArm.position.set(0.60, 0, -0.04); glasses.add(rArm);

  // NEON GLOW RINGS
  const lGlow = new THREE.Mesh(new THREE.TorusGeometry(S + 0.012, 0.007, 12, 100), glowMat);
  lGlow.position.set(-0.24, 0, -0.005); glasses.add(lGlow);
  const rGlow = new THREE.Mesh(new THREE.TorusGeometry(S + 0.012, 0.007, 12, 100), glowMat);
  rGlow.position.set(0.24, 0, -0.005); glasses.add(rGlow);

  // NEON POINT LIGHT — makes glasses glow purple
  const neonLight = new THREE.PointLight(0xc481ff, 3.0, 1.2);
  neonLight.position.set(0, 0, 0.15);
  glasses.add(neonLight);

  return glasses;
}

const Scene = () => {
  const canvasDiv   = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef    = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;

    const rect      = canvasDiv.current.getBoundingClientRect();
    const container = { width: rect.width, height: rect.height };
    const aspect    = container.width / container.height;
    const scene     = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping          = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure  = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone:       THREE.Object3D | null = null;
    let mixer:          THREE.AnimationMixer | null = null;
    let glasses:        THREE.Group | null = null;
    let glassesFloatT   = 0;
    let glassesLanded   = false;

    // Drop state
    let dropY      = 5.0;   // bone-space: start high above head
    const landY    = 0.10;  // bone-space: eye level on face
    let spinZ      = 0;     // accumulate spin

    const { loadCharacter } = setCharacter(renderer, scene, camera);
    const light    = setLighting(scene);
    const progress = setProgress(setLoading);

    // Safety: if character takes too long, force complete loading anyway
    const loadingFallback = setTimeout(() => {
      progress.loaded().then(() => {});
    }, 5000);

    loadCharacter().then((gltf) => {
      clearTimeout(loadingFallback);
      if (!gltf) { progress.loaded().then(() => {}); return; }

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;

      const char = gltf.scene;
      scene.add(char);

      // Try both common bone names
      headBone = char.getObjectByName("spine006")
              || char.getObjectByName("Head")
              || char.getObjectByName("head")
              || null;

      if (headBone) {
        glasses = createGlasses();

        // START: way above head in bone-local space, spinning
        glasses.position.set(0, dropY, 0.18);
        glasses.rotation.set(Math.PI * 0.5, 0, 0); // face forward
        glasses.scale.set(1, 1, 1);

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

    let mouse        = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };
    let debounce: number | undefined;

    const onMouseMove = (e: MouseEvent) =>
      handleMouseMove(e, (x, y) => { mouse = { x, y }; });

    const onTouchStart = (e: TouchEvent) => {
      const el = e.target as HTMLElement;
      debounce = window.setTimeout(() => {
        el?.addEventListener("touchmove", (ev: TouchEvent) =>
          handleTouchMove(ev, (x, y) => { mouse = { x, y }; })
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
        handleHeadRotation(headBone, mouse.x, mouse.y, interpolation.x, interpolation.y);
      }

      // ── GLASSES ANIMATION ──
      if (glasses) {
        if (!glassesLanded) {
          // Smooth drop toward landY
          dropY += (landY - dropY) * 0.045;
          glasses.position.y = dropY;

          // Full 360 spin while falling
          spinZ += 0.14;
          glasses.rotation.z = spinZ;

          // Side wobble while dropping
          glasses.position.x = Math.sin(spinZ * 1.5) * 0.06;

          // Landed check
          if (Math.abs(dropY - landY) < 0.004) {
            glassesLanded = true;
            glasses.position.set(0, landY, 0.18);
            glasses.rotation.z = 0;

            // Landing bounce — GSAP scale
            gsap.fromTo(glasses.scale,
              { x: 1.2, y: 1.2, z: 1.2 },
              { x: 1.0, y: 1.0, z: 1.0, duration: 0.45, ease: "back.out(2.5)" }
            );

            // Neon glow flash on land
            const neon = glasses.children.find(
              c => c instanceof THREE.PointLight
            ) as THREE.PointLight | undefined;
            if (neon) {
              gsap.fromTo(neon, { intensity: 8 }, { intensity: 3.0, duration: 0.6 });
            }
          }

        } else {
          // ── FLOATING after landing ──
          glassesFloatT += delta;
          glasses.position.y = landY + Math.sin(glassesFloatT * 0.9) * 0.004;
          glasses.position.x = Math.sin(glassesFloatT * 0.55) * 0.003;
          glasses.rotation.z = Math.sin(glassesFloatT * 0.65) * 0.01;

          // Glow pulse
          const neon = glasses.children.find(
            c => c instanceof THREE.PointLight
          ) as THREE.PointLight | undefined;
          if (neon) {
            neon.intensity = 2.5 + Math.sin(glassesFloatT * 2.2) * 0.8;
          }
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
      <div ref={canvasDiv} className="character-model" />
      <div ref={hoverDivRef} className="character-hover" />
    </div>
  );
};

export default Scene;
