import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🏭 사각형 철심 (Rectangular Iron Core) 컴포넌트
const IronCore = ({ fluxIntensity, coreRef }) => {
  // 사각형 모양의 단면을 만들고 두께를 주어(Extrude) 철심을 생성합니다.
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // 바깥쪽 사각형
    s.moveTo(-2.2, -1.6);
    s.lineTo(2.2, -1.6);
    s.lineTo(2.2, 1.6);
    s.lineTo(-2.2, 1.6);
    s.lineTo(-2.2, -1.6);
    // 안쪽 사각형 (구멍)
    const hole = new THREE.Path();
    hole.moveTo(-1.4, -0.8);
    hole.lineTo(1.4, -0.8);
    hole.lineTo(1.4, 0.8);
    hole.lineTo(-1.4, 0.8);
    hole.lineTo(-1.4, -0.8);
    s.holes.push(hole);
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.8, // 철심의 두께 (Z축 방향)
      bevelEnabled: false,
    }),
    []
  );

  return (
    <mesh ref={coreRef} position={[0, 0, -0.4]}>
      {" "}
      {/* 중앙 정렬을 위해 위치 조정 */}
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color="#555"
        roughness={0.3}
        metalness={0.8}
        // 자속(flux) 변화에 따라 철심이 은은하게 빛나는 효과
        emissive="#ff5500"
        emissiveIntensity={fluxIntensity * 0.3}
      />
    </mesh>
  );
};

// 🌀 나선형 코일 (Helical Winding Coil) 컴포넌트
const WindingCoil = ({
  position,
  rotation,
  color,
  turns,
  length,
  radius,
  label,
  labelBg,
}) => {
  // 나선형 경로 생성
  const coilGeometry = useMemo(() => {
    const points = [];
    // 코일이 감기는 경로 계산
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const angle = 2 * Math.PI * turns * t;
      // 원형 단면을 따라 나선형으로 감김
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      // 코일의 길이 방향 (Y축 기준)
      const y = (t - 0.5) * length;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    // 튜브 형태로 지오메트리 생성 (경로, 분할수, 전선두께, 원형분할수, 닫힘여부)
    return new THREE.TubeGeometry(curve, 256, 0.06, 12, false);
  }, [turns, length, radius]);

  return (
    <group position={position} rotation={rotation}>
      {/* 코일 메시 */}
      <mesh geometry={coilGeometry}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* 코일 라벨 */}
      <Html position={[0, length / 2 + 0.5, 0]} center>
        <div
          style={{ backgroundColor: labelBg }}
          className="text-white px-2 py-1 rounded font-bold text-sm whitespace-nowrap"
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// 🎬 메인 변압기 씬
const TransformerScene = () => {
  const coreRef = useRef();
  const fluxRef = useRef();
  // 자속 강도를 state로 관리하지 않고 ref로 직접 접근하여 성능 최적화
  const fluxIntensityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3;
    // 0 ~ 1 사이로 맥동하는 자속 강도 계산
    fluxIntensityRef.current = (Math.sin(t) + 1) / 2;

    // 1. 철심의 자속 맥동 표현 (Emissive 강도 조절)
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity =
        fluxIntensityRef.current * 0.5;
    }
    // 2. 자속 화살표 애니메이션 (투명도 조절)
    if (fluxRef.current) {
      fluxRef.current.children.forEach((child) => {
        child.material.opacity = fluxIntensityRef.current;
      });
    }
  });

  return (
    <group>
      {/* --- 1. 사각형 철심 (Rectangular Iron Core) --- */}
      {/* fluxIntensity는 useFrame에서 직접 제어하므로 prop으로 전달하지 않아도 됨 */}
      <IronCore coreRef={coreRef} fluxIntensity={0} />

      {/* --- 2. 1차 코일 (Primary Coil - 입력, 빨강) --- */}
      {/* 왼쪽 변에 위치, 권수(turns)를 적게 설정 */}
      <WindingCoil
        position={[-1.8, 0, 0]}
        rotation={[0, 0, 0]} // Y축 방향으로 정렬
        color="#d97706" // 구리색/빨강 계열
        turns={10} // 권수 N1 (적음)
        length={1.4} // 코일 길이
        radius={0.6} // 코일 반경
        label="입력 (N1)"
        labelBg="#d97706"
      />

      {/* --- 3. 2차 코일 (Secondary Coil - 출력, 파랑) --- */}
      {/* 오른쪽 변에 위치, 권수(turns)를 많게 설정 (승압 변압기 표현) */}
      <WindingCoil
        position={[1.8, 0, 0]}
        rotation={[0, 0, 0]} // Y축 방향으로 정렬
        color="#2563eb" // 파란색
        turns={20} // 권수 N2 (많음, N2 > N1)
        length={1.4} // 코일 길이
        radius={0.65} // 코일 반경 (권수가 많아 약간 더 두껍게)
        label="출력 (N2 > N1)"
        labelBg="#2563eb"
      />

      {/* --- 4. 자속 흐름 표시 (화살표) --- */}
      {/* 사각형 철심의 위/아래 경로에 맞춰 화살표 배치 */}
      <group ref={fluxRef}>
        {/* 위쪽 화살표 (오른쪽으로) */}
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0} />
        </mesh>
        {/* 아래쪽 화살표 (왼쪽으로) */}
        <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
};

// 🖼️ 최종 컴포넌트
const Transformer3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f0f2f5",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[0, 5, 10]} angle={0.3} intensity={0.5} />
        <Center>
          <TransformerScene />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Transformer3D;
