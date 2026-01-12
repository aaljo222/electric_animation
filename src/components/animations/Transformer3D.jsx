import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🎨 색상 팔레트 (오른쪽 이미지와 일치시킴)
const COLORS = {
  PRIMARY_COIL: "#3b82f6", // 1차 코일 (파란색 - Blue-500)
  SECONDARY_COIL: "#f97316", // 2차 코일 (주황색 - Orange-500)
  CORE_OFF: "#64748b", // 철심 기본색 (회색 - Slate-500)
  CORE_ON: "#fb923c", // 철심 발광색 (주황 계열 - Orange-400)
  FLUX_ARROW: "#ef4444", // 자속 화살표 (빨간색 - Red-500)
};

// 🏭 사각형 철심 (Rectangular Iron Core)
const IronCore = ({ fluxIntensity, coreRef }) => {
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
    <mesh ref={coreRef} position={[0, 0, -0.4]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      {/* 자속에 따라 은은하게 발광 (강도 줄임) */}
      <meshStandardMaterial
        color={COLORS.CORE_OFF}
        roughness={0.5}
        metalness={0.4}
        emissive={COLORS.CORE_ON}
        emissiveIntensity={fluxIntensity * 0.2} // 발광 강도 약하게
      />
    </mesh>
  );
};

// 🌀 나선형 코일 (Helical Winding Coil)
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
    // 코일 선 두께를 약간 늘려 잘 보이게 함 (0.06 -> 0.07)
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      256,
      0.07,
      12,
      false
    );
  }, [turns, length, radius]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={coilGeometry}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* 라벨 디자인 개선 */}
      <Html position={[0, length / 2 + 0.7, 0]} center>
        <div
          style={{ backgroundColor: labelBg }}
          className="text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-md whitespace-nowrap"
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

// ✨ [NEW] 자속 방향을 나타내는 큰 화살표들
const FluxArrows = ({ fluxRef }) => {
  // 화살표 모양 (Cone + Cylinder)
  const ArrowMesh = () => (
    <group rotation={[0, 0, -Math.PI / 2]}>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial color={COLORS.FLUX_ARROW} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1]} />
        <meshBasicMaterial color={COLORS.FLUX_ARROW} />
      </mesh>
    </group>
  );

  return (
    <group ref={fluxRef}>
      {/* 상단 화살표 (오른쪽 방향) */}
      <mesh position={[0, 1.2, 0]}>
        <ArrowMesh />
      </mesh>
      {/* 하단 화살표 (왼쪽 방향) */}
      <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI]}>
        <ArrowMesh />
      </mesh>
      {/* 좌측 화살표 (위쪽 방향) */}
      <mesh position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <ArrowMesh />
      </mesh>
      {/* 우측 화살표 (아래쪽 방향) */}
      <mesh position={[1.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <ArrowMesh />
      </mesh>

      {/* 자속 기호 Φ (Phi) */}
      <Html position={[0, 0, 0]} center>
        <div className="text-red-500 text-4xl font-black drop-shadow-lg">Φ</div>
      </Html>
    </group>
  );
};

// 🎬 메인 변압기 씬
const TransformerScene = () => {
  const coreRef = useRef();
  const fluxRef = useRef();
  const fluxIntensityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5;
    // 교류 맥동 (0 ~ 1)
    fluxIntensityRef.current = (Math.sin(t) + 1) / 2;
    const intensity = fluxIntensityRef.current;

    // 1. 철심 발광 애니메이션
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = intensity * 0.3;
    }
    // 2. 화살표 투명도 애니메이션 (깜빡임)
    if (fluxRef.current) {
      fluxRef.current.children.forEach((child) => {
        // Html 컴포넌트(Φ)는 제외하고 메시에만 적용
        if (child.material) child.material.opacity = 0.3 + intensity * 0.7;
      });
    }
  });

  return (
    <group>
      {/* 1. 사각형 철심 */}
      <IronCore coreRef={coreRef} fluxIntensity={0} />

      {/* 2. 1차 코일 (입력 - 파란색) */}
      <WindingCoil
        position={[-1.8, 0, 0]}
        color={COLORS.PRIMARY_COIL} // 파란색 적용
        turns={12}
        length={1.4}
        radius={0.6}
        label="Primary (N1)"
        labelBg={COLORS.PRIMARY_COIL}
      />

      {/* 3. 2차 코일 (출력 - 주황색) */}
      <WindingCoil
        position={[1.8, 0, 0]}
        color={COLORS.SECONDARY_COIL} // 주황색 적용
        turns={24} // 권수 2배 (승압)
        length={1.4}
        radius={0.65}
        label="Secondary (N2)"
        labelBg={COLORS.SECONDARY_COIL}
      />

      {/* 4. [NEW] 자속 방향 큰 화살표들 */}
      <FluxArrows fluxRef={fluxRef} />
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
        <ambientLight intensity={0.8} /> {/* 전체적으로 밝게 */}
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} />
        <Center>
          <TransformerScene />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Transformer3D;
