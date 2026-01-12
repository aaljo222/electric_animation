import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🚨 이미지 파일 경로 확인
import magnetImg from "../../assets/images/말굽자석.jpg";

// 🎨 색상 팔레트
const COLORS = {
  COIL: "#d97706", // 구리 코일
  FRAME: "#a855f7", // 코일 프레임 (보라색으로 강조)
  SLIP_RING: "#fbbf24", // 슬립링
  BRUSH: "#1f2937", // 브러시
  BULB_ON: "#fef08a", // 전구 켜짐
  BULB_OFF: "#4b5563", // 전구 꺼짐
};

// 🧲 배경 자석 이미지
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // ✅ [핵심 변경] 위치를 Z=-0.2로 설정하여 코일 바로 뒤에 바짝 붙임
    // 코일이 자석 '안'에 있는 듯한 시각적 효과를 극대화
    <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]}>
      <planeGeometry args={[6, 5]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ⚡ 회전하는 사각형 코일 (더 명확한 사각형 모양)
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

  const coilThickness = 0.1;
  const coilWidth = 3.2;
  const coilHeight = 2.2;

  return (
    // 코일을 화면 정중앙(0,0,0)에 배치
    <group position={[0, 0, 0]}>
      <group ref={groupRef}>
        {/* ✅ [핵심 변경] 더 명확한 직사각형 프레임 형태로 개선 */}
        <group>
          {/* 위쪽 변 */}
          <mesh
            position={[0, coilHeight / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[coilThickness, coilThickness, coilWidth, 16]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          {/* 아래쪽 변 */}
          <mesh
            position={[0, -coilHeight / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry
              args={[coilThickness, coilThickness, coilWidth, 16]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          {/* 왼쪽 변 */}
          <mesh position={[-coilWidth / 2, 0, 0]}>
            <cylinderGeometry
              args={[coilThickness, coilThickness, coilHeight, 16]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          {/* 오른쪽 변 */}
          <mesh position={[coilWidth / 2, 0, 0]}>
            <cylinderGeometry
              args={[coilThickness, coilThickness, coilHeight, 16]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          {/* 코일 내부를 약간 채워 사각형임을 강조 (선택사항) */}
          <mesh>
            <planeGeometry args={[coilWidth - 0.1, coilHeight - 0.1]} />
            <meshBasicMaterial
              color={COLORS.COIL}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* 회전축 */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 5, 16]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* 슬립링 */}
        <group position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.25, 0.08, 16, 32]} />
            <meshStandardMaterial color={COLORS.SLIP_RING} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <torusGeometry args={[0.25, 0.08, 16, 32]} />
            <meshStandardMaterial color={COLORS.SLIP_RING} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// 💡 외부 회로
const ExternalCircuit = ({ voltage }) => {
  return (
    <group position={[3.5, -1.0, 0]}>
      {/* 브러시 */}
      <mesh position={[-0.8, 1.6, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[-0.5, 1.6, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>

      {/* 전선 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([-0.8, 1.6, 0, -1.5, 0, 0, 0, 0, 0]),
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
              new Float32Array([-0.5, 1.6, 0, 0, 1.6, 0, 0, 1.2, 0]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={2} />
      </line>

      {/* 전구 */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color={COLORS.BULB_ON}
            emissive={COLORS.BULB_ON}
            emissiveIntensity={voltage * 2}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.5]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <Html position={[1.2, 0, 0]} center>
          <div className="bg-white/80 p-2 rounded-lg shadow-md border border-gray-200 text-center min-w-[80px]">
            <div className="text-[10px] text-gray-500 font-bold">VOLTAGE</div>
            <div className="text-xl font-bold text-orange-600 font-mono">
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
      {/* 자기장 화살표 */}
      <group position={[0, 0, 0]}>
        <arrowHelper
          args={[
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, -1.5, 0),
            3,
            0x00ffff,
            0.3,
            0.2,
          ]}
        />
        <Html position={[0, -1.8, 0]} center>
          <div className="text-cyan-500 font-bold bg-black/50 px-1 rounded">
            B (자기장)
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
      {/* 카메라를 정면으로 설정하여 이미지를 잘 보이게 함 */}
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
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
