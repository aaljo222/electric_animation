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

// 📐 [핵심 수정] 자석 회전 각도 대폭 증가 (약 45~50도)
const SCENE_ROTATION = [0, 0.9, 0];

// 🧲 배경 자석 이미지
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // 자석을 더 많이 틀어서 입체감 강조
    <mesh position={[0, 0, -0.5]} rotation={SCENE_ROTATION}>
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
      groupRef.current.rotation.x = t; // 코일 회전
    }
    const v = Math.abs(Math.sin(t));
    setVoltage(v);
  });

  const coilThickness = 0.1;
  const coilWidth = 3.2;
  const coilHeight = 2.2;

  return (
    // ✅ 코일도 자석과 똑같은 각도로 회전시켜 '정렬'
    <group position={[0, 0, 0]} rotation={SCENE_ROTATION}>
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
          <mesh>
            <planeGeometry args={[coilWidth - 0.1, coilHeight - 0.1]} />
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
    // 회로 위치를 오른쪽 앞으로 이동하여 겹침 방지
    <group position={[3.2, -1.0, 1.5]}>
      {/* 브러시 */}
      <mesh position={[-0.8, 1.8, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[-0.5, 1.8, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>

      {/* 전선 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([-0.8, 1.8, 0, -1.5, 0, 0, 0, 0, 0]),
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
              new Float32Array([-0.5, 1.8, 0, 0, 1.8, 0, 0, 1.2, 0]),
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
            emissiveIntensity={voltage * 3}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.5]} />
          <meshStandardMaterial color="#555" />
        </mesh>

        {/* ✅ [수정] 전압 텍스트 가시성 개선 (배경 추가 + 위치 조정) */}
        <Html position={[0, -1.6, 0]} center>
          <div className="flex flex-col items-center justify-center bg-gray-900/90 text-white p-2 rounded-lg shadow-2xl border border-gray-500 min-w-[100px]">
            <div className="text-[11px] text-gray-300 font-bold mb-1">
              OUTPUT
            </div>
            <div className="text-2xl font-black text-yellow-400 font-mono tracking-wider">
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

      {/* 자기장 화살표 (회전 적용) */}
      <group position={[0, -1.5, 0]} rotation={SCENE_ROTATION}>
        <arrowHelper
          args={[
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            2.5,
            0x00ffff,
            0.3,
            0.2,
          ]}
        />
        <Html position={[0, 1.5, 0]} center>
          <div className="text-cyan-600 font-extrabold text-xl bg-white/80 px-2 rounded backdrop-blur-sm shadow-sm">
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
      {/* 카메라 위치 조정: 측면에서 더 잘 보이도록 이동 */}
      <Canvas camera={{ position: [2, 1, 9], fov: 45 }}>
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
