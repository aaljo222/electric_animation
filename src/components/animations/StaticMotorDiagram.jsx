const StaticMotorDiagram = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border shadow-sm w-full h-full min-h-[350px]">
      <h3 className="text-md font-bold text-gray-800 mb-4">
        📖 직류기 구조도 (Structure)
      </h3>

      <div className="relative w-full max-w-[320px] aspect-square">
        {/* === 1. 자석 (Magnets) === */}
        {/* N극 (Red) */}
        <div className="absolute left-0 top-1/4 w-20 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-l-lg shadow-lg flex items-center justify-center z-10 transform -skew-y-6">
          <span className="text-white font-black text-4xl drop-shadow-md">
            N
          </span>
        </div>

        {/* S극 (Blue) */}
        <div className="absolute right-0 top-1/4 w-20 h-32 bg-gradient-to-bl from-blue-500 to-blue-700 rounded-r-lg shadow-lg flex items-center justify-center z-10 transform skew-y-6">
          <span className="text-white font-black text-4xl drop-shadow-md">
            S
          </span>
        </div>

        {/* === 2. 전기자 코일 (Armature) === */}
        {/* 입체적인 사각형 코일 그리기 (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          viewBox="0 0 320 320"
        >
          {/* 코일 선 (뒤쪽) */}
          <path
            d="M 110 120 L 210 120"
            stroke="#ca8a04"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 코일 선 (메인 루프) */}
          <path
            d="M 110 120 L 90 200 L 230 200 L 210 120"
            fill="none"
            stroke="#eab308"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* 전류 방향 화살표 */}
          <path
            d="M 100 160 L 95 180"
            stroke="black"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <path
            d="M 220 180 L 215 160"
            stroke="black"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrow)"
          />

          {/* 회전축 (점선) */}
          <line
            x1="160"
            y1="80"
            x2="160"
            y2="280"
            stroke="#4b5563"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* 회전 방향 화살표 */}
          <path
            d="M 130 90 Q 160 70 190 90"
            fill="none"
            stroke="#db2777"
            strokeWidth="3"
            markerEnd="url(#arrow-pink)"
          />

          {/* Definitions */}
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
            </marker>
            <marker
              id="arrow-pink"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#db2777" />
            </marker>
          </defs>
        </svg>

        {/* === 3. 정류자 (Split-ring Commutator) === */}
        <div className="absolute top-[200px] left-1/2 transform -translate-x-1/2 z-30 flex gap-1">
          <div className="w-6 h-10 bg-yellow-500 rounded-l-full border-r border-black shadow-sm"></div>
          <div className="w-6 h-10 bg-yellow-500 rounded-r-full border-l border-black shadow-sm"></div>
        </div>

        {/* === 4. 브러시 (Brushes) === */}
        <div className="absolute top-[210px] left-[110px] w-8 h-6 bg-gray-700 rounded shadow-md z-30"></div>
        <div className="absolute top-[210px] right-[110px] w-8 h-6 bg-gray-700 rounded shadow-md z-30"></div>

        {/* === 5. 외부 회로 및 배터리 === */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-16 border-l-4 border-r-4 border-b-4 border-green-700 rounded-b-xl z-0"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-2 border border-green-700 shadow-sm flex items-center gap-1 z-10">
          <span className="text-xl font-bold text-black">+</span>
          <div className="w-8 h-6 bg-gray-800 rounded mx-1 relative">
            <div className="absolute top-1 right-1 w-1 h-4 bg-yellow-400"></div>
          </div>
          <span className="text-xl font-bold text-black">-</span>
        </div>

        {/* === 6. 라벨 (Labels) - 여기가 포인트! === */}
        {/* Brush Label */}
        <div className="absolute top-[210px] right-[40px] text-xs font-bold text-gray-600 bg-white/90 px-1 rounded border border-gray-200 shadow-sm">
          ← Brush
        </div>
        {/* Commutator Label */}
        <div className="absolute top-[240px] left-[30px] text-xs font-bold text-gray-600 bg-white/90 px-1 rounded border border-gray-200 shadow-sm">
          Commutator →
        </div>
        {/* Rotation Label */}
        <div className="absolute top-[60px] right-[80px] text-xs font-bold text-pink-600">
          Rotation
        </div>
      </div>
    </div>
  );
};

export default StaticMotorDiagram;
