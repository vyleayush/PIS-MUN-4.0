import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────── Ultra-Optimized Diplomatic Globe ─────────────────────── */

// Pre-computed latitude/longitude grid (created once, zero per-frame CPU load)
function StaticGlobeGrid({ radius = 1.6 }) {
  const geometry = useMemo(() => {
    const points = [];
    const segments = 48;

    // Latitudes
    for (let lat = -60; lat <= 60; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180);
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          )
        );
        if (i < segments) {
          const thetaNext = ((i + 1) / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              radius * Math.sin(phi) * Math.cos(thetaNext),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(thetaNext)
            )
          );
        }
      }
    }

    // Longitudes
    for (let lon = 0; lon < 360; lon += 30) {
      const theta = lon * (Math.PI / 180);
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI;
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          )
        );
        if (i < segments) {
          const phiNext = ((i + 1) / segments) * Math.PI;
          points.push(
            new THREE.Vector3(
              radius * Math.sin(phiNext) * Math.cos(theta),
              radius * Math.cos(phiNext),
              radius * Math.sin(phiNext) * Math.sin(theta)
            )
          );
        }
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#C7A35A" transparent opacity={0.25} />
    </lineSegments>
  );
}

// Major diplomatic hubs coordinates
const CITIES = [
  { lat: 40.7,  lon: -74.0 },  // NYC
  { lat: 46.2,  lon: 6.1 },    // Geneva
  { lat: 28.6,  lon: 77.2 },   // New Delhi
  { lat: 51.5,  lon: -0.12 },  // London
  { lat: -1.28, lon: 36.8 },   // Nairobi
  { lat: 35.7,  lon: 139.7 },  // Tokyo
  { lat: 39.9,  lon: 116.4 },  // Beijing
  { lat: -23.5, lon: -46.6 },  // São Paulo
  { lat: 30.0,  lon: 31.2 },   // Cairo
  { lat: 55.7,  lon: 37.6 },   // Moscow
  { lat: -33.9, lon: 151.2 },  // Sydney
  { lat: 1.35,  lon: 103.8 },  // Singapore
];

function latLonToVec(lat, lon, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Pre-computed static diplomatic arcs merged into a single geometry (1 single draw call!)
function StaticArcsGroup({ radius = 1.6 }) {
  const geometry = useMemo(() => {
    const connections = [
      [0, 1], [0, 3], [1, 4], [2, 5], [2, 8], [3, 6],
      [4, 8], [5, 11], [6, 9], [7, 0], [7, 4], [9, 3],
      [10, 5], [10, 11], [11, 2], [8, 1], [2, 3], [0, 2],
    ];

    const allPoints = [];
    connections.forEach(([i1, i2]) => {
      const start = latLonToVec(CITIES[i1].lat, CITIES[i1].lon, radius);
      const end = latLonToVec(CITIES[i2].lat, CITIES[i2].lon, radius);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(radius + dist * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pts = curve.getPoints(12);
      for (let j = 0; j < pts.length - 1; j++) {
        allPoints.push(pts[j], pts[j + 1]);
      }
    });

    return new THREE.BufferGeometry().setFromPoints(allPoints);
  }, [radius]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#E7C978" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

// Fast lightweight city glowing points
function CityPoints({ radius = 1.6 }) {
  const geometry = useMemo(() => {
    const pos = new Float32Array(CITIES.length * 3);
    CITIES.forEach((c, i) => {
      const v = latLonToVec(c.lat, c.lon, radius * 1.008);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [radius]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.065}
        color="#FFFFFF"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// Background Starfield (static geometry, GPU rotation only)
function FastStarfield() {
  const ref = useRef();
  const geometry = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.03} color="#EAD9B0" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Lightweight Atmosphere Rim
function SimpleAtmosphere({ radius = 1.6 }) {
  return (
    <mesh scale={[1.14, 1.14, 1.14]}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshBasicMaterial
        color="#C7A35A"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Combined Fast Rotating Globe Assembly
function OptimizedGlobe({ mouse }) {
  const groupRef = useRef();
  const radius = 1.6;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Smooth 60fps rotation
    groupRef.current.rotation.y += delta * 0.22;

    // Fast responsive mouse tilt
    const targetX = mouse.current[1] * 0.22;
    const targetZ = mouse.current[0] * -0.18;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Dark core globe */}
      <mesh>
        <sphereGeometry args={[radius * 0.985, 32, 32]} />
        <meshBasicMaterial color="#080C14" />
      </mesh>

      {/* Grid lines */}
      <StaticGlobeGrid radius={radius} />

      {/* City nodes */}
      <CityPoints radius={radius} />

      {/* Diplomatic arcs */}
      <StaticArcsGroup radius={radius} />

      {/* Atmosphere rim */}
      <SimpleAtmosphere radius={radius} />

      {/* Equator & orbital rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.01, 0.005, 6, 64]} />
        <meshBasicMaterial color="#C7A35A" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[radius * 1.35, 0.004, 6, 64]} />
        <meshBasicMaterial color="#4AA3DF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─────────────────────── Viewport-Aware Canvas ─────────────────────── */

export const Hero3DScene = () => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const mouse = useRef([0, 0]);

  // Pause WebGL rendering when Hero is scrolled out of viewport
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Passive mouse tracking with requestAnimationFrame throttling
  useEffect(() => {
    let ticking = false;
    const handlePointerMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = -(e.clientY / window.innerHeight) * 2 + 1;
          mouse.current = [x, y];
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[6] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        frameloop={isInView ? "always" : "never"}
        camera={{ position: [0, 0.2, 4.5], fov: 45 }}
        dpr={[0.5, 1]} // Dynamic DPR for low-end laptops
        gl={{
          antialias: false, // Disabled antialiasing for performance
          alpha: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#FFDF85" />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#4AA3DF" />

        <Suspense fallback={null}>
          <OptimizedGlobe mouse={mouse} />
          <FastStarfield />
        </Suspense>
      </Canvas>
    </div>
  );
};
