import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, CatmullRomLine, Float } from "@react-three/drei";
import * as THREE from "three";

// ⚡ 번개(전기 아크) 효과 컴포넌트
// 무작위로 꿈틀거리는 빛나는 선을 만듭니다.
const ElectricArc = ({ color, radius, speed }) => {
  const lineRef = useRef();

  // 불규칙한 곡선 생성
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.5; // 반지름에 노이즈 추가
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = (Math.random() - 0.5) * 1.5; // Z축으로도 퍼짐
      p.push(new THREE.Vector3(x, y, z));
    }
    // 닫힌 곡선으로 만듦
    p.push(p[0]);
    return p;
  }, [radius]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      // 1. 회전
      lineRef.current.rotation.z -= speed * 0.05;
      lineRef.current.rotation.x =
        Math.sin(clock.getElapsedTime() * speed) * 0.5;

      // 2. 깜빡임 효과 (Opacity 조절)
      lineRef.current.material.opacity = 0.5 + Math.random() * 0.5;
      lineRef.current.material.linewidth = 2 + Math.random() * 3;
    }
  });

  return (
    <group>
      <CatmullRomLine
        ref={lineRef}
        points={points}
        closed
        curveType="catmullrom"
        tension={0.5}
        color={color}
        lineWidth={3} // 선 두께
      />
      {/* 빛 번짐 효과를 위한 투명 튜브 */}
      <mesh ref={lineRef}>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(points, true), 64, 0.05, 8, true]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// 🌀 구리 권선 (Copper Coils) 컴포넌트
const CopperWinding = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* 여러 겹의 코일을 표현하기 위해 반복 */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, i * 0.08 - 0.2, 0]}>
          <torusGeometry args={[0.4, 0.03, 8, 20, Math.PI]} />
          <meshStandardMaterial
            color="#b87333" // 구리색
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// 🏭 모터 본체 (Cutaway View)
const MotorBody = () => {
  const casingRef = useRef();

  return (
    <group>
      {/* 1. 외부 케이싱 (반으로 잘린 원통) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        {/* thetaLength: Math.PI 로 설정하여 반원통 생성 */}
        <cylinderGeometry args={[2.5, 2.5, 4, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#a0a0a0" // 은색 금속
          metalness={0.9}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 케이싱 두께 표현 (내부 어두운 면) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.4, 2.4, 4, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. 고정자 철심 (Stator Core) */}
      <group>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI) / 6]}
            position={[0, 0, 0]}
          >
            <boxGeometry args={[4, 0.5, 1]} />
            <meshStandardMaterial color="#555" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 3. 구리 권선 배치 (슬롯 사이사이) */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * Math.PI) / 6 + Math.PI / 12;
        return (
          <CopperWinding
            key={i}
            position={[1.8 * Math.cos(angle), 1.8 * Math.sin(angle), 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
          />
        );
      })}

      {/* 4. 회전자 (Rotor) & 축 (Shaft) */}
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* 회전자 몸통 */}
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 3, 32]} />
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.5} />
        </mesh>
        {/* 축 (Shaft) - 밖으로 튀어나옴 */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 6, 16]} />
          <meshStandardMaterial color="#ddd" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. 전기 효과 (Electric Arcs) */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
          <ElectricArc color="yellow" radius={1.5} speed={2} />
          <ElectricArc color="#ffaa00" radius={1.3} speed={3} />
          <ElectricArc color="white" radius={1.6} speed={4} />
        </Float>
      </group>
    </group>
  );
};

const ElectricMotorModel = () => {
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
      <Canvas camera={{ position: [4, 2, 5], fov: 45 }}>
        {/* 조명: 금속 질감을 살리기 위한 조명 배치 */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -5, 5]} intensity={0.5} color="blue" />{" "}
        {/* 파란색 반사광 */}
        <spotLight
          position={[5, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          castShadow
        />
        {/* 메인 모델 */}
        <MotorBody />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ElectricMotorModel;
