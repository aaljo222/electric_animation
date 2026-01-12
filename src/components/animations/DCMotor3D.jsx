import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🎨 색상 팔레트 (다이어그램 매칭)
const COLORS = {
  N_POLE: "#e11d48", // N극 (빨강)
  S_POLE: "#2563eb", // S극 (파랑)
  WIRE: "#b45309", // 구리선 (Dark Copper)
  COMMUTATOR: "#7c3aed", // 정류자 (보라색)
  BRUSH: "#fbbf24", // 브러시 (금색)
  SHAFT: "#9ca3af", // 축 (회색)
  ARROW: "#10b981", // 회전 방향 화살표 (초록)
};

// ⚡ 직사각형 코일 (Rectangular Wire Loop) 컴포넌트
const RectangularCoil = () => {
  const thickness = 0.08; // 전선 두께
  const width = 1.4; // 코일 가로 폭
  const length = 3.5; // 코일 세로 길이

  return (
    <group>
      {/* 1. 왼쪽 변 (Left Arm) */}
      <mesh position={[-width / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[thickness, thickness, length, 16]} />
        <meshStandardMaterial
          color={COLORS.WIRE}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 2. 오른쪽 변 (Right Arm) */}
      <mesh position={[width / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[thickness, thickness, length, 16]} />
        <meshStandardMaterial
          color={COLORS.WIRE}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 3. 뒤쪽 연결부 (Back Connector) */}
      <mesh position={[0, 0, -length / 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[thickness, thickness, width, 16]} />
        <meshStandardMaterial
          color={COLORS.WIRE}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 4. 앞쪽 연결부 (Front Connectors - 정류자로 연결) */}
      <mesh
        position={[-width / 4, 0, length / 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[thickness, thickness, width / 2, 16]} />
        <meshStandardMaterial
          color={COLORS.WIRE}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh
        position={[width / 4, 0, length / 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[thickness, thickness, width / 2, 16]} />
        <meshStandardMaterial
          color={COLORS.WIRE}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

const DCMotorScene = () => {
  const rotorRef = useRef();

  // 🔄 애니메이션: 시계 방향 회전 (Clockwise)
  // 카메라가 정면(Z축 양의 방향)에 있을 때, Z축 기준 음의 회전이 시계 방향입니다.
  useFrame((state, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= delta * 2;
    }
  });

  return (
    <group>
      {/* ========================== */}
      {/* 1. 고정자 (자석) */}
      {/* ========================== */}

      {/* N극 (왼쪽, 빨강) */}
      <group position={[-2.5, 0, 0]}>
        <mesh>
          {/* 말굽 자석 모양 흉내 */}
          <boxGeometry args={[2, 3.5, 3]} />
          <meshStandardMaterial color={COLORS.N_POLE} roughness={0.2} />
        </mesh>
        {/* 안쪽 파인 부분 (검은 그림자 처리로 입체감) */}
        <mesh position={[1, 0, 0]}>
          <boxGeometry args={[0.1, 2.5, 3]} />
          <meshBasicMaterial color="#9f1239" />
        </mesh>
        <Html position={[-0.5, 0, 1.6]} transform>
          <div
            style={{
              color: "white",
              fontSize: "3rem",
              fontWeight: "900",
              userSelect: "none",
            }}
          >
            N
          </div>
        </Html>
      </group>

      {/* S극 (오른쪽, 파랑) */}
      <group position={[2.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[2, 3.5, 3]} />
          <meshStandardMaterial color={COLORS.S_POLE} roughness={0.2} />
        </mesh>
        <mesh position={[-1, 0, 0]}>
          <boxGeometry args={[0.1, 2.5, 3]} />
          <meshBasicMaterial color="#1e40af" />
        </mesh>
        <Html position={[0.5, 0, 1.6]} transform>
          <div
            style={{
              color: "white",
              fontSize: "3rem",
              fontWeight: "900",
              userSelect: "none",
            }}
          >
            S
          </div>
        </Html>
      </group>

      {/* ========================== */}
      {/* 2. 회전자 (코일 + 정류자 + 축) */}
      {/* ========================== */}
      {/* 전체 회전 그룹 */}
      <group ref={rotorRef}>
        {/* (1) 직사각형 코일 (Rectangular Coil) - 뚱뚱한 원통 제거됨! */}
        <RectangularCoil />

        {/* (2) 중앙 축 (Shaft) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 6, 32]} />
          <meshStandardMaterial color={COLORS.SHAFT} metalness={0.8} />
        </mesh>

        {/* (3) 정류자 (Split-ring Commutator) */}
        {/* 반원통 2개가 마주보는 형태 */}
        <group position={[0, 0, 2]}>
          {/* 위쪽 조각 */}
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[0.5, 0.5, 0.8, 32, 1, false, 0, Math.PI]}
            />
            <meshStandardMaterial color={COLORS.COMMUTATOR} />
          </mesh>
          {/* 아래쪽 조각 */}
          <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, Math.PI, 0]}>
            <cylinderGeometry
              args={[0.5, 0.5, 0.8, 32, 1, false, 0, Math.PI]}
            />
            <meshStandardMaterial color={COLORS.COMMUTATOR} />
          </mesh>
          {/* 내부 절연체 (검은 기둥) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.8, 32]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      </group>

      {/* ========================== */}
      {/* 3. 브러시 (고정) */}
      {/* ========================== */}
      <group position={[0, 0, 2]}>
        {/* 위쪽 브러시 */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={COLORS.BRUSH} metalness={0.8} />
        </mesh>
        {/* 아래쪽 브러시 */}
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={COLORS.BRUSH} metalness={0.8} />
        </mesh>

        {/* 전원 연결선 텍스트 */}
        <Html position={[0, -1.5, 0]} center>
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "12px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            🔋 DC Power
          </div>
        </Html>
      </group>
    </group>
  );
};

const DCMotor3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f8fafc",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* 카메라 앵글: 정면에서 약간 위 (직사각형 잘 보이게) */}
      <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.5} />

        <Center>
          <DCMotorScene />
        </Center>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};

export default DCMotor3D;
