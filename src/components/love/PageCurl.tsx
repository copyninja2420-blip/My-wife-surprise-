import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function CurlSheet({ title }: { title: string }) {
  const { viewport } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const back = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const parchment = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue("--notebook-paper").trim(),
    [],
  );
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(viewport.width, viewport.height, 80, 2),
    [viewport.width, viewport.height],
  );
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = styles.getPropertyValue("--notebook-paper").trim();
    ctx.fillRect(0, 0, 768, 1024);
    ctx.fillStyle = styles.getPropertyValue("--notebook-ink").trim();
    for (let i = 0; i < 12000; i++) {
      ctx.globalAlpha = 0.015 + (i % 4) * 0.006;
      ctx.fillRect((i * 73) % 768, (i * 157) % 1024, 1, 1);
    }
    ctx.globalAlpha = 1;
    const shade = ctx.createLinearGradient(0, 0, 768, 0);
    shade.addColorStop(0, styles.getPropertyValue("--journal-shadow").trim());
    shade.addColorStop(0.08, "transparent");
    shade.addColorStop(0.9, "transparent");
    shade.addColorStop(1, styles.getPropertyValue("--journal-shadow").trim());
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, 768, 1024);
    ctx.strokeStyle = styles.getPropertyValue("--journal-gold").trim();
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, 724, 980);
    ctx.strokeRect(30, 30, 708, 964);
    ctx.fillStyle = styles.getPropertyValue("--notebook-ink").trim();
    ctx.textAlign = "center";
    ctx.font = "italic 46px Georgia";
    const words = title.split(" ");
    const split = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, split).join(" "), 384, 472, 650);
    ctx.fillText(words.slice(split).join(" "), 384, 534, 650);
    ctx.font = "56px Georgia";
    ctx.fillText("❦", 384, 660);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    setTexture(map);
    return () => map.dispose();
  }, [title]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, raw) => {
    elapsed.current += Math.min(raw, 0.05);
    const p = Math.min(elapsed.current / 1.15, 1);
    const eased = p * p * (3 - 2 * p);
    const angle = eased * Math.PI * 0.98;
    const positions = geometry.attributes["position"];
    if (!positions) return;
    const w = viewport.width;
    for (let i = 0; i < positions.count; i++) {
      const column = i % 81;
      const u = column / 80;
      const bend = Math.sin(p * Math.PI) * 1.15;
      const a = angle + u * bend;
      const distance = u * w;
      positions.setX(i, -w / 2 + Math.cos(a) * distance);
      positions.setZ(i, Math.sin(a) * distance * 0.38 + Math.sin(u * Math.PI) * bend * w * 0.16);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    const fade = p > 0.82 ? (1 - p) / 0.18 : 1;
    [mesh.current?.material, back.current?.material].forEach((m) => {
      if (m instanceof THREE.MeshStandardMaterial) m.opacity = fade;
    });
  });
  return (
    <>
      <mesh ref={mesh} geometry={geometry} dispose={null}>
        <meshStandardMaterial
          map={texture}
          side={THREE.FrontSide}
          roughness={0.88}
          metalness={0}
          transparent
        />
      </mesh>
      <mesh ref={back} geometry={geometry} dispose={null}>
        <meshStandardMaterial
          map={texture}
          color={parchment}
          side={THREE.BackSide}
          roughness={0.95}
          transparent
        />
      </mesh>
    </>
  );
}

export default function PageCurl({ title }: { title: string }) {
  return (
    <div className="page-curl-overlay" aria-hidden="true">
      <div className="page-curl-underlay" />
      <Canvas
        orthographic
        dpr={1}
        camera={{ position: [0, 0, 12], zoom: 100 }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 1, 8]} intensity={2} />
        <CurlSheet title={title} />
      </Canvas>
    </div>
  );
}
