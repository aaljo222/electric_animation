import React, { useEffect, useState } from "react";
import img from "../../assets/images/solenoid.png";

export default function AmpereSolenoid() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf;
    const loop = (t) => {
      setPhase((t / 1000) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
      {/* ✅ 배경 이미지 (고정) */}
      <img
        src={img}
        alt="Ampere Solenoid"
        style={{ width: "100%", display: "block" }}
        draggable={false}
      />

      {/* ✅ SVG 오버레이 */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {/* ===================== */}
        {/* 전류 흐름 (I) */}
        {/* ===================== */}
        {[...Array(8)].map((_, i) => {
          const x = 260 + i * 60;
          const y = 420 - (phase * 60) % 60;
          return (
            <polygon
              key={i}
              points={`${x},${y} ${x + 14},${y + 8} ${x},${y + 16}`}
              fill="#facc15"
              opacity="0.9"
            />
          );
        })}

        {/* ===================== */}
        {/* 내부 자기장 B (→) */}
        {/* ===================== */}
        {[...Array(6)].map((_, i) => (
          <line
            key={i}
            x1="320"
            y1={280 + i * 20}
            x2="640"
            y2={280 + i * 20}
            stroke="#22d3ee"
            strokeWidth="4"
            markerEnd="url(#arrow)"
            opacity="0.8"
          />
        ))}

        {/* ===================== */}
        {/* 외부 자기장 (곡선) */}
        {/* ===================== */}
        <path
          d="M300 260 C200 180 200 420 300 360"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M660 260 C760 180 760 420 660 360"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          opacity="0.5"
        />

        {/* 화살표 정의 */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#22d3ee" />
          </marker>
        </defs>

        {/* ===================== */}
        {/* N / S 강조 */}
        {/* ===================== */}
        <text
          x="260"
          y="300"
          fill="#0f172a"
          fontSize="36"
          fontWeight="900"
        >
          N
        </text>
        <text
          x="680"
          y="300"
          fill="#0f172a"
          fontSize="36"
          fontWeight="900"
        >
          S
        </text>
      </svg>

      {/* ✅ 설명 라벨 */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          color: "#e5e7eb",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Ampere’s Right Hand Grip Rule
      </div>
    </div>
  );
}
