import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🏭 사각형 철심 (Rectangular Iron Core)
const IronCore = ({ coreRef }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // 바깥쪽 사각형 (Outer bounds)
    s.moveTo(-2.2, -1.6);
    s.lineTo(2.2, -1.6);
    s.lineTo(2.2, 1.6);
    s.lineTo(-2.2, 1.6);
    s.lineTo(-2.2, -1.6);
    // 안쪽 사각형 (Inner hole)
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
    // 철심의 중심을 Z=0에 맞추기 위해 z위치 조정 (-depth/2)
    <mesh ref={coreRef} position={[0, 0, -0.4]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      {/* 자속이 통과하는 것을 강조하기 위해 철심 자체는 약간 어둡고 반사 재질로 설정 */}
      <meshStandardMaterial
        color="#444"
        roughness={0.2}
        metalness={0.9}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

// ✨ [NEW] 철심 내부를 통과하는 자속선 (Internal Flux Lines)
const InternalFluxLines = ({ fluxRef }) => {
  // 철심의 중심 경로를 따라가는 커브 생성
  const fluxPath = useMemo(() => {
    const path = new THREE.CurvePath();
    const w = 1.8; // 철심 중심 폭 ( (2.2+1.4)/2 )
    const h = 1.2; // 철심 중심 높이 ( (1.6+0.8)/2 )

    const p1 = new THREE.Vector3(-w, -h, 0);
    const p2 = new THREE.Vector3(w, -h, 0);
    const p3 = new THREE.Vector3(w, h, 0);
    const p4 = new THREE.Vector3(-w, h, 0);

    path.add(new THREE.LineCurve3(p1, p2)); // 하단
    path.add(new THREE.LineCurve3(p2, p3)); // 우측
    path.add(new THREE.LineCurve3(p3, p4)); // 상단
    path.add(new THREE.LineCurve3(p4, p1)); // 좌측
    return path;
  }, []);

  // 여러 개의 평행한 자속선을 만들어 철심 내부를 채움
  const numLines = 5;

  return (
    <group ref={fluxRef}>
      {[...Array(numLines)].map((_, i) => {
        // Z축으로 약간씩 오프셋을 주어 철심 두께 내부에 배치
        const zOffset = (i - (numLines - 1) / 2) * 0.15;
        return (
          <mesh key={i} position={[0, 0, zOffset]}>
            {/* 튜브 형태로 자속선 생성 (closed=true로 순환) */}
            <tubeGeometry args={[fluxPath, 128, 0.03, 8, true]} />
            {/* 빛나는 에너지 느낌의 재질 (BasicMaterial + 밝은색) */}
            <meshBasicMaterial
              color="#ff3300" // 밝은 주황/빨강색 자속
              transparent
              opacity={0} // 초기엔 안보임 (애니메이션으로 제어)
              depthWrite={false} // 철심 내부에 있어도 밝게 빛나도록
              blending={THREE.AdditiveBlending} // 빛 번짐 효과 추가
            />
          </mesh>
        );
      })}
    </group>
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
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      256,
      0.06,
      12,
      false
    );
  }, [turns, length, radius]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={coilGeometry}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
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
  const internalFluxRef = useRef(); // 내부 자속선 Ref
  const arrowFluxRef = useRef(); // 방향 화살표 Ref
  const fluxIntensityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3;
    // 0 ~ 1 사이로 맥동하는 자속 강도 (sin파)
    fluxIntensityRef.current = (Math.sin(t) + 1) / 2;

    const intensity = fluxIntensityRef.current;

    // 1. [핵심] 철심 내부 자속선의 불투명도 애니메이션
    if (internalFluxRef.current) {
      internalFluxRef.current.children.forEach((child) => {
        // 최소 0.1에서 최대 0.8까지 밝기 맥동
        child.material.opacity = 0.1 + intensity * 0.7;
      });
    }

    // 2. 철심 자체의 미세한 발광 (보조 효과)
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = intensity * 0.2;
    }

    // 3. 방향 화살표 애니메이션
    if (arrowFluxRef.current) {
      arrowFluxRef.current.children.forEach((child) => {
        child.material.opacity = intensity;
      });
    }
  });

  return (
    <group>
      {/* 1. 사각형 철심 */}
      <IronCore coreRef={coreRef} />

      {/* 2. [핵심] 철심 내부를 통과하는 자속선 추가 */}
      <InternalFluxLines fluxRef={internalFluxRef} />

      {/* 3. 1차 코일 (입력) */}
      <WindingCoil
        position={[-1.8, 0, 0]}
        rotation={[0, 0, 0]}
        color="#d97706"
        turns={10}
        length={1.4}
        radius={0.6}
        label="입력 (N1)"
        labelBg="#d97706"
      />

      {/* 4. 2차 코일 (출력) */}
      <WindingCoil
        position={[1.8, 0, 0]}
        rotation={[0, 0, 0]}
        color="#2563eb"
        turns={20}
        length={1.4}
        radius={0.65}
        label="출력 (N2 > N1)"
        labelBg="#2563eb"
      />

      {/* 5. 자속 방향 화살표 (보조 표시) */}
      <group ref={arrowFluxRef}>
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshBasicMaterial color="#ff3300" transparent opacity={0} />
        </mesh>
        <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshBasicMaterial color="#ff3300" transparent opacity={0} />
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
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        {/* 자속이 빛나는 느낌을 강조하기 위한 조명 추가 */}
        <pointLight position={[0, 0, 2]} intensity={0.5} color="#ff5500" />
        <Center>
          <TransformerScene />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Transformer3D;
