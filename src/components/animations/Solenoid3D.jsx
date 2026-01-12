import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🚨 이미지 경로 확인 (기존 coil.jpg 재사용)
import coilImg from "../../assets/images/coil.png";

const SolenoidScene = () => {
  const texture = useLoader(THREE.TextureLoader, coilImg);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // 전류 ON/OFF 상태 관리
  const [isOn, setIsOn] = useState(true);

  // 1초마다 전류 상태 토글
  useEffect(() => {
    const interval = setInterval(() => setIsOn((prev) => !prev), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* --- 솔레노이드 코일 --- */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 4, 32]} />
        <meshStandardMaterial
          map={texture}
          color={0xffffff}
          emissive={isOn ? "#ffaa00" : "#000000"} // 켜지면 주황색 발광
          emissiveIntensity={isOn ? 0.5 : 0}
        />
      </mesh>

      {/* --- 자기장 화살표 (전류 흐를 때만 표시) --- */}
      {isOn && (
        <group>
          {/* 중심 관통 화살표 */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[0.5, 1, 16]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 5]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
          </mesh>
          {/* 외부 자기장 루프 (간략화) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.1, 16, 64, Math.PI]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.2} />
          </mesh>
          <Html position={[1.5, 2, 0]} center>
            <div className="bg-green-600 text-white px-2 py-1 rounded font-bold">
              자기장 (B)
            </div>
          </Html>
        </group>
      )}

      <Html position={[0, -2.5, 0]} center>
        <div
          className={`px-4 py-2 rounded-full font-bold text-white transition-colors ${
            isOn ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {isOn ? "전류 ON (I > 0)" : "전류 OFF (I = 0)"}
        </div>
      </Html>
    </group>
  );
};

const Solenoid3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#222",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [3, 3, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Center>
            <SolenoidScene />
          </Center>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Solenoid3D;
