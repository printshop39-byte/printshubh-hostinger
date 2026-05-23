/**
 * UNUSED — replaced by topographic-map-visual.tsx (pure SVG, no texture dependency)
 * This file can be safely deleted. It is no longer imported anywhere.
 *
 * earth-globe-canvas.tsx
 * Loaded ONLY on the client via dynamic() + ssr:false.
 * Renders the real Three.js Earth globe with satellite texture.
 */

"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Component, Suspense, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

/* ── Texture paths (served from Next.js public/) ── */
const EARTH_TEX = "/earth/earth-day.jpg";
const CLOUD_TEX = "/earth/earth-clouds.png";
const EARTH_RADIUS = 1.5;

/* ── Convert lat/lng to a 3D point on the sphere surface ── */
function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/* ── Atmospheric glow shell (rendered from inside) ── */
function AtmosphereGlow() {
  return (
    <mesh scale={1.055}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshBasicMaterial
        color={new THREE.Color(0x4fc3f7)}
        side={THREE.BackSide}
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Equatorial orbit ring ── */
function OrbitRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.76, 0.0035, 8, 160]} />
      <meshBasicMaterial color="#93c5fd" transparent opacity={0.32} />
    </mesh>
  );
}

/* ── Pulsing ring around the India marker ── */
function PulseRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % 2) / 2; // 0→1 every 2 s
    if (ref.current) {
      ref.current.scale.setScalar(1 + t * 2.2);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.75;
    }
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.055, 0.085, 32]} />
      <meshBasicMaterial
        color="#f59e0b"
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── India marker: dot + pulse ring + HTML label ── */
function IndiaMarker() {
  const normal = latLngToVec3(20.5937, 78.9629, 1).normalize();
  const pos = normal.clone().multiplyScalar(EARTH_RADIUS + 0.02);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );

  return (
    <group position={pos} quaternion={quaternion}>
      {/* Solid dot */}
      <mesh>
        <circleGeometry args={[0.055, 32]} />
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
      </mesh>
      {/* White outline ring */}
      <mesh>
        <ringGeometry args={[0.055, 0.076, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Animated pulse */}
      <PulseRing />
      {/* Label */}
      <Html
        center
        distanceFactor={5}
        position={[0.24, 0.06, 0]}
        transform
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <span
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(191,219,254,0.9)",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 900,
            color: "#1e3a8a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          🇮🇳 भारत
        </span>
      </Html>
    </group>
  );
}

/* ── Cloud layer — only rendered when cloud texture loads ── */
function CloudLayer() {
  const ref = useRef<THREE.Mesh>(null);
  let cloudTex: THREE.Texture;
  try {
    // useLoader throws if suspended; TextureErrorBoundary catches hard failures
    cloudTex = useLoader(THREE.TextureLoader, CLOUD_TEX);
  } catch {
    // Cloud texture missing or failed — skip cloud layer silently
    return null;
  }
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.042;
  });
  return (
    <mesh ref={ref} scale={1.018}>
      <sphereGeometry args={[EARTH_RADIUS, 96, 56]} />
      <meshStandardMaterial
        map={cloudTex}
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ── Earth sphere with real satellite texture ── */
function EarthSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const earthTex = useLoader(THREE.TextureLoader, EARTH_TEX);

  earthTex.colorSpace = THREE.SRGBColorSpace;
  earthTex.anisotropy = 4;

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.055;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[EARTH_RADIUS, 128, 72]} />
      <meshStandardMaterial
        map={earthTex}
        roughness={0.72}
        metalness={0.02}
      />
    </mesh>
  );
}

/* ── Fallback dark sphere shown while texture loads or on error ── */
function FallbackSphere({ showMessage }: { showMessage?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.055;
  });
  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 56]} />
        <meshStandardMaterial color={new THREE.Color(0x1a5276)} roughness={0.8} metalness={0.1} />
      </mesh>
      {showMessage && (
        <Html center>
          <div
            style={{
              background: "rgba(15,30,70,0.95)",
              border: "1px solid rgba(56,189,248,0.4)",
              borderRadius: 10,
              padding: "14px 20px",
              maxWidth: 220,
              textAlign: "center",
              color: "#93c5fd",
              fontSize: 12,
              lineHeight: 1.7,
              fontWeight: 600,
            }}
          >
            🌍 Earth texture missing.
            <br />
            <span
              style={{
                color: "#fbbf24",
                fontFamily: "monospace",
                fontSize: 10,
              }}
            >
              Add public/earth/earth-day.jpg
            </span>
          </div>
        </Html>
      )}
    </>
  );
}

/* ── Error boundary — catches TextureLoader hard failures ── */
class TextureErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <FallbackSphere showMessage />;
    return this.props.children;
  }
}

/* ── Full Three.js scene ── */
function Scene() {
  return (
    <group rotation={[0.05, -0.72, -0.06]}>
      {/* Sunlight */}
      <directionalLight
        position={[3.8, 3.4, 4.4]}
        intensity={2.7}
        color={new THREE.Color(0xfff5e0)}
      />
      {/* Blue rim fill from dark side */}
      <directionalLight
        position={[-3, -1.5, 2]}
        intensity={0.55}
        color={new THREE.Color(0xbae6fd)}
      />
      <ambientLight intensity={0.22} />

      {/* Earth + India marker */}
      <TextureErrorBoundary>
        <Suspense fallback={<FallbackSphere />}>
          <EarthSphere />
          <IndiaMarker />
        </Suspense>
      </TextureErrorBoundary>

      {/* Cloud layer (suspends separately — missing cloud tex is caught silently) */}
      <Suspense fallback={null}>
        <CloudLayer />
      </Suspense>

      {/* Atmosphere + orbit ring */}
      <AtmosphereGlow />
      <OrbitRing />

      {/* Drag controls — same settings as original */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.28}
      />
    </group>
  );
}

/* ── Default export: the Canvas wrapper (client-only) ── */
export default function EarthGlobeCanvas() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #eff6ff 100%)",
      }}
    >
      {/* Subtle radial glow behind the globe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 48%, rgba(59,130,246,0.18), transparent 48%)",
          pointerEvents: "none",
        }}
      />
      <Canvas
        camera={{ fov: 42, position: [0, 0.1, 4.8] }}
        dpr={[1, 1.35]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ position: "relative", zIndex: 10 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
