"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

function ParallaxOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += (target.current.x * 0.6 - meshRef.current.rotation.y) * 0.06;
    meshRef.current.rotation.x += (target.current.y * 0.4 - meshRef.current.rotation.x) * 0.06;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <MeshDistortMaterial
          color="#D4AF37"
          emissive="#3B82F6"
          emissiveIntensity={0.25}
          metalness={0.9}
          roughness={0.15}
          distort={0.35}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

export default function Logo3D({
  size = 56,
  fallbackSrc = "/brand/logo.svg",
  alt = "Kalmeron",
}: {
  size?: number;
  fallbackSrc?: string;
  alt?: string;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => setSupported(hasWebGL()), []);

  if (supported === false) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallbackSrc} alt={alt} style={{ height: size, width: "auto" }} />;
  }
  if (supported === null) {
    return <div style={{ width: size, height: size }} aria-hidden />;
  }

  return (
    <div style={{ width: size, height: size }} aria-label={alt}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 3.2], fov: 45 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={0.9} color="#D4AF37" />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color="#3B82F6" />
        <ParallaxOrb />
      </Canvas>
    </div>
  );
}
