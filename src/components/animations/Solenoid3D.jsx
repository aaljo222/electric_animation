import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🎨 색상 팔레트
const COLORS = {
  COIL: "#ea580c", // 구리선 (Orange-600)
  FIELD: "#06b6d4", // 자기장 (Cyan-500)
  CURRENT: "#facc15", // 전류 입자 (Yellow-400)
  BATTERY_POS: "#ef4444", // 배터리 + (Red)
  BATTERY_NEG: "#1f2937", // 배터리 - (Black)
};

// 🌀 나선형 코일 (Real Helix Coil)
const SolenoidCoil = () => {
  // 나선형 경로 생성
  const { curve, tubeArgs } = useMemo(() => {
    const points = [];
    const radius = 1.0;
    const length = 4.0;
    const turns = 14; // 감긴 횟수

    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const angle = 2 * Math.PI * turns * t;
      // 나선 방정식
      const x = (t - 0.5) * length;
      const y = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return { curve, tubeArgs: [curve, 512, 0.08, 12, false] };
  }, []);

  return (
    <group>
      {/* 코일 메시 */}
      <mesh>
        <tubeGeometry args={tubeArgs} />
        <meshStandardMaterial
          color={COLORS.COIL}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
};

// ⚡ 전류 흐름 입자 (Current Particles)
const CurrentFlow = () => {
  const particles = useRef([]);
  // 코일과 동일한 경로 데이터 생성 (입자 이동용)
  const curve = useMemo(() => {
    const points = [];
    const radius = 1.0;
    const length = 4.0;
    const turns = 14;
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const angle = 2 * Math.PI * turns * t;
      const x = (t - 0.5) * length;
      const y = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5; // 이동 속도
    particles.current.forEach((mesh, i) => {
      // 0~1 사이의 위치 계산 (일정한 간격으로 배치)
      const u = (t + i * 0.05) % 1;
      const pos = curve.getPointAt(u);
      mesh.position.copy(pos);
    });
  });

  return (
    <group>
      {[...Array(20)].map((_, i) => (
        <mesh key={i} ref={(el) => (particles.current[i] = el)}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={COLORS.CURRENT} />
        </mesh>
      ))}
      <Html position={[0, 1.5, 0]}>
        <div className="text-yellow-400 font-bold text-xs bg-black/50 px-1 rounded">
          Current (I)
        </div>
      </Html>
    </group>
  );
};

// ✨ 자기장 (Magnetic Field) - 직선 및 루프
const MagneticField = () => {
  const fluxRef = useRef();

  useFrame(({ clock }) => {
    if (fluxRef.current) {
      // 맥동 효과
      const opacity = 0.3 + (Math.sin(clock.getElapsedTime() * 3) + 1) * 0.1;
      fluxRef.current.children.forEach((child) => {
        if (child.material) child.material.opacity = opacity;
      });
    }
  });

  // 외부 자속 루프 생성 함수
  const createLoop = (rotationY) => {
    const points = [];
    const width = 6;
    const height = 3.5;
    // 타원형 경로 근사
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI; // 0 to PI (반원)
      const x = Math.cos(t) * (width / 2);
      const y = Math.sin(t) * (height / 2);
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return (
      <group rotation={[rotationY, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
          <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.4} />
        </mesh>
        {/* 반대편 대칭 */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
          <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.4} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={fluxRef}>
      {/* 1. 내부 직선 자기장 (강력함) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
        <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.5} />
      </mesh>

      {/* 2. 외부 자속 루프 (여러 각도로 배치) */}
      {createLoop(0)}
      {createLoop(Math.PI / 3)}
      {createLoop((2 * Math.PI) / 3)}

      {/* 3. 화살표 머리 (N극 방향 - 왼쪽) */}
      {/* 오른나사 법칙: 전류가 위로 감기면 엄지는 왼쪽(N) */}
      <mesh position={[-4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshBasicMaterial color={COLORS.FIELD} />
      </mesh>

      {/* 극 라벨 */}
      <Html position={[-2.5, 0, 0]} center>
        <div className="text-4xl font-black text-cyan-500 bg-black/20 rounded px-2">
          N
        </div>
      </Html>
      <Html position={[2.5, 0, 0]} center>
        <div className="text-4xl font-black text-blue-700 bg-white/20 rounded px-2">
          S
        </div>
      </Html>
      <Html position={[-5, 0, 0]} center>
        <div className="text-cyan-400 font-bold whitespace-nowrap">
          Magnetic Field (B)
        </div>
      </Html>
    </group>
  );
};

// 🔋 배터리와 회로 (Battery Circuit)
const BatteryCircuit = () => {
  return (
    <group position={[0, -2.5, 0]}>
      {/* 배터리 본체 */}
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial color={COLORS.BATTERY_NEG} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.5, 32]} />
          <meshStandardMaterial color={COLORS.BATTERY_POS} />
        </mesh>
        {/* 배터리 +극 돌기 */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <Html position={[-0.5, 0, 0]} center>
          <div className="text-white font-bold text-xl">+</div>
        </Html>
        <Html position={[0.5, 0, 0]} center>
          <div className="text-white font-bold text-xl">-</div>
        </Html>
      </group>

      {/* 전선 연결 */}
      {/* 왼쪽(+) -> 코일 왼쪽 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([
                -0.9,
                0,
                0, // 배터리 +
                -2.0,
                0,
                0, // 왼쪽으로
                -2.0,
                2.5,
                0, // 위로 (코일 시작점 근처)
              ]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={3} />
      </line>

      {/* 오른쪽(-) -> 코일 오른쪽 */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([
                1.25,
                0,
                0, // 배터리 -
                2.0,
                0,
                0, // 오른쪽으로
                2.0,
                2.5,
                0, // 위로
              ]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={3} />
      </line>
    </group>
  );
};

const SolenoidScene = () => {
  return (
    <group>
      {/* 1. 나선형 코일 */}
      <SolenoidCoil />

      {/* 2. 전류 흐름 (노란 입자) */}
      <CurrentFlow />

      {/* 3. 자기장 (직선 및 루프) */}
      <MagneticField />

      {/* 4. 배터리 회로 */}
      <BatteryCircuit />
    </group>
  );
};

const Solenoid3D = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1e293b",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -5, 5]} intensity={0.5} />

        <Center>
          <SolenoidScene />
        </Center>

        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Solenoid3D;
