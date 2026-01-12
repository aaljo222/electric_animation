import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";

// 화살표(벡터)를 그리는 컴포넌트
const VectorArrow = ({ color, position, rotation, scale, label }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* 화살표 몸통 (Cylinder) */}
      <mesh position={[0, scale / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, scale, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 화살표 머리 (Cone) */}
      <mesh position={[0, scale, 0]}>
        <coneGeometry args={[0.2, 0.4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 라벨 (Optional) */}
      {label && (
        <Html position={[0, scale + 0.5, 0]} center>
          <div style={{ color: color, fontWeight: "bold", fontSize: "12px" }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// 코일(권선)을 표현하는 컴포넌트
const Coil = ({ position, rotation, color }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* 코일 뭉치 (Torus) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.2, 16, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 32]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </group>
  );
};

// 실제 애니메이션이 돌아가는 메인 씬
const MagneticFieldScene = () => {
  const groupRef = useRef();

  // 각 벡터의 Ref
  const vecR = useRef();
  const vecS = useRef();
  const vecT = useRef();
  const vecNet = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.5; // 속도 조절

    // 1. 각 상의 전류 크기 (Magnitude) - 120도 위상차
    const magR = Math.cos(t);
    const magS = Math.cos(t - (2 * Math.PI) / 3);
    const magT = Math.cos(t - (4 * Math.PI) / 3);

    // 2. 각 벡터의 길이 조절 (Scale y축)
    if (vecR.current) vecR.current.scale.y = Math.abs(magR) * 2;
    if (vecS.current) vecS.current.scale.y = Math.abs(magS) * 2;
    if (vecT.current) vecT.current.scale.y = Math.abs(magT) * 2;

    // 3. 방향 뒤집기 (음수일 때 반대 방향)
    if (vecR.current)
      vecR.current.rotation.z = magR >= 0 ? -Math.PI / 2 : Math.PI / 2; // 0도 (Right)
    if (vecS.current)
      vecS.current.rotation.z =
        magS >= 0
          ? -Math.PI / 2 + (2 * Math.PI) / 3
          : -Math.PI / 2 + (2 * Math.PI) / 3 + Math.PI; // 120도
    if (vecT.current)
      vecT.current.rotation.z =
        magT >= 0
          ? -Math.PI / 2 + (4 * Math.PI) / 3
          : -Math.PI / 2 + (4 * Math.PI) / 3 + Math.PI; // 240도

    // 4. 합성 벡터 (Rotating Field) 계산
    // R, S, T 각 벡터의 x, y 성분 합산
    const rX = magR * Math.cos(0);
    const rY = magR * Math.sin(0);

    const sX = magS * Math.cos((2 * Math.PI) / 3);
    const sY = magS * Math.sin((2 * Math.PI) / 3);

    const tX = magT * Math.cos((4 * Math.PI) / 3);
    const tY = magT * Math.sin((4 * Math.PI) / 3);

    const netX = rX + sX + tX;
    const netY = rY + sY + tY;

    // 합성 벡터 회전 및 길이 적용
    if (vecNet.current) {
      const angle = Math.atan2(netY, netX);
      const length = Math.sqrt(netX * netX + netY * netY);

      // Three.js의 Cylinder는 y축이 길이 방향이므로 z축 회전 적용
      vecNet.current.rotation.z = angle - Math.PI / 2;
      vecNet.current.scale.y = length * 1.5; // 좀 더 잘 보이게 1.5배 확대
    }
  });

  return (
    <group ref={groupRef}>
      {/* 좌표축 보조선 (Grid) */}
      <gridHelper
        args={[10, 10, 0x888888, 0xeeeeee]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 1. 고정자 코일 배치 (R, S, T) */}
      {/* R상 (빨강, 0도 - 우측) */}
      <Coil position={[2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="red" />
      <group ref={vecR}>
        <VectorArrow color="red" scale={1} label="R" />
      </group>

      {/* S상 (초록, 120도 - 좌측 상단) */}
      <Coil
        position={[
          2.5 * Math.cos((2 * Math.PI) / 3),
          2.5 * Math.sin((2 * Math.PI) / 3),
          0,
        ]}
        rotation={[0, Math.PI / 2, (2 * Math.PI) / 3]}
        color="#00ff00"
      />
      <group ref={vecS}>
        <VectorArrow color="#00ff00" scale={1} label="S" />
      </group>

      {/* T상 (파랑, 240도 - 좌측 하단) */}
      <Coil
        position={[
          2.5 * Math.cos((4 * Math.PI) / 3),
          2.5 * Math.sin((4 * Math.PI) / 3),
          0,
        ]}
        rotation={[0, Math.PI / 2, (4 * Math.PI) / 3]}
        color="blue"
      />
      <group ref={vecT}>
        <VectorArrow color="blue" scale={1} label="T" />
      </group>

      {/* 2. 합성 회전 자계 (노랑 - 중앙에서 회전) */}
      <group ref={vecNet}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
          <meshStandardMaterial
            color="gold"
            emissive="gold"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.4, 0.8, 16]} />
          <meshStandardMaterial
            color="gold"
            emissive="gold"
            emissiveIntensity={0.5}
          />
        </mesh>
        <Html position={[0, 2.5, 0]}>
          <div className="bg-yellow-100 px-2 py-1 rounded border border-yellow-500 font-bold text-xs whitespace-nowrap">
            합성 자기장 (Rotating Field)
          </div>
        </Html>
      </group>
    </group>
  );
};

const RotatingField3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#111",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* 조명 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* 메인 씬 */}
        <MagneticFieldScene />

        {/* 마우스 컨트롤 (확대/축소/회전) */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default RotatingField3D;
