import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import modelAsset from "@/assets/photo-inspired-humanoid-v2.glb.asset.json";
import { curvedPetal, petalTexture } from "./roseMaterials";

type Action = "idle" | "rose" | "kiss";
type Palette = { wine: string; light: string; rose: string; leaf: string };

function Character({
  action,
  burst,
  onTap,
  palette,
}: {
  action: Action;
  burst: number;
  onTap: () => void;
  palette: Palette;
}) {
  const { scene } = useGLTF(modelAsset.url);
  const character = useMemo(() => {
    const object = clone(scene);
    object.updateWorldMatrix(true, true);
    // The source has centimetre bones but metre mesh vertices and a 0.01 armature.
    // Preserve its bind transforms; scale the outer group, not the skeleton root.
    object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.frustumCulled = false;
      }
    });
    return object;
  }, [scene]);
  const bones = useMemo(() => {
    const result = new Map<string, { bone: THREE.Bone; rest: THREE.Quaternion }>();
    character.traverse((node) => {
      if (node instanceof THREE.Bone)
        result.set(node.name, { bone: node, rest: node.quaternion.clone() });
    });
    return result;
  }, [character]);
  const basis = useMemo(() => {
    character.updateWorldMatrix(true, true);
    const at = (name: string) =>
      character.getObjectByName(name)?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3();
    const side = at("LeftArm").sub(at("RightArm")).setY(0).normalize();
    // The model's face points +Z; headfront is a tilted auxiliary bone, not a facing axis.
    const forward = new THREE.Vector3(0, 0, 1);
    return { side, forward, up: new THREE.Vector3(0, 1, 0) };
  }, [character]);
  const blinkMeshes = useMemo(() => {
    const list: { mesh: THREE.Mesh; idx: number }[] = [];
    character.traverse((n) => {
      if (n instanceof THREE.Mesh && n.morphTargetDictionary)
        Object.entries(n.morphTargetDictionary).forEach(([k, idx]) => {
          if (/blink|eyesclosed/i.test(k)) list.push({ mesh: n, idx });
        });
    });
    return list;
  }, [character]);
  const body = useRef<THREE.Group>(null);
  const rose = useRef<THREE.Group>(null);
  const time = useRef(0);
  const phase = useRef(0);
  const offset = useMemo(() => new THREE.Quaternion(), []);
  const target = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const handPosition = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    phase.current = 0;
  }, [action, burst]);
  const scratch = useMemo(
    () => ({
      pw: new THREE.Quaternion(),
      w: new THREE.Quaternion(),
      r: new THREE.Quaternion(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
    }),
    [],
  );
  const dir = (s: number, f: number, u: number, mirror = 1) =>
    scratch.d
      .set(0, 0, 0)
      .addScaledVector(basis.side, s * mirror)
      .addScaledVector(basis.forward, f)
      .addScaledVector(basis.up, u)
      .normalize()
      .clone();
  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    time.current += dt;
    phase.current += dt;
    const t = time.current;
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, 1.95, 3, dt);
    state.camera.lookAt(0, 1.62, 0);
    const pose = (name: string, x = 0, y = 0, z = 0) => {
      const entry = bones.get(name);
      if (!entry) return;
      offset.setFromEuler(euler.set(x, y, z));
      target.copy(entry.rest).multiply(offset);
      entry.bone.quaternion.slerp(target, 1 - Math.exp(-5 * dt));
    };
    // Aim each arm segment at a world direction (robust to the rig's rest pose).
    const aim = (name: string, child: string, target: THREE.Vector3) => {
      const entry = bones.get(name);
      const next = bones.get(child);
      if (!entry?.bone.parent || !next) return;
      entry.bone.parent.updateWorldMatrix(true, false);
      entry.bone.parent.getWorldQuaternion(scratch.pw);
      scratch.w.copy(scratch.pw).multiply(entry.rest);
      scratch.c.copy(next.bone.position).normalize().applyQuaternion(scratch.w);
      scratch.r.setFromUnitVectors(scratch.c, target);
      scratch.w.premultiply(scratch.r);
      const local = scratch.pw.clone().invert().multiply(scratch.w);
      entry.bone.quaternion.slerp(local, 1 - Math.exp(-6 * dt));
      entry.bone.updateWorldMatrix(false, false);
    };
    const breathe = Math.sin(t * 1.7) * 0.03;
    const kp = phase.current;
    // Default: standing, both hands cradle the rose in front of the chest.
    const chestL = () => {
      aim("LeftArm", "LeftForeArm", dir(0.16 + breathe, 0.38, -0.9));
      aim("LeftForeArm", "LeftHand", dir(-0.6, 0.72, 0.38));
    };
    const chestR = () => {
      aim("RightArm", "RightForeArm", dir(-0.16 - breathe, 0.38, -0.9));
      aim("RightForeArm", "RightHand", dir(0.6, 0.72, 0.38));
    };
    if (action === "rose") {
      // Both hands extend gently toward the viewer, presenting the rose.
      aim("LeftArm", "LeftForeArm", dir(0.1, 0.9, -0.42));
      aim("LeftForeArm", "LeftHand", dir(-0.22, 1, 0.08));
      aim("RightArm", "RightForeArm", dir(-0.1, 0.9, -0.42));
      aim("RightForeArm", "RightHand", dir(0.22, 1, 0.08));
    } else if (action === "kiss" && kp < 1.5) {
      chestL();
      aim("RightArm", "RightForeArm", dir(-0.3, 0.62, -0.7));
      aim("RightForeArm", "RightHand", dir(0.45, 0.18, 1));
    } else if (action === "kiss" && kp < 2.6) {
      chestL();
      aim("RightArm", "RightForeArm", dir(-0.25, 1, -0.2));
      aim("RightForeArm", "RightHand", dir(-0.1, 1, 0.35));
    } else {
      chestL();
      chestR();
    }
    // Subtle eye blinks when the model exposes blink shapes.
    const blink = t % 3.8 < 0.13 ? 1 : 0;
    blinkMeshes.forEach(({ mesh, idx }) => {
      if (mesh.morphTargetInfluences)
        mesh.morphTargetInfluences[idx] = THREE.MathUtils.damp(
          mesh.morphTargetInfluences[idx] ?? 0,
          blink,
          30,
          dt,
        );
    });
    // Keep the face oriented toward the viewer; pointer motion must not break eye contact.
    const head = bones.get("Head");
    if (head?.bone.parent) {
      head.bone.parent.getWorldQuaternion(scratch.pw);
      scratch.r
        .setFromAxisAngle(basis.up, Math.sin(t * 0.5) * 0.015)
        .multiply(new THREE.Quaternion().setFromAxisAngle(basis.side, Math.sin(t * 0.7) * 0.012));
      const localOffset = scratch.pw.clone().invert().multiply(scratch.r).multiply(scratch.pw);
      head.bone.quaternion.slerp(localOffset.multiply(head.rest), 1 - Math.exp(-4 * dt));
    }
    pose("Spine02", Math.sin(t * 1.7) * 0.015);
    pose("LeftUpLeg");
    pose("LeftLeg");
    pose("RightUpLeg");
    pose("RightLeg");
    if (body.current) {
      const height = Math.sin(t * 1.7) * 0.012;
      body.current.position.y = THREE.MathUtils.damp(body.current.position.y, height, 5, dt);
      body.current.rotation.y = Math.sin(t * 0.65) * 0.008;
    }
    if (rose.current) {
      const right = bones.get("RightHand")?.bone;
      const left = bones.get("LeftHand")?.bone;
      if (right && left) {
        character.updateWorldMatrix(true, true);
        left.getWorldPosition(handPosition);
        const kissing = action === "kiss" && kp < 2.6;
        if (!kissing) {
          right.getWorldPosition(scratch.a);
          handPosition.add(scratch.a).multiplyScalar(0.5);
        }
        rose.current.position.lerp(
          handPosition.add(scratch.b.set(0, 0.16, 0.05)),
          1 - Math.exp(-12 * dt),
        );
      }
    }
  });
  return (
    <>
      <group
        ref={body}
        scale={2.8 / 1.8}
        onClick={(event) => {
          event.stopPropagation();
          onTap();
        }}
      >
        <primitive object={character} dispose={null} />
      </group>
      <group ref={rose} scale={0.5}>
        <Rose palette={palette} />
      </group>
    </>
  );
}

