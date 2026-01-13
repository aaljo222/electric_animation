import { Html, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const DotProductSimulation = () => {
  const radius = 3; // 벡터의 길이 (반지름)
  const speed = 0.01; // 회전 속도

  // 1. 상태 관리 및 Ref 설정
  const angleRef = useRef(0); // 회전 각도 (Rad)
  const rotatingVectorRef = useRef(); // 회전하는 벡터 (Line)
  const projectionLineRef = useRef(); // 투영선 (점선)
  const dotProductLineRef = useRef(); // 내적 결과선 (실선)

  // UI 표시용 상태
  const [info, setInfo] = useState({
    angle: 0,
    dotProduct: 0,
    projection: 0,
  });

  // 2. 고정된 벡터 (X축 위에 고정) - 파란색
  const fixedVectorPoints = useMemo(
    () => [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(radius, 0, 0), // 길이 3만큼 X축에 고정
    ],
    []
  );

  // 3. 애니메이션 루프 (매 프레임 실행)
  useFrame(() => {
    // 각도 증가 (반시계 방향)
    angleRef.current += speed;
    if (angleRef.current > Math.PI * 2) {
      angleRef.current -= Math.PI * 2;
    }

    const theta = angleRef.current;

    // 회전하는 벡터의 끝점 좌표 (x, y)
    // x = r * cos(θ), y = r * sin(θ)
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;

    // A. 회전하는 벡터 업데이트 (원점 -> 회전 좌표)
    if (rotatingVectorRef.current) {
      rotatingVectorRef.current.setPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0),
      ]);
    }

    // B. 투영선 업데이트 (회전 좌표 -> X축 위 투영점)
    if (projectionLineRef.current) {
      projectionLineRef.current.setPoints([
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(x, 0, 0),
      ]);
    }

    // C. 내적 값(결과) 업데이트 (원점 -> 투영점)
    // 내적의 기하학적 의미: |A| * |B| * cos(θ)
    // 여기서는 시각화를 위해 투영된 길이 자체를 붉은 선으로 표시
    if (dotProductLineRef.current) {
      dotProductLineRef.current.setPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, 0),
      ]);

      // 내적 값이 양수면 빨강, 음수면 파랑으로 색상 변경하여 직관성 높임
      const color = x >= 0 ? "#ff4d4d" : "#4d4dff";
      dotProductLineRef.current.material.color.set(color);
    }

    // D. 텍스트 정보 업데이트 (성능을 위해 5프레임마다 한 번씩만 업데이트하거나 throttle 적용 가능)
    // 여기서는 간단히 매 프레임 계산
    setInfo({
      angle: (theta * (180 / Math.PI)).toFixed(0),
      dotProduct: (x * radius).toFixed(2), // 내적 공식: A·B (A길이=radius, 투영길이=x)
      projection: x.toFixed(2),
    });
  });

  return (
    <group>
      {/* 배경 그리드 및 가이드 */}
      <gridHelper
        args={[10, 10, 0x444444, 0x222222]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 1. 고정된 벡터 (Fixed Vector) */}
      <Line points={fixedVectorPoints} color="#00a8ff" lineWidth={4} />
      <Text position={[1.5, -0.3, 0]} fontSize={0.2} color="#00a8ff">
        Fixed Vector (A)
      </Text>

      {/* 2. 회전하는 벡터 (Rotating Vector) */}
      <Line ref={rotatingVectorRef} points={[]} color="#fbc531" lineWidth={4} />
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.2}
        color="#fbc531"
        anchorX="center"
      >
        Rotating Vector (B)
      </Text>

      {/* 3. 투영선 (Projection Line) */}
      <Line
        ref={projectionLineRef}
        points={[]}
        color="white"
        lineWidth={1}
        dashed={true}
        dashScale={2}
        gapSize={1}
      />

      {/* 4. 내적 결과 (Dot Product Result) */}
      <Line ref={dotProductLineRef} points={[]} color="#ff4d4d" lineWidth={8} />

      {/* 정보 패널 (HTML Overlay) */}
      <Html position={[0, -2, 0]} center>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            fontFamily: "monospace",
            minWidth: "250px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", borderBottom: "1px solid #555" }}>
            Vector Dot Product
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Angle (θ):</span>
            <span style={{ color: "#fbc531" }}>{info.angle}°</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            <span>Projection (cosθ):</span>
            <span>{info.projection}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
              fontWeight: "bold",
            }}
          >
            <span>Result (A·B):</span>
            <span
              style={{
                color: parseFloat(info.dotProduct) >= 0 ? "#ff4d4d" : "#4d4dff",
              }}
            >
              {info.dotProduct}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1e1e1e" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <DotProductSimulation />
      </Canvas>
    </div>
  );
}
