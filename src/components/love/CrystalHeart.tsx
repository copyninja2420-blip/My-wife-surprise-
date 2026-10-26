import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

let geometry: THREE.ExtrudeGeometry | undefined;
let palette: { color: string; light: string } | undefined;
export function preloadCrystalHeart() {
  if (!geometry) {
    // Smooth, organic heart silhouette with deep rounded bevels.
    const s = new THREE.Shape();
    s.moveTo(0, -1);
    s.bezierCurveTo(-0.35, -0.62, -1.35, -0.2, -1.2, 0.45);
    s.bezierCurveTo(-1.08, 1.02, -0.32, 1.12, 0, 0.62);
    s.bezierCurveTo(0.32, 1.12, 1.08, 1.02, 1.2, 0.45);
    s.bezierCurveTo(1.35, -0.2, 0.35, -0.62, 0, -1);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSize: 0.32,
      bevelThickness: 0.38,
      bevelSegments: 10,
      curveSegments: 36,
    });
    g.center();
    g.computeVertexNormals();
    geometry = g;
  }
  const styles = getComputedStyle(document.documentElement);
  palette = {
    color: styles.getPropertyValue("--avatar-rose").trim(),
    light: styles.getPropertyValue("--avatar-light").trim(),
  };
  return palette;
}

function Ruby({
  color,
  light,
  progress,
  active,
}: {
  color: string;
  light: string;
  progress: number;
  active: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.PointLight>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const time = useRef(0);
  useFrame((_, delta) => {
    time.current += Math.min(delta, 0.05);
    if (!mesh.current) return;
    const phase = time.current * (active ? 5 + progress * 0.05 : 3);
    const beat = Math.pow(Math.max(0, Math.sin(phase)), 8);
    mesh.current.scale.setScalar(1 + beat * (0.06 + progress * 0.0012));
    mesh.current.rotation.y = Math.sin(time.current * 0.55) * 0.35;
    if (core.current) core.current.intensity = 2 + beat * 6 + progress * 0.04;
    if (mat.current) mat.current.emissiveIntensity = 0.18 + beat * 0.35 + progress * 0.004;
  });
  if (!geometry) return null;
  return (
    <>
      <mesh ref={mesh} geometry={geometry} dispose={null}>
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={color}
          roughness={0.06}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.76}
          sheen={0.4}
          sheenColor={light}
          transparent
          opacity={0.92}
        />
      </mesh>
      <pointLight ref={core} position={[0, 0, 0.2]} color={color} distance={4} />
      <Environment resolution={64}>
        <Lightformer position={[0, 3, 3]} scale={[3, 4, 1]} intensity={4} color={light} />
        <Lightformer position={[-3, 0, 2]} scale={[1, 3, 1]} intensity={3} color={light} />
        <Lightformer position={[3, -1, 2]} scale={[1, 2, 1]} intensity={2} />
      </Environment>
    </>
  );
}
export default function CrystalHeart({ progress, active }: { progress: number; active: boolean }) {
  const [colors] = useState(() => palette ?? preloadCrystalHeart());
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.6], fov: 40 }}
      gl={{ alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={3} color={colors.light} />
      <Ruby {...colors} progress={progress} active={active} />
    </Canvas>
  );
}
