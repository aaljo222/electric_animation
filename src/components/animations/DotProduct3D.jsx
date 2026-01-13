import { Html, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const DotProductScene = () => {
  const radius = 3;
  const speed = 0.5;
  const angleRef = useRef(0);

  // Line 컴포넌트의 ref (Line2 객체)
  const hypotenuseRef = useRef();
  const verticalRef = useRef();
  const baseRef = useRef();

  const [dotValue, setDotValue] = useState(1.0);
  const [angleDeg, setAngleDeg] = useState(0);

  // 배경 원 (정적)
  const circlePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
      );
    }
    return points;
  }, []);

  // 초기값 (에러 방지용)
  const initialPoints = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(radius, 0, 0)],
    []
  );

  useFrame((state, delta) => {
    // 1. 각도 업데이트
    angleRef.current += speed * delta;
    if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;

    const theta = angleRef.current;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;

    // 2. 좌표 업데이트 (setPoints 대신 geometry.setPositions 사용)
    // 주의: [x1, y1, z1, x2, y2, z2] 형태의 1차원 배열이어야 함

    // 빗변 (원점 -> 회전점)
    if (hypotenuseRef.current && hypotenuseRef.current.geometry) {
      hypotenuseRef.current.geometry.setPositions([0, 0, 0, x, y, 0]);
    }

    // 높이 (회전점 -> X축 투영점)
    if (verticalRef.current && verticalRef.current.geometry) {
      verticalRef.current.geometry.setPositions([x, y, 0, x, 0, 0]);
      // 점선이 움직일 때 간격 재계산이 필요할 수 있음
      if (verticalRef.current.computeLineDistances) {
        verticalRef.current.computeLineDistances();
      }
    }

    // 밑변 (원점 -> X축 투영점 = 내적값)
    if (baseRef.current && baseRef.current.geometry) {
      baseRef.current.geometry.setPositions([0, 0, 0, x, 0, 0]);
      // 색상은 material을 통해 변경
      baseRef.current.material.color.set(x >= 0 ? "#ef4444" : "#3b82f6");
    }

    // 3. UI 값 업데이트
    setDotValue((x / radius).toFixed(2));
    setAngleDeg((theta * (180 / Math.PI)).toFixed(0));
  });

  return (
    <group>
      {/* 배경 원 */}
      <Line points={circlePoints} color="#666" lineWidth={1} dashed={true} />
      <Line
        points={[new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)]}
        color="#444"
        lineWidth={0.5}
      />

      {/* 빗변 (Apparent Power) */}
      <Line
        ref={hypotenuseRef}
        points={initialPoints}
        color="white"
        lineWidth={3}
      />

      {/* 높이 (Reactive Power) - 점선 */}
      <Line
        ref={verticalRef}
        points={initialPoints}
        color="yellow"
        lineWidth={1}
        dashed={true}
        dashScale={2}
        gapSize={1}
      />

      {/* 밑변 (Active Power) */}
      <Line
        ref={baseRef}
        points={initialPoints}
        color="#ef4444"
        lineWidth={6}
      />

      <Text position={[0, -0.6, 0]} fontSize={0.25} color="#aaa">
        Active Power (cosθ)
      </Text>

      <Html position={[0, -2.5, 0]} center>
        <div
          style={{
            color: "white",
            background: "rgba(0,0,0,0.6)",
            padding: "8px 12px",
            borderRadius: "6px",
            textAlign: "center",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
        >
          <div>Phase: {angleDeg}°</div>
          <div
            style={{
              fontWeight: "bold",
              color: parseFloat(dotValue) >= 0 ? "#f87171" : "#60a5fa",
            }}
          >
            Power Factor: {dotValue}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default function DotProduct3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <OrbitControls makeDefault enableZoom={false} />
      <DotProductScene />
      <gridHelper
        args={[10, 10, 0x444444, 0x222222]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </Canvas>
  );
}
