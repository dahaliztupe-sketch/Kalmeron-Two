"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;

  // Smooth noise (cheap)
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / max(uResolution.y, 1.0);

    float t = uTime * 0.06;

    // Two slowly drifting noise fields create the aurora ribbons
    float n1 = fbm(p * 1.4 + vec2( t,  t * 0.7));
    float n2 = fbm(p * 2.1 - vec2(-t * 0.6, t * 0.4));

    float ribbon = smoothstep(0.35, 0.95, n1 * 0.7 + n2 * 0.5);

    // Mix gold -> blue -> deep navy based on noise
    vec3 col = mix(uColorC, uColorA, ribbon);
    col = mix(col, uColorB, smoothstep(0.55, 1.0, n2));

    // Vignette
    float vig = smoothstep(1.4, 0.2, length(p));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function AuroraPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorA: { value: new THREE.Color("#D4AF37") }, // gold
      uColorB: { value: new THREE.Color("#0A66C2") }, // blue
      uColorC: { value: new THREE.Color("#0A0A0B") }, // deep
    }),
    []
  );

  useFrame((state, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    const size = state.size;
    matRef.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function AuroraBackground({
  className = "",
}: {
  className?: string;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    async function detect() { setSupported(hasWebGL()); }
    void detect();
  }, []);

  if (supported === false) {
    // Graceful CSS-only fallback (matches the previous look)
    return (
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      >
        <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-amber-400/25 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/25 blur-[120px] rounded-full" />
      </div>
    );
  }

  if (supported === null) return null;

  return (
    <div
      className={`absolute inset-0 -z-10 ${className}`}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{ position: [0, 0, 1] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
          });
        }}
      >
        <AuroraPlane />
      </Canvas>
    </div>
  );
}
