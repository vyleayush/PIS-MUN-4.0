import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";

function RotatingAssembly() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <Icosahedron args={[1.7, 1]}>
        <meshStandardMaterial color="#C7A35A" wireframe transparent opacity={0.35} />
      </Icosahedron>
      <Icosahedron args={[1.2, 0]}>
        <meshStandardMaterial color="#1E2A44" wireframe transparent opacity={0.5} />
      </Icosahedron>
    </group>
  );
}

export const CommitteeScene = () => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

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

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-0 h-full w-full lg:w-1/2 opacity-70 pointer-events-none"
      aria-hidden
    >
      {isInView && (
        <Canvas
          frameloop={isInView ? "always" : "never"}
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[0.5, 1]}
          gl={{ powerPreference: "low-power", antialias: false }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1.1} color="#D7B56B" />
          <Suspense fallback={null}>
            <RotatingAssembly />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};
