// src/components/animations/DotProduct3D.jsx
import { Html, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const DotProductScene = () => {
  const radius = 3;
  const speed = 0.5;
  const angleRef = useRef(0);

  const hypotenuseRef = useRef();
  const verticalRef = useRef();
  const baseRef = useRef();

  const [dotValue, setDotValue] = useState(1.0);
  const [angleDeg, setAngleDeg] = useState(0);

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

  // [수정] 빈 배열 대신 초기값으로 사용할 더미 좌표 생성
  const initialPoints = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)],
    []
  );

  useFrame((state, delta) => {
    angleRef.current += speed * delta;
    if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;

    const theta = angleRef.current;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;

    // ref를 통해 직접 좌표 업데이트 (성능 최적화)
    if (hypotenuseRef.current) {
      hypotenuseRef.current.setPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0),
      ]);
    }
    if (verticalRef.current) {
      verticalRef.current.setPoints([
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(x, 0, 0),
      ]);
    }
    if (baseRef.current) {
      baseRef.current.setPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, 0),
      ]);
      baseRef.current.material.color.set(x >= 0 ? "#ef4444" : "#3b82f6");
    }

    setDotValue((x / radius).toFixed(2));
    setAngleDeg((theta * (180 / Math.PI)).toFixed(0));
  });

  return (
    <group>
      <Line points={circlePoints} color="#666" lineWidth={1} dashed={true} />
      <Line
        points={[new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)]}
        color="#444"
        lineWidth={0.5}
      />

      {/* [중요 수정] points={[]} -> points={initialPoints} 로 변경하여 초기 렌더링 에러 방지 */}

      {/* 피상전력 (Apparent Power) */}
      <Line
        ref={hypotenuseRef}
        points={initialPoints}
        color="white"
        lineWidth={3}
      />

      {/* 무효전력 성분 (Reactive Component) */}
      <Line
        ref={verticalRef}
        points={initialPoints}
        color="yellow"
        lineWidth={1}
        dashed={true}
        dashScale={2}
        gapSize={1}
      />

      {/* 유효전력 (Active Power = Dot Product) */}
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
