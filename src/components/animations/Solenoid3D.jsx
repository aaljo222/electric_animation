import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Center } from "@react-three/drei";
import * as THREE from "three";

// 🎨 색상 팔레트
const COLORS = {
  COIL: "#ea580c", // 구리선 (Orange-600)
  FIELD: "#06b6d4", // 자기장 (Cyan-500)
  CURRENT: "#facc15", // 전류 입자 (Yellow-400) - 더 밝게
  BATTERY_POS: "#ef4444", // 배터리 + (Red)
  BATTERY_NEG: "#1f2937", // 배터리 - (Black)
};

// 🌀 [핵심] 나선형 경로 생성 함수 (코일과 전류가 공유)
// 오른쪽(+)에서 왼쪽(-)으로 감겨 들어가는 나선 경로
const createHelixCurve = () => {
  const points = [];
  const radius = 1.0;
  const length = 4.0;
  const turns = 14;

  // 400개의 점으로 부드러운 곡선 생성
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const angle = 2 * Math.PI * turns * t;

    // x: 2.0 -> -2.0 (오른쪽에서 왼쪽으로 이동)
    const x = 2.0 - t * length;
    // y, z: 원형 회전 (나선)
    const y = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points);
};

// 🏭 솔레노이드 코일 (The Wire)
const SolenoidCoil = ({ curve }) => {
  // curve 데이터를 기반으로 튜브 생성
  const tubeArgs = useMemo(() => [curve, 512, 0.08, 16, false], [curve]);

  return (
    <mesh>
      <tubeGeometry args={tubeArgs} />
      <meshStandardMaterial
        color={COLORS.COIL}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
};

// ⚡ [핵심 수정] 부드러운 전류 흐름 (Smooth Electron Flow)
const ElectronFlow = ({ curve }) => {
  // 80개의 입자로 촘촘한 흐름 생성 (끊김 방지)
  const numParticles = 80;
  const particlesRef = useRef([]);

  useFrame(({ clock }) => {
    // 흐름 속도 조절 (너무 빠르면 랜덤하게 보임)
    const t = clock.getElapsedTime() * 0.15;

    particlesRef.current.forEach((mesh, i) => {
      if (mesh) {
        // 0.0 ~ 1.0 사이의 균일한 간격 (offset) 계산
        // (t + i / numParticles) % 1 : 입자들이 줄지어 순환하는 공식
        const u = (t + i / numParticles) % 1;

        // 곡선 위의 해당 위치 좌표를 정확히 가져옴
        const pos = curve.getPointAt(u);
        mesh.position.copy(pos);
      }
    });
  });

  return (
    <group>
      {[...Array(numParticles)].map((_, i) => (
        <mesh key={i} ref={(el) => (particlesRef.current[i] = el)}>
          <sphereGeometry args={[0.06, 8, 8]} /> {/* 전선보다 약간 작은 입자 */}
          <meshBasicMaterial color={COLORS.CURRENT} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ✨ 자기장 (Magnetic Field)
const MagneticField = () => {
  const fluxRef = useRef();

  useFrame(({ clock }) => {
    if (fluxRef.current) {
      // 자기장 투명도 맥동 효과 (숨쉬는 듯한 느낌)
      const opacity = 0.2 + (Math.sin(clock.getElapsedTime() * 3) + 1) * 0.1;
      fluxRef.current.children.forEach((child) => {
        if (child.material) child.material.opacity = opacity;
      });
    }
  });

  const createLoop = (rotationY) => {
    const points = [];
    const width = 6.5;
    const height = 3.5;
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI;
      points.push(
        new THREE.Vector3(
          Math.cos(t) * (width / 2),
          Math.sin(t) * (height / 2),
          0
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return (
      <group rotation={[rotationY, 0, 0]}>
        <mesh>
          <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
          <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI, 0, 0]}>
          <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
          <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={fluxRef}>
      {/* 내부 직선 자기장 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
        <meshBasicMaterial color={COLORS.FIELD} transparent opacity={0.4} />
      </mesh>
      {/* 외부 자속 루프 */}
      {createLoop(0)} {createLoop(Math.PI / 3)} {createLoop((2 * Math.PI) / 3)}
      {/* N극 화살표 머리 (왼쪽) */}
      <mesh position={[-4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshBasicMaterial color={COLORS.FIELD} />
      </mesh>
      {/* 라벨 */}
      <Html position={[-3, 0, 0]} center>
        <div className="text-4xl font-black text-cyan-500 drop-shadow-md select-none">
          N
        </div>
      </Html>
      <Html position={[3, 0, 0]} center>
        <div className="text-4xl font-black text-blue-700 drop-shadow-md select-none">
          S
        </div>
      </Html>
    </group>
  );
};

// 🔋 배터리 및 회로
const Circuit = () => {
  return (
    <group position={[0, -2.5, 0]}>
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial color={COLORS.BATTERY_NEG} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.5, 32]} />
          <meshStandardMaterial color={COLORS.BATTERY_POS} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <Html position={[-0.5, 0, 0]} center>
          <div className="text-white font-bold text-xl select-none">+</div>
        </Html>
        <Html position={[0.5, 0, 0]} center>
          <div className="text-white font-bold text-xl select-none">-</div>
        </Html>
      </group>

      {/* 전선 연결 (오른쪽에서 들어가서 왼쪽으로 나옴) */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([-0.9, 0, 0, -2.0, 0, 0, -2.0, 2.0, 0]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={3} />
      </line>
      <line>
        <bufferGeometry
          attach="geometry"
          attributes-position={
            new THREE.BufferAttribute(
              new Float32Array([1.25, 0, 0, 2.0, 0, 0, 2.0, 2.0, 0]),
              3
            )
          }
        />
        <lineBasicMaterial attach="material" color="#333" linewidth={3} />
      </line>

      {/* 전류 방향 화살표 (I) */}
      <Html position={[1.5, 1, 0]} center>
        <div className="text-yellow-500 font-bold text-lg select-none">↑ I</div>
      </Html>
      <Html position={[-1.5, 1, 0]} center>
        <div className="text-yellow-500 font-bold text-lg select-none">↓ I</div>
      </Html>
    </group>
  );
};

const SolenoidScene = () => {
  // 곡선 데이터를 한 번만 생성하여 코일과 전자가 공유함 -> 경로 완벽 일치
  const curve = useMemo(() => createHelixCurve(), []);

  return (
    <group>
      <SolenoidCoil curve={curve} />
      <ElectronFlow curve={curve} />
      <MagneticField />
      <Circuit />
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
        <Center>
          <SolenoidScene />
        </Center>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Solenoid3D;
