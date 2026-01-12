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

// 🧲 배경 자석 이미지 (회전 없이 정면 배치)
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // 자석은 회전시키지 않고 배경으로 고정 (rotation=[0,0,0])
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

// ⚡ 회전하는 사각형 코일 (크기 축소, 위치 하강, 시계방향 회전)
const RotatingArmature = ({ setVoltage }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5;
    if (groupRef.current) {
      // 코일 자체의 회전 애니메이션
      groupRef.current.rotation.x = t;
    }
    const v = Math.abs(Math.sin(t));
    setVoltage(v);
  });

  // ✅ [수정 1] 코일 크기 축소
  const coilThickness = 0.06;
  const coilWidth = 2.0; // 기존 3.2 -> 2.0
  const coilHeight = 1.2; // 기존 2.2 -> 1.2

  return (
    // ✅ [수정 2 & 3] 위치 아래로(y=-0.8), 시계방향 회전(y=-0.6 rad)
    <group position={[0, -0.8, 0]} rotation={[0, -0.6, 0]}>
      <group ref={groupRef}>
        {/* 사각형 프레임 코일 */}
        <group>
          <mesh
            position={[0, coilHeight / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[coilThickness, coilThickness, coilWidth, 16]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          <mesh
            position={[0, -coilHeight / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
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
          {/* 내부 채움 */}
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

        {/* 회전축 (길이 조정) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 4, 16]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* 슬립링 (위치 조정) */}
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
    </group>
  );
};

// 💡 외부 회로 (코일 위치에 맞춰 조정)
const ExternalCircuit = ({ voltage }) => {
  return (
    // 회로 위치를 코일이 내려간 만큼 조정하고 오른쪽으로 배치
    <group position={[2.8, -1.5, 0.5]}>
      {/* 브러시 (높이 낮춤) */}
      <mesh position={[-0.5, 0.6, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[-0.2, 0.6, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>

      {/* 전선 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([-0.5, 0.6, 0, -0.5, 0, 0, 0, 0, 0]),
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
              new Float32Array([-0.2, 0.6, 0, -0.2, 0.3, 0, 0, 0.3, 0]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={2} />
      </line>

      {/* 전구 */}
      <group position={[0.5, 0, 0]}>
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
        <Html position={[0, -1.4, 0]} center>
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
      <TexturedMagnet />
      <RotatingArmature setVoltage={setVoltage} />
      <ExternalCircuit voltage={voltage} />

      {/* 자기장 화살표 (위치 하향 조정) */}
      <group position={[0, -1.8, 0]} rotation={[0, -0.3, 0]}>
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
      {/* 카메라 정면 배치 */}
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
