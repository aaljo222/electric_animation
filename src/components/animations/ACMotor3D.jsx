import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// 🔹 코일 이미지
import coilImg from "../../assets/images/coil.png";

// 🎨 색상
const COLORS = {
  BATTERY_POS: "#ef4444",
  BATTERY_NEG: "#1f2937",
};

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
      meshRef.current.material.emissiveIntensity = intensity * 1.5;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 32]} />
        <meshStandardMaterial
          map={texture}
          color={0xffffff}
          roughness={0.4}
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
  const vectorRef = useRef();
  const currents = useRef({ ia: 0, ib: 0, ic: 0 });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.5;

    // 3상 전류
    currents.current.ia = Math.cos(t);
    currents.current.ib = Math.cos(t - (2 * Math.PI) / 3);
    currents.current.ic = Math.cos(t - (4 * Math.PI) / 3);

    // 회전 자계
    if (vectorRef.current) vectorRef.current.rotation.z = t - Math.PI / 2;

    // 회전자 (슬립 적용)
    if (rotorRef.current) rotorRef.current.rotation.z = t * 0.95 - Math.PI / 2;
  });

  const r = 2.8;

  return (
    <group>
      {/* --- 3상 코일 --- */}
      <ImageTextureCoil
        position={[0, r, 0]}
        color="#ff0000"
        label="a (R)"
        current={currents.current.ia}
      />
      <ImageTextureCoil
        position={[0, -r, 0]}
        color="#ff0000"
        label="a' (R)"
        current={-currents.current.ia}
      />

      <ImageTextureCoil
        position={[
          r * Math.cos(-Math.PI / 6),
          r * Math.sin(-Math.PI / 6),
          0,
        ]}
        rotation={[0, 0, -Math.PI / 3]}
        color="#00ff00"
        label="b (S)"
        current={currents.current.ib}
      />
      <ImageTextureCoil
        position={[
          r * Math.cos((5 * Math.PI) / 6),
          r * Math.sin((5 * Math.PI) / 6),
          0,
        ]}
        rotation={[0, 0, -Math.PI / 3]}
        color="#00ff00"
        label="b' (S)"
        current={-currents.current.ib}
      />

      <ImageTextureCoil
        position={[
          r * Math.cos((7 * Math.PI) / 6),
          r * Math.sin((7 * Math.PI) / 6),
          0,
        ]}
        rotation={[0, 0, Math.PI / 3]}
        color="#0000ff"
        label="c (T)"
        current={currents.current.ic}
      />
      <ImageTextureCoil
        position={[r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), 0]}
        rotation={[0, 0, Math.PI / 3]}
        color="#0000ff"
        label="c' (T)"
        current={-currents.current.ic}
      />

      {/* --- 회전 자계 벡터 --- */}
      <group ref={vectorRef}>
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.4, 0.8, 16]} />
          <meshStandardMaterial
            color="gold"
            emissive="gold"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.8]} />
          <meshStandardMaterial color="gold" />
        </mesh>
      </group>

      {/* ===============================
          🔥 농형 회전자 (밝기 수정 핵심)
         =============================== */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
           <meshStandardMaterial
    color="#888888"          // ✅ 기본을 밝은 회색
    roughness={0.25}         // ✅ 거칠기 낮춤
    metalness={0.65}         // ✅ 철심 느낌
    emissive="#555555"       // ✅ 핵심: 자체 발광
    emissiveIntensity={0.8}  // ✅ 교재 수준 밝기
  />
        </mesh>

        {/* 알루미늄 바 */}
        {[...Array(12)].map((_, i) => (
          <mesh
            key={i}
            position={[1.52, 0, 0]}
            rotation={[0, 0, (i * Math.PI) / 6]}
          >
            <boxGeometry args={[0.08, 0.08, 3.1]} />
            <meshStandardMaterial color="#ddd" metalness={0.8} />
          </mesh>
        ))}

        {/* 샤프트 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 5.5]} />
          <meshStandardMaterial color="#aaa" metalness={0.6} />
        </mesh>
      </group>

      {/* 외곽 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.05, 16, 64]} />
        <meshBasicMaterial color="#aaa" transparent opacity={0.15} />
      </mesh>
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
        background: "#1a1a1a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[0, 3, 5]} intensity={0.6} />
<pointLight
  position={[0, 0, 4]}
  intensity={0.9}
  color="#ffffff"
/>
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
