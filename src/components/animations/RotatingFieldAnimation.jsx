import React from "react";
import { motion } from "framer-motion";

const RotatingFieldAnimation = () => {
  // 애니메이션 설정
  const transition = {
    duration: 4, // 한 바퀴 도는 데 걸리는 시간 (초)
    ease: "linear",
    repeat: Infinity,
  };

  // 각 상(Phase)의 코일 위치 및 색상
  const coils = [
    { id: "A", color: "#FF5733", rotate: 0 }, // R상 (빨강)
    { id: "B", color: "#33FF57", rotate: 120 }, // S상 (초록)
    { id: "C", color: "#3357FF", rotate: 240 }, // T상 (파랑)
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        borderRadius: "12px",
      }}
    >
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 고정자(Stator) 배경원 */}
        <circle
          cx="150"
          cy="150"
          r="130"
          stroke="#ddd"
          strokeWidth="2"
          fill="none"
        />

        {/* 3상 코일 표시 (고정됨) */}
        {coils.map((coil) => (
          <g key={coil.id} transform={`rotate(${coil.rotate}, 150, 150)`}>
            {/* 코일 위치 표시 */}
            <rect
              x="140"
              y="10"
              width="20"
              height="30"
              fill={coil.color}
              rx="5"
            />
            <rect
              x="140"
              y="260"
              width="20"
              height="30"
              fill={coil.color}
              rx="5"
              opacity="0.5"
            />
            {/* 자기장 방향 화살표 (각 상의 순간적인 힘을 표현 - 펄럭이는 효과) */}
            <motion.path
              d="M150,45 L150,100"
              stroke={coil.color}
              strokeWidth="4"
              markerEnd={`url(#arrowhead-${coil.id})`}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 4,
                times: [0, 0.5, 1],
                repeat: Infinity,
                delay: (coil.rotate / 360) * 4, // 각 상의 위상차 구현
              }}
            />
            {/* 화살표 머리 정의 */}
            <defs>
              <marker
                id={`arrowhead-${coil.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={coil.color} />
              </marker>
            </defs>
          </g>
        ))}

        {/* 중앙 회전 자기장 벡터 (합성 벡터) */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={transition}
          style={{ originX: "150px", originY: "150px" }} // 회전 중심축 설정
        >
          {/* 합성 벡터 화살표 */}
          <line
            x1="150"
            y1="150"
            x2="150"
            y2="50"
            stroke="#FFD700"
            strokeWidth="8"
            markerEnd="url(#main-arrowhead)"
          />
          <circle cx="150" cy="150" r="10" fill="#FFD700" />
        </motion.g>

        {/* 메인 화살표 머리 정의 */}
        <defs>
          <marker
            id="main-arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#FFD700" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default RotatingFieldAnimation;
