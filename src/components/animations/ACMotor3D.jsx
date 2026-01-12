import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// 🔹 코일 이미지
import coilImg from "../../assets/images/coil.png";

// ------------------------------
// 이미지 텍스처 코일
// ------------------------------
const ImageTextureCoil = ({ position, rotation, color, current, label }) => {
  const meshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, coilImg);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  useFrame(() => {
    if (meshRef.current) {
      const intensity = Math.abs(current);
      meshRef.current.material.emissive = new THREE.Color(color);
      meshRef.current.material.emissiveIntensity = intensity * 1.3;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 32]} />
        <meshStandardMaterial
          map={texture}
          color={0xffffff}
          roughness={0.35}
          metalness={0.5}
        />
      </mesh>

      <Html position={[0, 0.8, 0]} center>
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            textShadow: "0 0 4px black",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// ------------------------------
// 메인 씬
// ------------------------------
const ACMotorScene = () => {
  const rotorRef = useRef();
  const fieldRef = useRef();
  const currents = useRef({ ia: 0, ib: 0, ic: 0 });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.4;

    currents.current.ia = Math.cos(t);
    currents.current.ib = Math.cos(t - (2 * Math.PI) / 3);
    currents.current.ic = Math.cos(t - (4 * Math.PI) / 3);

    if (fieldRef.current) fieldRef.current.rotation.z = t;
    if (rotorRef.current) rotorRef.current.rotation.z = t * 0.92;
  });

  const r = 2.8;

  return (
    <group>
      {/* ===============================
          3상 고정자 코일
         =============================== */}
      <ImageTextureCoil position={[0, r, 0]} color="#ff4444" label="a (R)" current={currents.current.ia} />
      <ImageTextureCoil position={[0, -r, 0]} color="#ff4444" label="a' (R)" current={-currents.current.ia} />

      <ImageTextureCoil
        position={[r * Math.cos(-Math.PI / 6), r * Math.sin(-Math.PI / 6), 0]}
        rotation={[0, 0, -Math.PI / 3]}
        color="#22c55e"
        label="b (S)"
        current={currents.current.ib}
      />
      <ImageTextureCoil
        position={[r * Math.cos((5 * Math.PI) / 6), r * Math.sin((5 * Math.PI) / 6), 0]}
        rotation={[0, 0, -Math.PI / 3]}
        color="#22c55e"
        label="b' (S)"
        current={-currents.current.ib}
      />

      <ImageTextureCoil
        position={[r * Math.cos((7 * Math.PI) / 6), r * Math.sin((7 * Math.PI) / 6), 0]}
        rotation={[0, 0, Math.PI / 3]}
        color="#3b82f6"
        label="c (T)"
        current={currents.current.ic}
      />
      <ImageTextureCoil
        position={[r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), 0]}
        rotation={[0, 0, Math.PI / 3]}
        color="#3b82f6"
        label="c' (T)"
        current={-currents.current.ic}
      />

      {/* ===============================
          고정자 철심 (Stator Core)
         =============================== */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.35, 32, 96]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.4}
          roughness={0.45}
        />
      </mesh>

      {/* ===============================
          공극 (Air Gap)
         =============================== */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.05, 16, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      {/* ===============================
          Arago Disk (얇은 회전자)
         =============================== */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 64]} />
          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.7}
            roughness={0.25}
            emissive="#6b7280"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* ===============================
          회전 자기장 (Rotating Magnetic Field)
         =============================== */}
      <group ref={fieldRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.06, 16, 64]} />
          <meshBasicMaterial color="gold" transparent opacity={0.8} />
        </mesh>

        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.25, 0.5, 16]} />
          <meshStandardMaterial
            color="gold"
            emissive="gold"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </group>
  );
};

// ------------------------------
// Canvas Wrapper
// ------------------------------
const ACMotor3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#111827",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <ambientLight intensity={0.65} />
        <pointLight position={[6, 6, 8]} intensity={1.1} />
        <pointLight position={[0, 0, 5]} intensity={0.8} />

        <Suspense
          fallback={
            <Html center>
              <div style={{ color: "white" }}>Loading...</div>
            </Html>
          }
        >
          <ACMotorScene />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ACMotor3D;
