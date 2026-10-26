import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { Environment, Float, Html, useAnimations, useGLTF } from "@react-three/drei";

import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import { getCompanion, reportX, type Mood } from "@/lib/companion";

const MODEL = "/models/companion.glb";

/* =========================================================
   SETTINGS
========================================================= */

const TARGET_HEIGHT = 2.65;

const HEART = "#ff5d84";
const HEART_GLOW = "#ff9fba";

/* Existing animation names from your GLB */
const CLIPS = {
  idle: "Man_Idle",
  walk: "Man_Walk",
  run: "Man_Run",
  jump: "Man_Jump",
  sit: "Man_Sitting",
};

/* =========================================================
   HEART SHAPE
========================================================= */

function createHeartShape() {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.35);

  shape.bezierCurveTo(-0.65, -0.85, -1.05, -0.15, -0.7, 0.35);

  shape.bezierCurveTo(-0.4, 0.75, 0, 0.95, 0, 0.95);

  shape.bezierCurveTo(0, 0.95, 0.4, 0.75, 0.7, 0.35);

  shape.bezierCurveTo(1.05, -0.15, 0.65, -0.85, 0, -0.35);

  return shape;
}

/* =========================================================
   FLOATING HEART
========================================================= */

function FloatingHeart({
  position,
  scale = 0.08,
  speed = 1,
  delay = 0,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  delay?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(createHeartShape(), {
        depth: 0.07,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.025,
        bevelThickness: 0.025,
        curveSegments: 12,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime * speed + delay;

    ref.current.position.y = position[1] + Math.sin(t) * 0.08;

    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.04;

    ref.current.rotation.z = Math.sin(t * 0.8) * 0.15;

    const pulse = 1 + Math.sin(t * 1.8) * 0.08;

    ref.current.scale.setScalar(scale * pulse);
  });

  return (
    <mesh ref={ref} geometry={geometry} position={position} rotation={[0, 0, 0]}>
      <meshStandardMaterial
        color={HEART}
        emissive={HEART}
        emissiveIntensity={0.45}
        roughness={0.28}
        metalness={0.05}
      />
    </mesh>
  );
}

/* =========================================================
   CHARACTER
========================================================= */

function Guy() {
  const gltf = useGLTF(MODEL);

  const cloned = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

  const root = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);

  const head = useRef<THREE.Object3D | null>(null);
  const neck = useRef<THREE.Object3D | null>(null);
  const morphMeshes = useRef<THREE.Mesh[]>([]);

  const currentX = useRef(0.5);
  const targetRotation = useRef(-Math.PI / 2);

  const { actions, mixer } = useAnimations(gltf.animations, rig);

  const { viewport } = useThree();

  /* -------------------------------------------------------
     Find important bones / objects
  ------------------------------------------------------- */

  useEffect(() => {
    cloned.traverse((object) => {
      const name = object.name.toLowerCase();

      if (name === "head" || name.includes("head")) {
        head.current = object;
      }

      if (name === "neck" || name.includes("neck")) {
        neck.current = object;
      }

      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        if (object.morphTargetDictionary && object.morphTargetInfluences) {
          morphMeshes.current.push(object);
          for (const [name, index] of Object.entries(object.morphTargetDictionary)) {
            if (name.toLowerCase().includes("smile")) object.morphTargetInfluences[index] = 0.7;
          }
        }

        /*
         * Keep the original model materials.
         * Only improve rendering quality.
         */
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];

          materials.forEach((material) => {
            material.needsUpdate = true;

            if (material instanceof THREE.MeshStandardMaterial) {
              material.roughness = Math.max(0.25, material.roughness);

              material.metalness = Math.min(0.15, material.metalness);
            }
          });
        }
      }
    });
  }, [cloned]);

  /* -------------------------------------------------------
     Correct model height
  ------------------------------------------------------- */

  const fit = useMemo(() => {
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned, true);

    const size = new THREE.Vector3();

    box.getSize(size);

    const height = size.y || 1;

    const scale = TARGET_HEIGHT / height;

    return {
      scale,
      y: -box.min.y * scale,
    };
  }, [cloned]);

  /* -------------------------------------------------------
     Animation controller
  ------------------------------------------------------- */

  const currentAnimation = useRef("");

  const playAnimation = (name: string) => {
    if (!actions) return;

    const clip = actions[name];

    if (!clip) return;

    if (currentAnimation.current === name) {
      return;
    }

    const previous = actions[currentAnimation.current];

    if (previous) {
      previous.fadeOut(0.3);
    }

    clip.reset();
    clip.fadeIn(0.3);
    clip.setEffectiveWeight(1);
    clip.play();

    currentAnimation.current = name;
  };

  /* -------------------------------------------------------
     Start idle animation
  ------------------------------------------------------- */

  useEffect(() => {
    if (!actions) return;

    playAnimation(CLIPS.idle);

    return () => {
      mixer.stopAllAction();
    };
  }, [actions]);

  /* -------------------------------------------------------
     Main animation loop
  ------------------------------------------------------- */

  useFrame((state, delta) => {
    if (!root.current) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    for (const mesh of morphMeshes.current) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;
      const blink = Math.max(0, Math.sin(time * 0.72) - 0.985) * 65;
      for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
        if (name.toLowerCase().includes("blink")) mesh.morphTargetInfluences[index] = blink;
      }
    }

    const companion = getCompanion();

    const mood = companion.mood as Mood;

    const targetX = 0.5;

    /* -----------------------------------------------
       Movement
    ------------------------------------------------ */

    const dx = targetX - currentX.current;

    const movementSpeed = 2.2;

    currentX.current += dx * Math.min(1, dt * movementSpeed);

    reportX(currentX.current);

    const walking = Math.abs(dx) > 0.025;

    /* -----------------------------------------------
       Animation selection
    ------------------------------------------------ */

    if (walking) {
      if (mood === "run") {
        playAnimation(CLIPS.run);
      } else {
        playAnimation(CLIPS.walk);
      }
    } else {
      switch (mood) {
        case "sit":
        case "read":
        case "kneel":
        case "present":
          playAnimation(CLIPS.sit);
          break;

        case "jump":
          playAnimation(CLIPS.jump);
          break;

        default:
          playAnimation(CLIPS.idle);
      }
    }

    /* -----------------------------------------------
       Character position
    ------------------------------------------------ */

    const screenX = (currentX.current - 0.5) * viewport.width;

    const maxX = Math.max(0.8, viewport.width * 0.45);

    root.current.position.x = THREE.MathUtils.clamp(screenX, -maxX, maxX);

    /* -----------------------------------------------
       Direction
    ------------------------------------------------ */

    targetRotation.current = -Math.PI / 2;

    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      targetRotation.current,
      5,
      dt,
    );

    /* -----------------------------------------------
       Natural breathing
    ------------------------------------------------ */

    const breathing = Math.sin(time * 2.0) * 0.012;

    root.current.scale.set(1, 1 + breathing, 1);

    /* -----------------------------------------------
       Gentle idle movement
    ------------------------------------------------ */

    if (!walking) {
      root.current.position.y = Math.sin(time * 1.5) * 0.012;
    } else {
      root.current.position.y = 0;
    }

    /* -----------------------------------------------
       Head tracking
    ------------------------------------------------ */

    if (head.current) {
      const pointerX = state.pointer.x;

      const desiredY = THREE.MathUtils.clamp(-pointerX * 0.28, -0.35, 0.35);

      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, desiredY, 5, dt);

      const desiredX = THREE.MathUtils.clamp(state.pointer.y * 0.12, -0.15, 0.15);

      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, desiredX, 5, dt);
    }

    /* -----------------------------------------------
       Neck follows head subtly
    ------------------------------------------------ */

    if (neck.current) {
      neck.current.rotation.y = THREE.MathUtils.damp(
        neck.current.rotation.y,
        state.pointer.x * -0.08,
        4,
        dt,
      );
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      <group ref={rig} position={[0, fit.y, 0]} scale={fit.scale}>
        <primitive object={cloned} />
      </group>

      {/* Character glow heart */}
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.25}>
        <mesh position={[0, 2.15, 0]} scale={0.11}>
          <extrudeGeometry
            args={[
              createHeartShape(),
              {
                depth: 0.08,
                bevelEnabled: true,
                bevelSegments: 2,
                bevelSize: 0.025,
                bevelThickness: 0.025,
                curveSegments: 12,
              },
            ]}
          />

          <meshStandardMaterial
            color={HEART_GLOW}
            emissive={HEART}
            emissiveIntensity={1.5}
            roughness={0.25}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* =========================================================
   LOADING UI
