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

// 📐 자석과 코일의 회전 각도 (동기화용)
const MAGNET_ROTATION = [0, 0.3, 0]; // Y축으로 살짝 틈

// 🧲 배경 자석 이미지
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // 자석을 살짝 회전시켜서 입체감 부여
    <mesh position={[0, 0, -0.5]} rotation={MAGNET_ROTATION}>
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
      // 코일 자체의 회전 (발전)
      groupRef.current.rotation.x = t;
    }
    const v = Math.abs(Math.sin(t));
    setVoltage(v);
  });

  const coilThickness = 0.1;
  const coilWidth = 3.2;
  const coilHeight = 2.2;

  return (
    // ✅ [중요] 자석이 회전한 만큼 코일 그룹 전체도 같이 회전시켜 정렬함
    <group position={[0, 0, 0]} rotation={MAGNET_ROTATION}>
      <group ref={groupRef}>
        {/* 사각형 프레임 코일 */}
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
          {/* 코일 내부 채움 (시각적 강조) */}
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

// 💡 외부 회로 (전구 및 전압계)
const ExternalCircuit = ({ voltage }) => {
  return (
    // ✅ 회로 위치를 중앙 쪽으로 당김 (x: 3.5 -> 2.8)
    <group position={[2.8, -1.2, 0.5]}>
      {/* 브러시 */}
      <mesh position={[-0.6, 1.8, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[-0.3, 1.8, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>

      {/* 전선 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([-0.6, 1.8, 0, -1.2, 0, 0, 0, 0, 0]),
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
              new Float32Array([-0.3, 1.8, 0, 0, 1.8, 0, 0, 1.2, 0]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={2} />
      </line>

      {/* 전구 */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={COLORS.BULB_ON}
            emissive={COLORS.BULB_ON}
            emissiveIntensity={voltage * 2.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#555" />
        </mesh>

        {/* ✅ [수정] 전압 텍스트를 전구 아래로 이동하여 잘림 방지 */}
        <Html position={[0, -1.5, 0]} center>
          <div className="flex flex-col items-center justify-center bg-white/90 p-2 rounded-lg shadow-xl border border-gray-300 min-w-[90px]">
            <div className="text-[10px] text-gray-500 font-bold mb-1">
              VOLTAGE
            </div>
            <div className="text-xl font-black text-orange-600 font-mono tracking-wider">
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
      <group position={[0, -1.5, 0]} rotation={MAGNET_ROTATION}>
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
        <Html position={[0, 0, 0]} center>
          <div className="text-cyan-600 font-extrabold text-lg bg-white/50 px-2 rounded backdrop-blur-sm">
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
      {/* 카메라를 약간 줌아웃(z: 8)하여 전체가 잘 보이게 함 */}
      <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
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
