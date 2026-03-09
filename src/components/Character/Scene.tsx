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

// ============================================
// CREATE 3D GLASSES - No gravity floating
// ============================================
function createGlasses(): THREE.Group {
  const glasses = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.95,
    roughness: 0.05,
    envMapIntensity: 2.0,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0.3,
    roughness: 0.0,
    transparent: true,
    opacity: 0.92,
    reflectivity: 1.0,
    envMapIntensity: 3.0,
  });

  const leftRimGeo = new THREE.TorusGeometry(0.14, 0.014, 20, 80);
  const leftRim = new THREE.Mesh(leftRimGeo, frameMat);
  leftRim.position.set(-0.17, 0, 0);
  glasses.add(leftRim);

  const leftFillGeo = new THREE.CircleGeometry(0.126, 60);
  const leftFill = new THREE.Mesh(leftFillGeo, lensMat);
  leftFill.position.set(-0.17, 0, 0.002);
  glasses.add(leftFill);

  const rightRimGeo = new THREE.TorusGeometry(0.14, 0.014, 20, 80);
  const rightRim = new THREE.Mesh(rightRimGeo, frameMat);
  rightRim.position.set(0.17, 0, 0);
  glasses.add(rightRim);

  const rightFillGeo = new THREE.CircleGeometry(0.126, 60);
  const rightFill = new THREE.Mesh(rightFillGeo, lensMat);
  rightFill.position.set(0.17, 0, 0.002);
  glasses.add(rightFill);

  const bridgeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 0.01, 0.01);
  glasses.add(bridge);

  const leftArmGeo = new THREE.CylinderGeometry(0.006, 0.004, 0.42, 10);
  const leftArm = new THREE.Mesh(leftArmGeo, frameMat);
  leftArm.rotation.z = Math.PI / 2;
  leftArm.position.set(-0.5, 0, -0.06);
  glasses.add(leftArm);

  const rightArmGeo = new THREE.CylinderGeometry(0.006, 0.004, 0.42, 10);
  const rightArm = new THREE.Mesh(rightArmGeo, frameMat);
  rightArm.rotation.z = Math.PI / 2;
  rightArm.position.set(0.5, 0, -0.06);
  glasses.add(rightArm);

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc481ff,
    transparent: true,
    opacity: 0.15,
  });
  const leftGlowGeo = new THREE.TorusGeometry(0.145, 0.006, 12, 80);
  const leftGlow = new THREE.Mesh(leftGlowGeo, glowMat);
  leftGlow.position.set(-0.17, 0, -0.005);
  glasses.add(leftGlow);

  const rightGlowGeo = new THREE.TorusGeometry(0.145, 0.006, 12, 80);
  const rightGlow = new THREE.Mesh(rightGlowGeo, glowMat);
  rightGlow.position.set(0.17, 0, -0.005);
  glasses.add(rightGlow);

  return glasses;
}

// Lerp helper — matches the signature expected by handleHeadRotation
const lerp = (x: number, y: number, t: number): number => x + (y - x) * t;

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let mixer: THREE.AnimationMixer;
      let glasses: THREE.Group | null = null;
      let glassesFloatTime = 0;
      let glassesLanded = false;
      let glassesDropY = 8;
      const glassesTargetY = 0.08;

      // FIX 1: Pass renderer, scene, camera — matches character.ts signature
      const { loadCharacter } = setCharacter(renderer, scene, camera);
      const light = setLighting(scene);
      const progress = setProgress(setLoading);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          const char = gltf.scene;
          scene.add(char);
          headBone = char.getObjectByName("spine006") || null;

          if (headBone) {
            glasses = createGlasses();
            glasses.position.set(0, glassesDropY, 0.18);
            glasses.rotation.x = Math.PI * 0.5;
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
        }
      });

      let mouse = { x: 0, y: 0 };
      let interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };

      let debounce: number | undefined;

      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (mixer) mixer.update(delta);

        if (headBone) {
          // FIX 2: Pass lerp as 6th argument — matches mouseUtils.ts signature
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            lerp
          );
        }

        if (glasses) {
          if (!glassesLanded) {
            const speed = 0.055;
            glassesDropY += (glassesTargetY - glassesDropY) * speed;
            glasses.position.y = glassesDropY;
            glasses.rotation.z += 0.12;
            glasses.position.x = Math.sin(glassesDropY * 3) * 0.05;

            if (Math.abs(glassesDropY - glassesTargetY) < 0.003) {
              glassesLanded = true;
              glasses.position.y = glassesTargetY;
              glasses.position.x = 0;
              glasses.rotation.z = 0;
              gsap.fromTo(
                glasses.scale,
                { x: 1.15, y: 1.15, z: 1.15 },
                { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(2)" }
              );
            }
          } else {
            glassesFloatTime += delta;
            glasses.position.y =
              glassesTargetY + Math.sin(glassesFloatTime * 0.8) * 0.003;
            glasses.position.x = Math.sin(glassesFloatTime * 0.5) * 0.002;
            glasses.rotation.z = Math.sin(glassesFloatTime * 0.6) * 0.008;
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
    }
  }, []);

  return (
    <div className="character-model">
      <div ref={canvasDiv} className="character-model" />
      <div ref={hoverDivRef} className="character-hover" />
    </div>
  );
};

export default Scene;
