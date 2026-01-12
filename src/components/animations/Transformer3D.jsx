import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🎨 색상 팔레트
const COLORS = {
  PRIMARY_COIL: "#3b82f6", // 1차 코일 (파란색)
  SECONDARY_COIL: "#f97316", // 2차 코일 (주황색)
  CORE: "#475569", // 철심 (진한 회색)
  FLUX_FLOW: "#fbbf24", // 내부 자속 흐름 (밝은 노란색/주황색)
};

// 🏭 사각형 철심 (Rectangular Iron Core)
const IronCore = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.2, -1.6);
    s.lineTo(2.2, -1.6);
    s.lineTo(2.2, 1.6);
    s.lineTo(-2.2, 1.6);
    s.lineTo(-2.2, -1.6);
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
    () => ({ steps: 1, depth: 0.8, bevelEnabled: false }),
    []
  );

  return (
    <mesh position={[0, 0, -0.4]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={COLORS.CORE}
        roughness={0.6}
        metalness={0.3}
      />
    </mesh>
  );
};

// ✨ [NEW] 철심 내부를 통과하는 자속 흐름 (Internal Flux Path)
const InternalFluxFlow = () => {
  const fluxRef = useRef();

  // 철심의 중심선을 따라가는 닫힌 경로 생성
  const path = useMemo(() => {
    const p = new THREE.CurvePath();
    const width = 1.8; // 철심 중심 폭
    const height = 1.2; // 철심 중심 높이
    p.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-width, -height, 0),
        new THREE.Vector3(width, -height, 0)
      )
    ); // 하단
    p.add(
      new THREE.LineCurve3(
        new THREE.Vector3(width, -height, 0),
        new THREE.Vector3(width, height, 0)
      )
    ); // 우측
    p.add(
      new THREE.LineCurve3(
        new THREE.Vector3(width, height, 0),
        new THREE.Vector3(-width, height, 0)
      )
    ); // 상단
    p.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-width, height, 0),
        new THREE.Vector3(-width, -height, 0)
      )
    ); // 좌측
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (fluxRef.current) {
      const t = clock.getElapsedTime() * 3;
      // 자속의 밝기를 사인파로 맥동시켜 흐름 표현
      const intensity = (Math.sin(t) + 1) / 2;
      fluxRef.current.material.opacity = 0.2 + intensity * 0.8; // 밝기 범위: 0.2 ~ 1.0
    }
  });

  return (
    <mesh ref={fluxRef} position={[0, 0, 0]}>
      {/* 경로를 따라가는 튜브 생성 (closed=true) */}
      <tubeGeometry args={[path, 128, 0.15, 16, true]} />
      {/* 밝게 빛나는 에너지 느낌의 재질 */}
      <meshBasicMaterial
        color={COLORS.FLUX_FLOW}
        transparent
        opacity={0.8}
        depthWrite={false} // 철심 안에 있어도 보이게 설정
        blending={THREE.AdditiveBlending} // 빛 번짐 효과
      />
    </mesh>
  );
};

// 🌀 나선형 코일
const WindingCoil = ({
  position,
  color,
  turns,
  length,
  radius,
  label,
  labelBg,
}) => {
  const coilGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const angle = 2 * Math.PI * turns * t;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          (t - 0.5) * length,
          radius * Math.sin(angle)
        )
      );
    }
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      256,
      0.07,
      12,
      false
    );
  }, [turns, length, radius]);

  return (
    <group position={position}>
      <mesh geometry={coilGeometry}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <Html position={[0, length / 2 + 0.6, 0]} center>
        <div
          style={{ backgroundColor: labelBg }}
          className="text-white px-2 py-1 rounded font-bold text-sm shadow-sm whitespace-nowrap"
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// 🎬 메인 씬
const TransformerScene = () => {
  return (
    <group>
      {/* 1. 철심 */}
      <IronCore />

      {/* 2. [핵심] 철심 내부를 통과하는 자속 흐름 */}
      <InternalFluxFlow />

      {/* 3. 1차 코일 (파란색) */}
      <WindingCoil
        position={[-1.8, 0, 0]}
        color={COLORS.PRIMARY_COIL}
        turns={12}
        length={1.4}
        radius={0.6}
        label="Primary (N1)"
        labelBg={COLORS.PRIMARY_COIL}
      />

      {/* 4. 2차 코일 (주황색) */}
      <WindingCoil
        position={[1.8, 0, 0]}
        color={COLORS.SECONDARY_COIL}
        turns={24}
        length={1.4}
        radius={0.65}
        label="Secondary (N2)"
        labelBg={COLORS.SECONDARY_COIL}
      />

      {/* 중앙 자속 기호 */}
      <Html position={[0, 0, 0]} center>
        <div className="text-yellow-400 text-5xl font-black drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
          Φ
        </div>
      </Html>
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
        background: "#f1f5f9",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        {/* 자속이 빛나는 느낌을 강조하기 위한 중앙 조명 */}
        <pointLight
          position={[0, 0, 2]}
          intensity={0.5}
          color={COLORS.FLUX_FLOW}
        />
        <Center>
          <TransformerScene />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Transformer3D;
