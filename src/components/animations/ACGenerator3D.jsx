import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🚨 이미지 파일 경로를 꼭 확인해주세요!
import magnetImg from "../../assets/images/말굽자석.jpg";

// 🎨 색상 팔레트 (코일 및 기타 부품용)
const COLORS = {
  COIL: "#d97706", // 구리 코일
  SLIP_RING: "#fbbf24", // 슬립링
  BRUSH: "#1f2937", // 브러시
  BULB_ON: "#fef08a", // 전구 켜짐
  BULB_OFF: "#4b5563", // 전구 꺼짐
};

// 🧲 [수정됨] 이미지 텍스처를 사용한 말굽 자석
const TexturedMagnet = () => {
  // 1. 이미지 로드
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // 2. 평면(Plane)에 이미지를 입혀서 배치
    // 위치를 코일 뒤쪽으로 조정하고, Y축 기준으로 회전시켜 세움
    <mesh position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {/* 자석 이미지 비율에 맞춰 크기 조절 (가로 5, 세로 6 정도) */}
      <planeGeometry args={[5, 6]} />
      <meshStandardMaterial
        map={texture} // 로드한 이미지 적용
        side={THREE.DoubleSide} // 앞뒷면 모두 보이게
        roughness={0.5} // 빛 반사 정도
        metalness={0.1} // 금속성 느낌
        transparent={true} // 투명 배경 이미지일 경우 대비
      />
    </mesh>
  );
};

// ⚡ 회전하는 사각형 코일 (Armature) - 기존 유지
const RotatingArmature = ({ setVoltage }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5;
    if (groupRef.current) {
      groupRef.current.rotation.x = t; // 회전
    }
    const v = Math.abs(Math.sin(t)); // 전압 생성 모사
    setVoltage(v);
  });

  return (
    // 자석 이미지 앞 중앙에 위치
    <group position={[0, 0, 0]}>
      <group ref={groupRef}>
        {/* 사각형 구리선 프레임 */}
        <group>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry
              args={[0.08, 0.08, 2.8, 16]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry
              args={[0.08, 0.08, 2.8, 16]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          <mesh position={[1.4, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 16]} />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
          <mesh position={[-1.4, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 16]} />
            <meshStandardMaterial color={COLORS.COIL} />
          </mesh>
        </group>
        {/* 회전축 & 슬립링 */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 6, 16]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <group position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
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

// 💡 외부 회로 (브러시 + 전구) - 기존 유지
const ExternalCircuit = ({ voltage }) => {
  return (
    <group position={[2.5, 0, 0]}>
      {/* 브러시 */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[0.3, -0.3, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      {/* 전구 */}
      <group position={[2.5, -2, 0]}>
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
        <Html position={[0, 1, 0]} center>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
            {(voltage * 12).toFixed(1)}V
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
      {/* 1. 이미지 텍스처 자석 배치 */}
      <TexturedMagnet />

      {/* 2. 회전하는 코일 */}
      <RotatingArmature setVoltage={setVoltage} />

      {/* 3. 외부 회로 */}
      <ExternalCircuit voltage={voltage} />

      {/* 자기장 화살표 (보조 표시) */}
      <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <arrowHelper
          args={[
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            2,
            0x00ffff,
            0.2,
            0.1,
          ]}
        />
        <Html position={[0, 1, 0]}>
          <div className="text-cyan-400 font-bold text-sm">B (자기장)</div>
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
      <Canvas camera={{ position: [4, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* ⚠️ 이미지 로딩 대기용 Suspense 필수 */}
        <Suspense fallback={<Html center>Loading Magnet...</Html>}>
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