========================================================= */

function LoadingCharacter() {
  return (
    <Html center>
      <div className="whitespace-nowrap font-serif text-[13px] text-rose-soft">
        Loading your little companion ❤️
      </div>
    </Html>
  );
}

/* =========================================================
   MAIN SCENE
========================================================= */

export default function CompanionScene({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 size-full">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 1.5, 6.4],
          fov: 34,
          near: 0.1,
          far: 50,
        }}
      >
        {/* -------------------------------------------------
            Lighting
        ------------------------------------------------- */}

        <ambientLight intensity={1.45} />

        <directionalLight position={[3, 5, 4]} intensity={2.2} />

        <pointLight position={[-3, 2.5, 2]} intensity={1.35} distance={7} color="#ff9fb8" />

        {/* -------------------------------------------------
            Environment
        ------------------------------------------------- */}

        <Environment resolution={256}>
          <mesh>
            <sphereGeometry args={[20, 32, 32]} />

            <meshBasicMaterial color="#180b12" side={THREE.BackSide} />
          </mesh>
        </Environment>

        {/* -------------------------------------------------
            Character
        ------------------------------------------------- */}

        <Suspense fallback={<LoadingCharacter />}>
          <Guy />
        </Suspense>

        {/* -------------------------------------------------
            Decorative hearts
        ------------------------------------------------- */}

        <FloatingHeart position={[-1.15, 1.7, 0]} scale={0.065} speed={0.8} />

        <FloatingHeart position={[1.1, 2.0, -0.2]} scale={0.05} speed={1.15} delay={1} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
