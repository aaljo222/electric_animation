import React, { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";

// 코일 컴포넌트
function RotatingCoil() {
  const coilRef = useRef();
  // 이미지 로드 (public 폴더나 assets 경로)
  const coilTexture = useLoader(TextureLoader, "/assets/images/coil.png");

  useFrame((state, delta) => {
    // x축을 기준으로 회전 (책장이 넘어가듯 회전)
    // 발전기 원리상 코일은 축을 중심으로 돕니다.
    if (coilRef.current) {
      coilRef.current.rotation.x += delta * 2; // 회전 속도 조절
    }
  });

  return (
    <mesh ref={coilRef} position={[0, 0, 0.1]}> 
      {/* position z=0.1은 배경보다 살짝 앞에 두기 위함 */}
      <planeGeometry args={[3, 2]} /> {/* 이미지 비율에 맞춰 크기 조절 */}
      <meshBasicMaterial map={coilTexture} transparent={true} side={2} /> 
      {/* side={2}는 DoubleSide: 뒤집혔을 때도 그림이 보이게 함 */}
    </mesh>
  );
}

// 배경 컴포넌트
function Background() {
  const bgTexture = useLoader(TextureLoader, "/assets/images/background.png");
  
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[5, 3]} /> {/* 배경 크기 */}
      <meshBasicMaterial map={bgTexture} />
    </mesh>
  );
}

export default function GeneratorScene() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <Background />
        <RotatingCoil />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}