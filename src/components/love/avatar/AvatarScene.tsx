import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export type AvatarPose = "rose" | "kiss";

const SKIN = "#d9a07c";
const HAIR = "#1c120d";
const SHIRT = "#f5bfcb";
const IRIS = "#7a4321";

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.35);
  s.bezierCurveTo(-0.65, -0.85, -1.05, -0.15, -0.7, 0.35);
  s.bezierCurveTo(-0.4, 0.75, 0, 0.55, 0, 0.25);
  s.bezierCurveTo(0, 0.55, 0.4, 0.75, 0.7, 0.35);
  s.bezierCurveTo(1.05, -0.15, 0.65, -0.85, 0, -0.35);
  return s;
}

/** Hair texture: fine noisy strands so the pompadour reads as textured, not plastic. */
function useHairTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2a1b13";
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) {
      g.strokeStyle = `rgba(${10 + Math.random() * 40},${6 + Math.random() * 20},4,0.8)`;
      g.lineWidth = 1;
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.random() * 6 - 3, y - 6 - Math.random() * 6);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
}

function Eye({ x }: { x: number }) {
  return (
    <group position={[x, 0.08, 0.44]}>
      <mesh scale={[1, 1.15, 0.7]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#fffaf5" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.01, 0.075]} scale={[1, 1.1, 0.5]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color={IRIS} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.01, 0.11]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshStandardMaterial color="#120805" />
      </mesh>
      <mesh position={[0.03, 0.035, 0.125]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Head({ pucker }: { pucker: React.MutableRefObject<number> }) {
  const hairTex = useHairTexture();
  const smile = useRef<THREE.Mesh>(null);
  const kissLips = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = pucker.current;
    if (smile.current) smile.current.scale.setScalar(Math.max(0.001, 1 - p));
    if (kissLips.current) kissLips.current.scale.setScalar(Math.max(0.001, p));
  });
  const hair = <meshStandardMaterial map={hairTex} color={HAIR} roughness={0.85} />;
  return (
    <group position={[0, 1.55, 0]}>
      {/* skull */}
      <mesh castShadow scale={[1, 1.1, 0.98]}>
        <sphereGeometry args={[0.55, 40, 40]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {/* ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.54 * s, 0.02, -0.02]} scale={[0.5, 1, 0.8]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      ))}
      {/* fade: short dark cap on sides/back */}
      <mesh position={[0, 0.06, -0.03]} scale={[1.03, 1.08, 1.0]}>
        <sphereGeometry args={[0.56, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.95} transparent opacity={0.92} />
      </mesh>
      {/* pompadour volume */}
      <group position={[0, 0.5, 0.05]}>
        {[
          [0, 0.08, 0.28, 0.3, -0.5],
          [-0.2, 0.04, 0.2, 0.26, -0.3],
          [0.2, 0.05, 0.2, 0.26, -0.3],
          [0, 0.12, 0.05, 0.32, -0.2],
          [-0.24, 0.0, -0.1, 0.24, 0],
          [0.24, 0.0, -0.1, 0.24, 0],
          [0, 0.05, -0.22, 0.28, 0.2],
          [0.08, 0.16, 0.38, 0.18, -0.8],
        ].map(([x = 0, y = 0, z = 0, r = 0.2, rx = 0], i) => (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[rx, i * 0.7, 0]}
            scale={[1.1, 0.75, 1]}
            castShadow
          >
            <icosahedronGeometry args={[r, 2]} />
            {hair}
          </mesh>
        ))}
      </group>
      {/* brows */}
      {[-1, 1]
        .map((s) => (
          <mesh key={s} position={[0.19 * s, 0.3, 0.5]} rotation={[0, 0, -0.12 * s]}>
            <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
            <meshStandardMaterial color={HAIR} />
          </mesh>
        ))
        .map((m) => m)}
      <Eye x={-0.19} />
      <Eye x={0.19} />
      {/* nose */}
      <mesh position={[0, -0.06, 0.54]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#d08f6c" roughness={0.5} />
      </mesh>
      {/* cheeks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.32 * s, -0.12, 0.42]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#f08a8a" transparent opacity={0.45} />
        </mesh>
      ))}
      {/* smile */}
      <mesh ref={smile} position={[0, -0.24, 0.5]} rotation={[0.2, 0, Math.PI]}>
        <torusGeometry args={[0.13, 0.028, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#8a2e2e" />
      </mesh>
      {/* kiss lips */}
      <mesh ref={kissLips} position={[0, -0.25, 0.53]}>
        <torusGeometry args={[0.045, 0.025, 8, 16]} />
        <meshStandardMaterial color="#c2475a" />
      </mesh>
    </group>
  );
}

function Rose() {
  const petals = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        a: (i / 9) * Math.PI * 2,
        r: i < 3 ? 0.03 : 0.07,
        tilt: i < 3 ? 0.2 : 0.7,
      })),
    [],
  );
  return (
    <group>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
        <meshStandardMaterial color="#2f6b34" />
      </mesh>
      <mesh position={[0.05, -0.3, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.4, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#3d8a42" />
      </mesh>
      <group position={[0, 0.02, 0]}>
        {petals.map((p, i) => (
          <mesh
            key={i}
            position={[Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r]}
            rotation={[p.tilt, p.a, 0]}
            scale={[1, 1.1, 0.4]}
          >
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial
              color="#c3122f"
              emissive="#ff1f45"
              emissiveIntensity={0.9}
              roughness={0.4}
            />
          </mesh>
        ))}
        <pointLight color="#ff3355" intensity={3} distance={2.5} />
      </group>
    </group>
  );
}

function FallingPetals() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 26;
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 4,
        z: (Math.random() - 0.5) * 2,
        s: 0.3 + Math.random() * 0.4,
        r: Math.random() * 6,
      })),
    [],
  );
  const m = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!ref.current) return;
    data.forEach((d, i) => {
      d.y -= dt * d.s * 0.6;
      d.r += dt * d.s * 2;
      if (d.y < -1.2) d.y = 3.5;
      m.position.set(d.x + Math.sin(d.r) * 0.2, d.y, d.z);
      m.rotation.set(d.r, d.r * 0.7, 0);
      m.updateMatrix();
      ref.current!.setMatrixAt(i, m.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <circleGeometry args={[0.06, 8]} />
      <meshStandardMaterial
        color="#d31a3c"
        emissive="#ff2a52"
        emissiveIntensity={0.6}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

function FlyingHearts({ burst }: { burst: number }) {
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(heartShape(), {
        depth: 0.15,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        bevelSegments: 2,
      }),
    [],
  );
  const group = useRef<THREE.Group>(null);
  const hearts = useRef<{ t: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const last = useRef(burst);
  const clock = useRef(0);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    clock.current += dt;
    if (burst !== last.current || clock.current > 4) {
      last.current = burst;
      clock.current = 0;
      for (let i = 0; i < 7; i++)
        hearts.current.push({
          t: -i * 0.12,
          x: 0.35,
          y: 1.3,
          vx: (Math.random() - 0.5) * 1.4,
          vy: Math.random() * 0.8 + 0.2,
        });
    }
    hearts.current = hearts.current.filter((h) => h.t < 2.2);
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const h = hearts.current[i];
      if (!h || h.t < 0) {
        if (h) h.t += dt;
        c.visible = false;
        return;
      }
      h.t += dt;
      c.visible = true;
      c.position.set(
        h.x + h.vx * h.t,
        h.y + h.vy * h.t + Math.sin(h.t * 6) * 0.05,
        0.6 + h.t * 2.2,
      );
      const s = 0.12 + h.t * 0.12;
      c.scale.setScalar(s);
      c.rotation.set(0, Math.sin(h.t * 3) * 0.5, Math.PI);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 21 }, (_, i) => (
        <mesh key={i} geometry={geo} visible={false}>
          <meshStandardMaterial
            color="#ff4f7b"
            emissive="#ff6f96"
            emissiveIntensity={1.4}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Avatar({ pose }: { pose: AvatarPose }) {
  const body = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const pucker = useRef(0);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!body.current || !rArm.current || !lArm.current) return;
    body.current.position.y = Math.sin(t * 1.6) * 0.03;
    if (pose === "rose") {
      body.current.rotation.x = 0.16 + Math.sin(t * 0.9) * 0.06;
      rArm.current.rotation.set(-1.25 + Math.sin(t * 0.9) * 0.08, 0, 0.15);
      lArm.current.rotation.set(0, 0, -0.18);
      pucker.current = 0;
    } else {
      // 4s kiss cycle: raise hand to lips, pucker, then throw outwards
      const c = (t % 4) / 4;
      const toLips = c < 0.35 ? c / 0.35 : c < 0.55 ? 1 : Math.max(0, 1 - (c - 0.55) / 0.15);
      const throwOut = c > 0.55 && c < 0.85 ? Math.sin(((c - 0.55) / 0.3) * Math.PI) : 0;
      rArm.current.rotation.set(-2.4 * toLips - 1.4 * throwOut, 0, 0.6 * toLips - 0.2 * throwOut);
      lArm.current.rotation.set(0, 0, -0.18);
      body.current.rotation.x = 0.05 + throwOut * 0.08;
      pucker.current = c > 0.3 && c < 0.62 ? 1 : 0;
    }
  });
  const sleeve = <meshStandardMaterial color={SHIRT} roughness={0.7} />;
  return (
    <group ref={body}>
      {/* torso */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.42, 0.55, 8, 20]} />
        {sleeve}
      </mesh>
      {/* collar */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[0.11 * s, 0.98, 0.18]}
          rotation={[0.4, 0, 0.6 * s]}
          scale={[1, 0.5, 0.2]}
        >
          <boxGeometry args={[0.2, 0.18, 0.1]} />
          <meshStandardMaterial color="#f9d3db" />
        </mesh>
      ))}
      {[0.75, 0.55, 0.35].map((y) => (
        <mesh key={y} position={[0, y, 0.42]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.18, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <Head pucker={pucker} />
      {/* arms pivot at shoulders */}
      <group ref={rArm} position={[0.5, 0.82, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.45, 6, 12]} />
          {sleeve}
        </mesh>
        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        {pose === "rose" && (
          <group position={[0, -0.78, 0.05]} rotation={[Math.PI, 0, 0]}>
            <Rose />
          </group>
        )}
      </group>
      <group ref={lArm} position={[-0.5, 0.82, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.45, 6, 12]} />
          {sleeve}
        </mesh>
        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
      </group>
    </group>
  );
}

export default function AvatarScene({ pose, burst = 0 }: { pose: AvatarPose; burst?: number }) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.3, 4.2], fov: 38 }}>
      <color attach="background" args={["#1d0610"]} />
      <fog attach="fog" args={["#1d0610", 5, 11]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffe6d2"
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#ff8fb0" />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 10, 1]} color="#ffd9c4" />
        <Lightformer
          intensity={1}
          color="#ff7aa0"
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[20, 1, 1]}
        />
      </Environment>
      <group position={[0, -0.4, 0]}>
        <Avatar pose={pose} />
      </group>
      <ContactShadows position={[0, -0.45, 0]} opacity={0.5} scale={5} blur={2.5} far={2} />
      {pose === "rose" ? <FallingPetals /> : <FlyingHearts burst={burst} />}
      <Sparkles
        count={40}
        scale={[5, 3.5, 2]}
        position={[0, 1, 0]}
        size={3}
        speed={0.3}
        color={pose === "rose" ? "#ffcf8a" : "#ff9fba"}
      />
    </Canvas>
  );
}
