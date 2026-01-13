import { Suspense } from "react";
import "./App.css";

// 1. 3D 애니메이션 컴포넌트 불러오기
import ACMotor3D from "./components/animations/ACMotor3D";
import DCMotor3D from "./components/animations/DCMotor3D";
import DotProduct3D from "./components/animations/DotProduct3D";
import RotatingCoil from "./components/animations/RotatingCoil";
import Solenoid3D from "./components/animations/Solenoid3D";
import Transformer3D from "./components/animations/Transformer3D";

// 2. 다이어그램 이미지 불러오기
import acDiagram from "./assets/images/ac_motor.jpg";
import genDiagram from "./assets/images/generator.png";
import dcDiagram from "./assets/images/image_0.png";
import solDiagram from "./assets/images/solenoid.png";
import transDiagram from "./assets/images/transformer.png";

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
        {/* 1. 직류 전동기 */}
        <div className="study-card">
          <div className="card-header dc-header">
            <h2>1. 직류 전동기 (DC Motor)</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel white-bg">
              <DCMotor3D />
            </div>
            <div className="visual-panel right-panel">
              <img src={dcDiagram} alt="DC Motor" className="diagram-img" />
              <div className="panel-label">Structure & Principle</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">플레밍의 왼손 법칙</span>. 정류자가
              전류 방향을 전환합니다.
            </p>
          </div>
        </div>

        {/* 2. 유도 전동기 */}
        <div className="study-card">
          <div className="card-header ac-header">
            <h2>2. 3상 유도 전동기 (Induction Motor)</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel">
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <ACMotor3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img src={acDiagram} alt="AC Motor" className="diagram-img" />
              <div className="panel-label">Rotating Magnetic Field</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">회전 자계</span>와{" "}
              <span className="highlight">슬립(Slip)</span>.
            </p>
          </div>
        </div>

        {/* 3. 교류 발전기 */}
        <div className="study-card">
          <div
            className="card-header gen-header"
            style={{ background: "#d97706" }}
          >
            <h2>3. 교류 발전기 (AC Generator)</h2>
          </div>
          <div className="card-body">
            <div className="visual-panel left-panel">
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <RotatingCoil />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <img src={genDiagram} alt="Generator" className="diagram-img" />
              <div className="panel-label">Fleming's Right Hand Rule</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">플레밍의 오른손 법칙</span>. 자속
              변화를 방해하는 방향으로 기전력 발생.
            </p>
          </div>
        </div>

        {/* 4. 변압기 */}
        <div className="study-card">
          <div
            className="card-header trans-header"
            style={{ background: "#4f46e5" }}
          >
            <h2>4. 변압기 (Transformer)</h2>
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
                alt="Transformer"
                className="diagram-img"
              />
              <div className="panel-label">Mutual Induction</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">상호 유도 작용</span>과 권수비.
            </p>
          </div>
        </div>

        {/* 5. 솔레노이드 */}
        <div className="study-card">
          <div
            className="card-header sol-header"
            style={{ background: "#059669" }}
          >
            <h2>5. 솔레노이드 (Solenoid)</h2>
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
              <img src={solDiagram} alt="Solenoid" className="diagram-img" />
              <div className="panel-label">Ampere's Right Hand Rule</div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong>{" "}
              <span className="highlight">앙페르의 오른나사 법칙</span>.
            </p>
          </div>
        </div>

        {/* 6. 내적과 역률 (수정됨) */}
        <div className="study-card">
          <div
            className="card-header pf-header"
            style={{ background: "#db2777" }}
          >
            <h2>6. 벡터의 내적과 역률 (P = VI cosθ)</h2>
          </div>
          <div className="card-body">
            <div
              className="visual-panel left-panel"
              style={{ background: "#111" }}
            >
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <DotProduct3D />
              </Suspense>
            </div>
            <div className="visual-panel right-panel">
              <div
                style={{ padding: "20px", textAlign: "center", color: "#333" }}
              >
                <h3>내적의 의미</h3>
                <p>
                  회전하는 벡터(V)가 고정된 축(I)에
                  <br />
                  투영된 길이 = 유효 성분
                </p>
                <div
                  style={{
                    marginTop: "20px",
                    border: "1px dashed #ccc",
                    padding: "10px",
                  }}
                >
                  (역률 삼각형 이미지)
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <p>
              <strong>핵심:</strong> 붉은 선(내적값)은{" "}
              <span className="highlight">유효전력</span>을 의미하며, 두 벡터의
              각도가 벌어질수록 작아집니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
