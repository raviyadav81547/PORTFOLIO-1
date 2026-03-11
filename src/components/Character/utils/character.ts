import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  // ✅ FIX: no-async-promise-executor — moved async logic outside Promise constructor
  const loadCharacter = (): Promise<GLTF | null> => {
    return decryptFile("/models/character.enc", "Character3D#@")
      .then((encryptedBlob) => {
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));
        return new Promise<GLTF | null>((resolve, reject) => {
          loader.load(
            blobUrl,
            async (gltf) => {
              const character: THREE.Object3D = gltf.scene;
              await renderer.compileAsync(character, camera, scene);
              character.traverse((child) => {
                // ✅ FIX: replaced `any` with proper type check
                const mesh = child as THREE.Mesh;
                if (mesh.isMesh) {
                  mesh.castShadow = true;
                  mesh.receiveShadow = true;
                  mesh.frustumCulled = true;
                }
              });
              resolve(gltf);
              setCharTimeline(character, camera);
              setAllTimeline();
              character.getObjectByName("footR")!.position.y = 3.36;
              character.getObjectByName("footL")!.position.y = 3.36;
              dracoLoader.dispose();
            },
            undefined,
            (error) => {
              console.error("Error loading GLTF model:", error);
              reject(error);
            }
          );
        });
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  };

  return { loadCharacter };
};

export default setCharacter;
