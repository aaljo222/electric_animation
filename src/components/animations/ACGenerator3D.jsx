import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/images/generator.png";

export default function ACGeneratorCoilRotate() {
  const [angle, setAngle] = useState(0);
  const [voltage, setVoltage] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const loop = (t) => {
      const time = (t - start) / 1000;
      const omega = 2 * Math.PI * 0.5; // 회전 속도
      const theta = omega * time;

      setAngle((theta * 180) / Math.PI);
      setVoltage(Math.abs(Math.sin(theta)));

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* ✅ 배경 이미지 */}
      <img
        src={img}
        alt="AC Generator"
        style={{ width: "100%", display: "block" }}
        draggable={false}
      />

      {/* ✅ 코일만 회전 (SVG 오버레이) */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {/* 회전 그룹 */}
        <g
          transform={`
            translate(500 290)
            rotate(${angle})
            translate(-500 -290)
          `}
        >
          {/* 🔥 사각 철 코일 (교과서 그림에 맞춘 위치) */}
          <rect
            x="380"
            y="245"
            width="240"
            height="90"
            rx="8"
            ry="8"
            fill="none"
            stroke="#c0841d"
            strokeWidth="10"
          />
        </g>
      </svg>

      {/* 💡 전구 발광 */}
      <div
        style={{
          position: "absolute",
          left: "72%",
          top: "62%",
          width: "90px",
          height: "90px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "rgba(253,224,71,1)",
          opacity: 0.2 + voltage * 0.6,
          filter: `blur(${12 + voltage * 10}px)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* 🔢 전압 표시 */}
      <div
        style={{
          position: "absolute",
          left: "72%",
          top: "73%",
          transform: "translateX(-50%)",
          background: "#111827",
          color: "#fde047",
          padding: "4px 10px",
          borderRadius: 8,
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {(voltage * 12).toFixed(1)} V
      </div>
    </div>
  );
}
