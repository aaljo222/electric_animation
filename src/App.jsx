import { Suspense } from "react";
import "./App.css";

// --------------------------------------------------------
// 1. 3D 애니메이션 컴포넌트 불러오기
// --------------------------------------------------------
import ACMotor3D from "./components/animations/ACMotor3D"; // 2. 유도 전동기
import DCMotor3D from "./components/animations/DCMotor3D"; // 1. 직류 전동기
import DotProduct3D from "./components/animations/DotProduct3D
import RotatingCoil from "./components/animations/RotatingCoil"; // 3. 교류 발전기 (New)
import Solenoid3D from "./components/animations/Solenoid3D"; // 5. 솔레노이드 (New)
import Transformer3D from "./components/animations/Transformer3D"; // 4. 변압기 (New)
// --------------------------------------------------------
// 2. 다이어그램 이미지 불러오기
// (이미지 파일들을 src/assets/images 폴더에 넣어주세요)
// --------------------------------------------------------
import acDiagram from "./assets/images/ac_motor.jpg"; // 기존 AC 모터 이미지
import genDiagram from "./assets/images/generator.png"; // [New] 발전기 이미지
import dcDiagram from "./assets/images/image_0.png"; // 기존 DC 모터 이미지
import solDiagram from "./assets/images/solenoid.png"; // [New] 솔레노이드 이미지
import transDiagram from "./assets/images/transformer.png"; // [New] 변압기 이미지

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <h1>⚡ 전기기사 3D 핵심 원리 시뮬레이션</h1>
        <p>
          왼쪽의 <strong>3D 시뮬레이션</strong>과 오른쪽의{" "}
          <strong>이론 다이어그램</strong>을 비교하며 직관적으로 학습하세요.
        </p>
      </header>

      <div className="content-grid">
        {/* ================================================= */}
        {/* 1. 직류 전동기 (DC Motor) */}
        {/* ================================================= */}
        <div className="study-card">
          <div className="card-header dc-header">
            <h2>1. 직류 전동기 (DC Motor) - Fleming's Left Hand Rule</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel white-bg">
              <DCMotor3D />
            </div>
            <div className="visual-panel right-panel">
              <img
                src={dcDiagram}
                alt="DC Motor Diagram"
                className="diagram-img"
              />
              <div className="panel-label">Structure & Principle</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">플레밍의 왼손 법칙(전동기)</span>.
              정류자가 전류 방향을 바꿔주어 한 방향으로 계속 회전합니다.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* 2. 3상 유도 전동기 (Induction Motor) */}
        {/* ================================================= */}
        <div className="study-card">
          <div className="card-header ac-header">
            <h2>2. 3상 유도 전동기 (Induction Motor) - Arago's Disk</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel">
              <Suspense fallback={<div className="loading">Loading 3D...</div>}>
                <ACMotor3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img
                src={acDiagram}
                alt="AC Motor Diagram"
                className="diagram-img"
              />
              <div className="panel-label">Rotating Magnetic Field</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>
              <span className="highlight">회전 자기장</span>을 따라 회전자가
              돌지만, 동기 속도보다 약간 느린
              <span className="highlight">슬립(Slip)</span>이 발생합니다.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* 3. 교류 발전기 (AC Generator) [NEW] */}
        {/* ================================================= */}
        <div className="study-card">
          <div
            className="card-header gen-header"
            style={{ background: "#d97706" }}
          >
            {" "}
            {/* 호박색 */}
            <h2>3. 교류 발전기 (AC Generator) - Fleming's Right Hand Rule</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel">
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <RotatingCoil />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img
                src={genDiagram}
                alt="Generator Diagram"
                className="diagram-img"
              />
              <div className="panel-label">Induction & Sine Wave</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">플레밍의 오른손 법칙(발전기)</span>.
              자속의 변화를 방해하는 방향으로 유도 기전력이 발생합니다.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* 4. 변압기 (Transformer) [NEW] */}
        {/* ================================================= */}
        <div className="study-card">
          <div
            className="card-header trans-header"
            style={{ background: "#4f46e5" }}
          >
            {" "}
            {/* 인디고색 */}
            <h2>4. 변압기 (Transformer) - Mutual Induction</h2>
          </div>
          <div className="card-body">
            <div
              className="visual-panel left-panel"
              style={{ background: "#f0f2f5" }}
            >
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <Transformer3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img
                src={transDiagram}
                alt="Transformer Diagram"
                className="diagram-img"
              />
              <div className="panel-label">Step-up / Step-down</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">상호 유도 작용</span>. 권수비(a)에
              따라 전압을 변성합니다. (V1/N1 = V2/N2)
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* 5. 솔레노이드 (Solenoid) [NEW] */}
        {/* ================================================= */}
        <div className="study-card">
          <div
            className="card-header sol-header"
            style={{ background: "#059669" }}
          >
            {" "}
            {/* 에메랄드색 */}
            <h2>5. 솔레노이드와 자기장 - Ampere's Right Hand Grip Rule</h2>
          </div>
          <div className="card-body">
            <div
              className="visual-panel left-panel"
              style={{ background: "#222" }}
            >
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <Solenoid3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img
                src={solDiagram}
                alt="Solenoid Diagram"
                className="diagram-img"
              />
              <div className="panel-label">Magnetic Field Direction</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">앙페르의 오른나사 법칙</span>. 전류가
              감기는 방향으로 오른손을 감싸쥐면 엄지손가락이 N극입니다.
            </p>
          </div>
        </div>
        {/* ================================================= */}
        {/* 6. 벡터의 내적과 역률 (Power Factor) [NEW] */}
        {/* ================================================= */}
        <div className="study-card">
          <div
            className="card-header pf-header"
            style={{ background: "#db2777" }} // 핑크색 계열
          >
            <h2>6. 벡터의 내적과 역률 (Power Factor) - P = VI cosθ</h2>
          </div>
          <div className="card-body">
            <div
              className="visual-panel left-panel"
              style={{ background: "#111" }} // 어두운 배경 추천
            >
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <DotProduct3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              {/* 이미지가 없다면 텍스트나 placeholder 사용 */}
              <div
                style={{ padding: "20px", textAlign: "center", color: "#333" }}
              >
                <h3>유효전력 원리</h3>
                <p>전압(V)과 전류(I)의 위상차(θ)에 따른 내적 값</p>
                <div
                  style={{
                    marginTop: "20px",
                    border: "1px dashed #ccc",
                    padding: "10px",
                  }}
                >
                  (여기에 역률 삼각형
                  <br />
                  이미지를 넣으세요)
                </div>
              </div>
              <div className="panel-label">Active vs Apparent Power</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">내적(Dot Product)</span>은 전기에서{" "}
              <span className="highlight">유효전력(Active Power)</span>을
              의미합니다. 붉은색 선의 길이가 <strong>cosθ (역률)</strong>에
              해당합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
