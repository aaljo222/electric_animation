import { motion } from "framer-motion";

const RotatingCoil = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border">
      <h3 className="text-lg font-bold mb-4">직류기 원리 (플레밍의 법칙)</h3>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* 1. N극 (왼쪽 자석) */}
        <div className="absolute left-0 w-16 h-40 bg-red-500 rounded-l-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
          N
        </div>

        {/* 2. S극 (오른쪽 자석) */}
        <div className="absolute right-0 w-16 h-40 bg-blue-600 rounded-r-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
          S
        </div>

        {/* 3. 자속선 (Magnetic Flux Lines) */}
        <div className="absolute w-full h-full flex flex-col justify-center items-center space-y-4 opacity-30">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-32 h-0.5 bg-gray-800 dashed" />
          ))}
          <span className="text-xs text-gray-500 absolute bottom-4">
            자속 (Φ) →
          </span>
        </div>

        {/* 4. 회전하는 도체 (Coil) */}
        <motion.div
          className="w-32 h-2 border-4 border-yellow-500 bg-yellow-200 z-20"
          animate={{ rotate: 360 }} // 360도 회전
          transition={{
            duration: 4, // 4초 동안 한 바퀴
            repeat: Infinity, // 무한 반복
            ease: "linear", // 등속 운동
          }}
          style={{
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)",
          }}
        >
          {/* 코일 내부 전류 방향 표시 (옵션) */}
          <div className="absolute -top-6 left-0 text-xs font-bold text-yellow-700">
            a
          </div>
          <div className="absolute -top-6 right-0 text-xs font-bold text-yellow-700">
            b
          </div>
        </motion.div>

        {/* 축 (Axis) */}
        <div className="absolute w-4 h-4 bg-gray-800 rounded-full z-30"></div>
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center max-w-xs">
        도체가 자속을 끊으면 <strong>유도 기전력(E)</strong>이 발생합니다.
        <br />
        (E = Blv sinθ)
      </p>
    </div>
  );
};

export default RotatingCoil;
