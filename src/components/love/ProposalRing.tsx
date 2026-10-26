import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Sparkles } from "lucide-react";

interface ProposalRingProps {
  isOpen: boolean;
}

/**
 * Creates a procedural 3D round brilliant cut diamond BufferGeometry
 * with 96 independent facets and facet-separated flat normals
 * to create authentic specular flash and fire.
 */
function createDiamondGeometry(radius = 0.48, height = 0.62): THREE.BufferGeometry {
  const positions: number[] = [];
  const tableY = height * 0.35;
  const tableRadius = radius * 0.56;
  const starY = height * 0.28;
  const starRadius = radius * 0.78;
  const girdleY1 = 0;
  const girdleY2 = -height * 0.05;
  const culetY = -height * 0.75;
  const culet: [number, number, number] = [0, culetY, 0];
  const tableCenter: [number, number, number] = [0, tableY, 0];

  const tv: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    tv.push([tableRadius * Math.cos(a), tableY, tableRadius * Math.sin(a)]);
  }

  const sv: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    sv.push([starRadius * Math.cos(a), starY, starRadius * Math.sin(a)]);
  }

  const gv1: [number, number, number][] = [];
  const gv2: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    gv1.push([radius * Math.cos(a), girdleY1, radius * Math.sin(a)]);
    gv2.push([radius * Math.cos(a), girdleY2, radius * Math.sin(a)]);
  }

  function addTri(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
  ) {
    positions.push(...p1, ...p2, ...p3);
  }

  // 1. Octagonal Table facets
  for (let i = 0; i < 8; i++) {
    addTri(tableCenter, tv[i]!, tv[(i + 1) % 8]!);
  }

  // 2. Star facets
  for (let i = 0; i < 8; i++) {
    addTri(tv[i]!, tv[(i + 1) % 8]!, sv[i]!);
  }

  // 3. Bezel (Kite) facets & Upper girdle
  for (let i = 0; i < 8; i++) {
    const prevStar = sv[(i + 7) % 8]!;
    const currStar = sv[i]!;
    const g0 = gv1[(i * 2 + 15) % 16]!;
    const g1 = gv1[i * 2]!;
    const g2 = gv1[i * 2 + 1]!;

    // Kite facet: tv[i], prevStar, g1, currStar
    addTri(tv[i]!, prevStar, g1);
    addTri(tv[i]!, g1, currStar);

    // Upper girdle:
    addTri(currStar, g1, g2);
    const nextG0 = gv1[(i * 2 + 2) % 16]!;
    addTri(currStar, g2, nextG0);
  }

  // 4. Girdle facets
  for (let i = 0; i < 16; i++) {
    const next = (i + 1) % 16;
    addTri(gv1[i]!, gv2[i]!, gv1[next]!);
    addTri(gv1[next]!, gv2[i]!, gv2[next]!);
  }

  // 5. Pavilion facets converging to culet point
  for (let i = 0; i < 16; i++) {
    const next = (i + 1) % 16;
    addTri(gv2[i]!, culet, gv2[next]!);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

export function ProposalRing({ isOpen }: ProposalRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Interaction refs
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startRotX = useRef(0);
  const startRotY = useRef(0);
  const rotX = useRef(-0.15);
  const rotY = useRef(0.2);
  const velX = useRef(0);
  const velY = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Detect software WebGL to adapt quality
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement("canvas").getContext("webgl2");
        if (!probe) return true;
        const ext = probe.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 260;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 4.3);
    camera.lookAt(0, 0.1, 0);

    // 3. Studio Environment Map for Specular Metals & Diamond Facets
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ea, 3.2);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd5e8ff, 2.2);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const sparkleLight = new THREE.PointLight(0xffffff, 4.5, 10);
    sparkleLight.position.set(0, 3, 2.5);
    scene.add(sparkleLight);

    const velvetBounce = new THREE.PointLight(0x8a0f26, 1.6, 6);
    velvetBounce.position.set(0, -2, 0);
    scene.add(velvetBounce);

    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0x2b040c, 1.2);
    scene.add(hemiLight);

    // 5. Procedural 3D Solitaire Ring Assembly
    const ringGroup = new THREE.Group();

    // Platinum Metal Material
    const platinumMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2f4f8,
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 2.4,
    });

    // 5a. Metallic Platinum Band (Standing Torus Shank)
    const bandGeo = new THREE.TorusGeometry(1.08, 0.11, 24, 64);
    const bandMesh = new THREE.Mesh(bandGeo, platinumMat);
    ringGroup.add(bandMesh);

    // 5b. Head Setting: Under-gallery collar
    const collarGeo = new THREE.TorusGeometry(0.38, 0.03, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeo, platinumMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.02, 0);
    ringGroup.add(collarMesh);

    // 5c. 4 Platinum Claw Prongs holding the elevated diamond
    const prongGeo = new THREE.CylinderGeometry(0.026, 0.036, 0.42, 12);
    const clawTipGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const rProng = 0.42;

    for (let i = 0; i < 4; i++) {
      const alpha = (i * Math.PI) / 2 + Math.PI / 4;
      const px = rProng * Math.cos(alpha);
      const pz = rProng * Math.sin(alpha);

      const prong = new THREE.Mesh(prongGeo, platinumMat);
      prong.position.set(px, 1.18, pz);
      prong.rotation.z = -Math.cos(alpha) * 0.14;
      prong.rotation.x = Math.sin(alpha) * 0.14;
      ringGroup.add(prong);

      const clawTip = new THREE.Mesh(clawTipGeo, platinumMat);
      clawTip.position.set(px * 0.92, 1.36, pz * 0.92);
      ringGroup.add(clawTip);
    }

    // 5d. Solitaire Brilliant Diamond Gemstone
    const diamondGeo = createDiamondGeometry(0.48, 0.62);
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: isSoftwareGl ? 0 : 0.95,
      opacity: 1.0,
      transparent: true,
      ior: 2.417, // Natural diamond refraction index
      roughness: 0.0,
      metalness: 0.0,
      reflectivity: 0.98,
      thickness: 1.6,
      attenuationColor: new THREE.Color(0xdcf8ff),
      attenuationDistance: 1.8,
      dispersion: 0.044, // Chromatic prism fire in Three.js
      flatShading: true, // Distinct crystalline facet highlights
      envMapIntensity: 3.6,
    });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.position.set(0, 1.25, 0);
    ringGroup.add(diamondMesh);

    // Center ring group around its visual core
    ringGroup.position.set(0, -0.6, 0);
    scene.add(ringGroup);

    // 6. Animation and Smooth Inertial Render Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging.current) {
        // Inertia decay
        rotY.current += velY.current * delta * 60;
        rotX.current += velX.current * delta * 60;
        rotX.current = THREE.MathUtils.clamp(rotX.current, -1.1, 1.1);
        velY.current *= Math.pow(0.9, delta * 60);
        velX.current *= Math.pow(0.9, delta * 60);

        // When almost stopped, gentle idle float & breathing bob
        if (Math.abs(velY.current) < 0.005 && Math.abs(velX.current) < 0.005) {
          rotY.current += 0.008;
          const bob = Math.sin(elapsedTime * 1.6) * 0.06;
          ringGroup.position.y = -0.6 + bob;
        }
      }

      ringGroup.rotation.y = rotY.current;
      ringGroup.rotation.x = rotX.current;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Resize Observer for crisp responsive canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      bandGeo.dispose();
      collarGeo.dispose();
      prongGeo.dispose();
      clawTipGeo.dispose();
      diamondGeo.dispose();
      platinumMat.dispose();
      diamondMat.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    startRotX.current = rotX.current;
    startRotY.current = rotY.current;
    velX.current = 0;
    velY.current = 0;
    lastTime.current = performance.now();
    setHasInteracted(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = Math.max((now - lastTime.current) / 1000, 0.001);
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;

    velY.current = (dx / dt) * 0.00018;
    velX.current = (dy / dt) * 0.00018;

    lastX.current = e.clientX;
    lastY.current = e.clientY;
    lastTime.current = now;

    const totalDx = e.clientX - startX.current;
    const totalDy = e.clientY - startY.current;

    rotY.current = startRotY.current + totalDx * 0.012;
    rotX.current = THREE.MathUtils.clamp(startRotX.current + totalDy * 0.012, -1.1, 1.1);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-1000 select-none ${
        isOpen ? "scale-105 -translate-y-1" : "opacity-0 scale-95"
      }`}
    >
      {/* 3D WebGL Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="relative size-[270px] sm:size-[300px] cursor-grab active:cursor-grabbing p-1 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="Interactive 3D Solitaire Diamond Ring. Drag finger to rotate 360 degrees."
      >
        <canvas
          ref={canvasRef}
          className="size-full transform-gpu will-change-transform filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.92)]"
        />
      </div>

      {/* Ring Metadata & Rotation Hint */}
      <div className="mt-1 flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-gold-soft font-sans font-medium">
          <Sparkles className="size-3 text-gold-soft" /> Virtual 3D Solitaire Diamond Ring
        </div>
        <p
          className={`text-[0.65rem] font-sans tracking-wider text-warm/60 transition-opacity duration-500 ${
            hasInteracted ? "opacity-35" : "opacity-85"
          }`}
        >
          {hasInteracted
            ? "360° Rotatable Virtual Ring"
            : "Drag with finger to inspect ring in 3D 💍"}
        </p>
      </div>
    </div>
  );
}
