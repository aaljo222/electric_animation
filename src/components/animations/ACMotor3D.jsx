import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// 🚨 이미지 경로 확인: src/assets/coil.jpg
import coilImg from "../../assets/images/coil.png";

// 📸 [이미지 텍스처 코일 컴포넌트]
const ImageTextureCoil = ({ position, rotation, color, current, label }) => {
  const meshRef = useRef();

  // 1. 코일 이미지 로드
  const texture = useLoader(THREE.TextureLoader, coilImg);

  // 텍스처가 원통에 자연스럽게 감기도록 설정
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  useFrame(() => {
    if (meshRef.current) {
      // 전류 세기 (절댓값)
      const intensity = Math.abs(current);
      const material = meshRef.current.material;

      // 2. 전류 흐를 때 발광 효과 (Emissive)
      // 텍스처 위에 해당 상(Phase)의 색상으로 빛을 더해줍니다.
      material.emissive = new THREE.Color(color);
      material.emissiveIntensity = intensity * 1.5; // 전류가 셀수록 더 밝게
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 3. 원통(Cylinder)에 이미지를 맵핑 */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 32]} />
        <meshStandardMaterial
          map={texture} // ✅ 코일 사진 적용
          color={0xffffff} // 텍스처 원래 색상 유지
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* 라벨 */}
      <Html position={[0, 0.8, 0]} center>
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            textShadow: "0px 0px 4px black",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// 메인 씬
const ACMotorScene = () => {
  const rotorRef = useRef();
  const vectorRef = useRef();
  const currents = useRef({ ia: 0, ib: 0, ic: 0 });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.5;

    // 3상 전류 계산
    currents.current.ia = Math.cos(t);
    currents.current.ib = Math.cos(t - (2 * Math.PI) / 3);
    currents.current.ic = Math.cos(t - (4 * Math.PI) / 3);

    // 회전 자계
    if (vectorRef.current) vectorRef.current.rotation.z = t - Math.PI / 2;
    // 농형 회전자 (슬립 적용)
    if (rotorRef.current) rotorRef.current.rotation.z = t * 0.95 - Math.PI / 2;
  });

  const r = 2.8; // 배치 반지름

  return (
    <group>
      {/* --- 이미지 텍스처 코일 6개 배치 --- */}
      {/* R상 (Red) */}
      <ImageTextureCoil
        position={[r * Math.cos(Math.PI / 2), r * Math.sin(Math.PI / 2), 0]}
        rotation={[0, 0, 0]}
        color="#ff0000"
        label="a (R)"
        current={currents.current.ia}
      />
      <ImageTextureCoil
        position={[r * Math.cos(-Math.PI / 2), r * Math.sin(-Math.PI / 2), 0]}
        rotation={[0, 0, 0]}
        color="#ff0000"
        label="a' (R)"
        current={-currents.current.ia}
      />

      {/* S상 (Green) */}
      <ImageTextureCoil
        position={[r * Math.cos(-Math.PI / 6), r * Math.sin(-Math.PI / 6), 0]}
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

      {/* T상 (Blue) */}
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

      {/* --- 회전 자계 (노란 화살표) --- */}
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
          <cylinderGeometry args={[0.1, 0.1, 1.8, 8]} />
          <meshStandardMaterial color="gold" />
        </mesh>
      </group>

      {/* --- 농형 회전자 --- */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh
            key={i}
            position={[1.51, 0, 0]}
            rotation={[0, 0, (i * Math.PI) / 6]}
          >
            <boxGeometry args={[0.08, 0.08, 3.1]} />
            <meshStandardMaterial color="#ccc" />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 5.5, 16]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </group>

      {/* 배경 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.05, 16, 64]} />
        <meshBasicMaterial color="#444" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[0, 0, 10]} intensity={0.8} />

        {/* ⚠️ 이미지가 로딩될 때까지 기다려주는 Suspense 컴포넌트 필수 */}
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
