import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🚨 이미지 파일 경로 확인
import magnetImg from "../../assets/images/말굽자석.jpg";

// 🎨 색상 팔레트
const COLORS = {
  COIL: "#d97706", // 구리 코일
  SLIP_RING: "#fbbf24", // 슬립링
  BRUSH: "#1f2937", // 브러시
  BULB_ON: "#fef08a", // 전구 켜짐
  BULB_OFF: "#4b5563", // 전구 꺼짐
};

// 📐 [핵심 수정] 시계방향 45도 회전 (Math.PI / 4)
// 코일과 회로 전체를 이 각도로 틀어서 자석 이미지와 정렬합니다.
const SYSTEM_ROTATION = [0, -Math.PI / 4, 0];

// 🧲 배경 자석 이미지 (고정)
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    <mesh position={[0, 0, -0.5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[6, 5]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ⚡ 회전하는 사각형 코일
const RotatingArmature = ({ setVoltage }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5;
    if (groupRef.current) {
      groupRef.current.rotation.x = t;
    }
    const v = Math.abs(Math.sin(t));
    setVoltage(v);
  });

  // 코일 크기 (자석 다리 사이에 맞춤)
  const coilThickness = 0.06;
  const coilWidth = 2.0;
  const coilHeight = 1.2;

  return (
    <group ref={groupRef}>
      {/* 사각형 프레임 코일 */}
      <group>
        <mesh position={[0, coilHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[coilThickness, coilThickness, coilWidth, 16]}
          />
          <meshStandardMaterial color={COLORS.COIL} />
        </mesh>
        <mesh position={[0, -coilHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[coilThickness, coilThickness, coilWidth, 16]}
          />
          <meshStandardMaterial color={COLORS.COIL} />
        </mesh>
        <mesh position={[-coilWidth / 2, 0, 0]}>
          <cylinderGeometry
            args={[coilThickness, coilThickness, coilHeight, 16]}
          />
          <meshStandardMaterial color={COLORS.COIL} />
        </mesh>
        <mesh position={[coilWidth / 2, 0, 0]}>
          <cylinderGeometry
            args={[coilThickness, coilThickness, coilHeight, 16]}
          />
          <meshStandardMaterial color={COLORS.COIL} />
        </mesh>
        {/* 내부 옅은 면 */}
        <mesh>
          <planeGeometry args={[coilWidth - 0.05, coilHeight - 0.05]} />
          <meshBasicMaterial
            color={COLORS.COIL}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 회전축 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 4.5, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* 슬립링 (축의 오른쪽 끝) */}
      <group position={[1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[0.15, 0.06, 16, 32]} />
          <meshStandardMaterial color={COLORS.SLIP_RING} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.15, 0.06, 16, 32]} />
          <meshStandardMaterial color={COLORS.SLIP_RING} />
        </mesh>
      </group>
    </group>
  );
};

// 💡 외부 회로 (코일 축에 고정)
const ExternalCircuit = ({ voltage }) => {
  return (
    // 코일 축 끝(x=2.0 부근)에 맞춰 배치
    <group position={[2.0, 0, 0]}>
      {/* 브러시 (슬립링 위) */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[-0.2, 0.5, 0]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color={COLORS.BRUSH} />
        </mesh>
        <mesh position={[0.1, 0.5, 0]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color={COLORS.BRUSH} />
        </mesh>

        {/* 전선 연결 */}
        <line>
          <bufferGeometry
            attach="geometry"
            attributes-position={
              new THREE.BufferAttribute(
                new Float32Array([-0.2, 0.5, 0, -0.2, -0.5, 0, 0.5, -0.5, 0]),
                3
              )
            }
          />
          <lineBasicMaterial attach="material" color="#333" linewidth={2} />
        </line>
        <line>
          <bufferGeometry
            attach="geometry"
            attributes-position={
              new THREE.BufferAttribute(
                new Float32Array([0.1, 0.5, 0, 0.1, -0.2, 0, 0.5, -0.2, 0]),
                3
              )
            }
          />
          <lineBasicMaterial attach="material" color="#333" linewidth={2} />
        </line>
      </group>

      {/* 전구 (브러시 옆) */}
      <group position={[1.0, -0.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={COLORS.BULB_ON}
            emissive={COLORS.BULB_ON}
            emissiveIntensity={voltage * 3}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#555" />
        </mesh>

        {/* 전압 텍스트 */}
        <Html position={[0, -1.5, 0]} center>
          <div className="flex flex-col items-center justify-center bg-gray-900/90 text-white p-2 rounded-lg shadow-xl border border-gray-500 min-w-[90px]">
            <div className="text-[10px] text-gray-300 font-bold mb-1">
              OUTPUT
            </div>
            <div className="text-xl font-black text-yellow-400 font-mono tracking-wider">
              {(voltage * 12).toFixed(1)}V
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

const ACGeneratorScene = () => {
  const [voltage, setVoltage] = useState(0);

  return (
    <group>
      {/* 1. 자석 배경 (고정) */}
      <TexturedMagnet />

      {/* ✅ [핵심] 코일과 회로를 하나의 그룹으로 묶어서 통째로 45도 회전 */}
      {/* 위치: y=-0.8 (자석 높이에 맞춤), 회전: y=-45도 (시계방향) */}
      <group position={[0, -0.8, 0]} rotation={SYSTEM_ROTATION}>
        {/* 2. 회전하는 코일 */}
        <RotatingArmature setVoltage={setVoltage} />

        {/* 3. 외부 회로 (코일과 함께 회전하여 위치 유지) */}
        <ExternalCircuit voltage={voltage} />
      </group>

      {/* 자기장 화살표 */}
      <group position={[0, -1.8, 0]} rotation={SYSTEM_ROTATION}>
        <arrowHelper
          args={[
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            2.0,
            0x00ffff,
            0.3,
            0.2,
          ]}
        />
        <Html position={[0, 1, 0]} center>
          <div className="text-cyan-600 font-extrabold text-sm bg-white/80 px-2 rounded backdrop-blur-sm">
            B
          </div>
        </Html>
      </group>
    </group>
  );
};

const ACGenerator3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f3f4f6",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Center>
            <ACGeneratorScene />
          </Center>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ACGenerator3D;
