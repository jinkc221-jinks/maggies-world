import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { plots } from "../world/places";
import { growth } from "../world/growth";
import { useWorldStore, type PlotState } from "../store";

const flowers = ["#ff8fa8", "#ffe08a", "#c9b0ff", "#ffb38a"];

export function Farm() {
  const state = useWorldStore((store) => store.plots);
  return (
    <group>
      {plots.map((plot, index) => <Plot key={`${plot.x}-${plot.z}`} index={index} plot={state[index]} x={plot.x} z={plot.z} />)}
    </group>
  );
}

function Plot({ plot, x, z }: { index: number; plot: PlotState; x: number; z: number }) {
  const [stage, setStage] = useState(() => growth(plot));
  useFrame(() => {
    const next = growth(plot);
    if (next !== stage) setStage(next);
  });
  return (
    <group position={[x, 0.03, z]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshStandardMaterial color={plot.phase === "wet" ? "#8b6248" : "#a97856"} roughness={1} />
      </mesh>
      {plot.phase !== "empty" && stage === "seed" && (
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#c98955" />
        </mesh>
      )}
      {stage === "sprout" && <Stem color="#7dba72" height={0.28} />}
      {stage === "ready" && (
        <group>
          <Stem color="#67a867" height={0.42} />
          <mesh position={[0, 0.52, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color={flowers[plot.flower % flowers.length]} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color="#fff1a8" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Stem({ color, height }: { color: string; height: number }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[0.025, 0.03, height, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