function Rose({ palette }: { palette: Palette }) {
  const petal = useMemo(curvedPetal, []);
  const texture = useMemo(() => petalTexture(palette.rose), [palette.rose]);
  useEffect(
    () => () => {
      petal.dispose();
      texture.dispose();
    },
    [petal, texture],
  );
  return (
    <group>
      <mesh position-y={-0.2}>
        <cylinderGeometry args={[0.012, 0.014, 0.6, 8]} />
        <meshStandardMaterial color={palette.leaf} />
      </mesh>
      <mesh position={[0.07, -0.2, 0]} rotation-z={-0.8} scale={[1, 0.4, 0.2]}>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial color={palette.leaf} />
      </mesh>
      {Array.from({ length: 22 }, (_, i) => {
        const angle = i * 2.4;
        const radius = 0.025 + i * 0.004;
        return (
          <mesh
            key={i}
            geometry={petal}
            dispose={null}
            position={[Math.cos(angle) * radius, 0.1 - i * 0.002, Math.sin(angle) * radius]}
            rotation={[0.25 + i * 0.025, angle, 0.15]}
            scale={[0.14 + i * 0.003, 0.19, 0.16]}
          >
            <meshStandardMaterial
              map={texture}
              emissive={palette.rose}
              emissiveIntensity={0.12}
              roughness={0.62}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      <pointLight position-y={0.15} color={palette.rose} intensity={0.25} distance={1.5} />
    </group>
  );
}

function RomanticParticles({
  action,
  burst,
  palette,
}: {
  action: Action;
  burst: number;
  palette: Palette;
}) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  useEffect(() => {
    time.current = 0;
  }, [action, burst]);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(-1, 0.1, -0.7, 1, 0, 0.45);
    s.bezierCurveTo(0.7, 1, 1, 0.1, 0, -0.5);
    return s;
  }, []);
  const heart = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelSize: 0.08,
        bevelThickness: 0.08,
        bevelSegments: 2,
        steps: 1,
      }),
    [shape],
  );
  useEffect(() => () => heart.dispose(), [heart]);
  const petal = useMemo(curvedPetal, []);
  const texture = useMemo(() => petalTexture(palette.rose), [palette.rose]);
  useEffect(
    () => () => {
      petal.dispose();
      texture.dispose();
    },
    [petal, texture],
  );
  useFrame((_, raw) => {
    time.current += Math.min(raw, 0.05);
    group.current?.children.forEach((mesh, i) => {
      const t = (time.current + i * 0.23) % 4;
      if (action === "kiss") {
        mesh.visible = t > 1.2;
        const flight = Math.max(0, t - 1.2);
        mesh.position.set(
          Math.sin(i * 2.4) * flight * 0.65,
          2.35 + flight * 0.25,
          0.4 + flight * 0.75,
        );
        mesh.scale.setScalar(0.08 + flight * 0.03);
        mesh.rotation.set(0, Math.sin(t) * 0.4, Math.sin(i) * 0.2);
      } else {
        mesh.position.set(
          Math.sin(i * 2.4) * t * 0.35 + Math.sin(t * 2.3 + i) * 0.13 * t,
          1.75 + Math.cos(i * 1.7) * t * 0.22 - 0.035 * t * t + Math.sin(t * 3 + i) * 0.04,
          0.6 + t * 0.95,
        );
        mesh.rotation.set(
          t * 0.7 + Math.sin(t * 4 + i) * 0.3,
          t * 0.6,
          i + Math.sin(t * 2 + i) * 0.45,
        );
        mesh.scale.set(0.11, 0.13, 0.11);
      }
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} geometry={action === "kiss" ? heart : petal} dispose={null}>
          <meshStandardMaterial
            map={action === "rose" ? texture : null}
            color={action === "rose" ? palette.light : palette.rose}
            emissive={palette.rose}
            emissiveIntensity={action === "kiss" ? 1.3 : 0.08}
            roughness={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function HumanoidScene({
  action,
  burst,
  onTap,
}: {
  action: Action;
  burst: number;
  onTap: () => void;
}) {
  const [palette, setPalette] = useState<Palette | null>(null);
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const token = (name: string) => style.getPropertyValue(name).trim();
    setPalette({
      wine: token("--avatar-wine"),
      light: token("--avatar-light"),
      rose: token("--avatar-rose"),
      leaf: token("--avatar-leaf"),
    });
  }, []);
  if (!palette) return null;
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.95, 5], fov: 38 }}
      onCreated={({ camera }) => camera.lookAt(0, 1.62, 0)}
    >
      <color attach="background" args={[palette.wine]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[2, 4, 4]}
        intensity={2.2}
        color={palette.light}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -1]} intensity={1.5} color={palette.rose} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 6, 1]} color={palette.light} />
        <Lightformer
          intensity={1}
          position={[-4, 2, 0]}
          rotation-y={Math.PI / 2}
          scale={[6, 6, 1]}
          color={palette.rose}
        />
      </Environment>
      <Suspense
        fallback={
          <Html center>
            <p className="script text-2xl text-gold-soft">A little magic is on its way…</p>
          </Html>
        }
      >
        <Character action={action} burst={burst} onTap={onTap} palette={palette} />
      </Suspense>
      <ContactShadows
        position={[0, -0.02, 0]}
        opacity={0.55}
        scale={5}
        blur={2.5}
        far={4}
        frames={1}
      />
      {action !== "idle" && <RomanticParticles action={action} burst={burst} palette={palette} />}
      <Sparkles
        count={17}
        scale={[4, 3.5, 2]}
        position={[0, 1.5, 0]}
        size={2}
        speed={0.25}
        color={palette.light}
      />
    </Canvas>
  );
}
useGLTF.preload(modelAsset.url);
