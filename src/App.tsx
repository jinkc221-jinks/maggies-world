import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { WorldScene } from "./components/WorldScene";
import { Hud, WelcomeScreen } from "./components/Hud";
import { Panels } from "./components/Panels";
import { useWorldStore } from "./store";

export default function App() {
  const lowQuality = useWorldStore((state) => state.lowQuality);

  return (
    <main className="app-shell">
      <Canvas
        shadows={!lowQuality}
        dpr={lowQuality ? 1 : [1, 1.7]}
        camera={{ position: [0, 4.2, -6], fov: 46, near: 0.1, far: 90 }}
        gl={{ antialias: !lowQuality, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-label", "Maggie 的三维小世界");
          gl.domElement.style.touchAction = "none";
        }}
      >
        <Suspense fallback={null}>
          <WorldScene />
        </Suspense>
      </Canvas>
      <WelcomeScreen />
      <Hud />
      <Panels />
      <Loader
        containerStyles={{ background: "#fff8f3" }}
        innerStyles={{ width: "220px", background: "#eadde4", height: "7px" }}
        barStyles={{ background: "#ff91ad", height: "7px" }}
        dataStyles={{ color: "#806878", fontFamily: "system-ui", fontSize: "12px" }}
        dataInterpolation={(progress) => `正在铺好小路… ${Math.round(progress)}%`}
      />
    </main>
  );
}
