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

// 🧲 [수정됨] 자석 이미지를 배경으로 배치
const TexturedMagnet = () => {
  const texture = useLoader(THREE.TextureLoader, magnetImg);

  return (
    // 위치를 Z축 뒤로(-2.5) 보내서 코일과 겹치지 않게 함
    // 정면을 바라보도록 회전 (rotation=[0,0,0])
    <mesh position={[0, 0.5, -2.5]} rotation={[0, 0, 0]}>
      {/* 이미지 비율에 맞춰 크기 설정 (가로 6, 세로 5) */}
      <planeGeometry args={[6, 5]} />
      <meshStandardMaterial
        map={texture}
        transparent={true} // 투명도 허용
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
      // 코일 회전 (X축 기준)
      groupRef.current.rotation.x = t;
    }
    const v = Math.abs(Math.sin(t));
    setVoltage(v);
  });

  return (
    // 코일을 화면 중앙(0,0,0)에 배치
    <group position={[0, 0.5, 0]}>
      <group ref={groupRef}>
        {/* 사각형 구리선 */}
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

        {/* 회전축 */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 5, 16]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* 슬립링 (오른쪽 끝) */}
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

// 💡 외부 회로 (전구 위치 수정)
const ExternalCircuit = ({ voltage }) => {
  return (
    // 전체 회로를 오른쪽 아래로 이동
    <group position={[3, -1.5, 0]}>
      {/* 브러시 */}
      <mesh position={[-0.8, 2.0, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>
      <mesh position={[-0.5, 2.0, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={COLORS.BRUSH} />
      </mesh>

      {/* 전선 라인 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([
                -0.8,
                2.0,
                0, // 브러시1
                -2.0,
                0,
                0, // 왼쪽 아래
                0,
                0,
                0, // 전구 연결
              ]),
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
              new Float32Array([
                -0.5,
                2.0,
                0, // 브러시2
                0,
                2.0,
                0,
                0,
                1.2,
                0, // 전구 위
              ]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={2} />
      </line>

      {/* 전구 본체 */}
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

        {/* 전압 표시 텍스트 */}
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
      {/* 1. 자석 이미지 (배경) */}
      <TexturedMagnet />

      {/* 2. 회전하는 코일 (중앙) */}
      <RotatingArmature setVoltage={setVoltage} />

      {/* 3. 외부 회로 (오른쪽) */}
      <ExternalCircuit voltage={voltage} />

      {/* 자기장 화살표 */}
      <group position={[0, 0.5, -0.5]}>
        <arrowHelper
          args={[
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, 0),
            2,
            0x00ffff,
            0.3,
            0.2,
          ]}
        />
        <Html position={[0, 0, 1]}>
          <div className="text-cyan-500 font-bold bg-black/50 px-1 rounded">
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
      <Canvas camera={{ position: [0, 1, 7], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={<Html center>Loading...</Html>}>
          <Center>
            <ACGeneratorScene />
          </Center>
        </Suspense>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default ACGenerator3D;
