import { useMemo } from "react";
import { Cloud, Clouds, Sparkles } from "@react-three/drei";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { houseRegistry } from "../data/houses";
import { useWorldStore } from "../store";
import { Farm } from "./Farm";
import { House } from "./House";
import { Interactions } from "./Interactions";
import { PhotoStudio } from "./PhotoStudio";
import { Player } from "./Player";

const trees: Array<[number, number, boolean]> = [
  [-16, -13, false], [-12, -15, true], [5, -16, false], [14, -14, false],
  [-17, 2, false], [16, 1, true], [-15, 13, false], [15, 14, false],
  [2, 15, true], [-6, 14, false], [11, 8, false], [-14, -5, false],
];

export function WorldScene() {
  const visited = useWorldStore((state) => state.visited);
  const lowQuality = useWorldStore((state) => state.lowQuality);
  const ground = useMemo(() => createGroundTexture(), []);

  return (
    <>
      <color attach="background" args={["#c9e8ff"]} />
      <fog attach="fog" args={["#d9f0ff", 24, 46]} />
      <hemisphereLight args={["#e7f6ff", "#b7d7a4", 1.7]} />
      <ambientLight intensity={0.45} color="#fff4e4" />
      <directionalLight
        castShadow={!lowQuality}
        position={[12, 18, 8]}
        intensity={1.8}
        color="#fff1d2"
        shadow-mapSize={[lowQuality ? 512 : 1024, lowQuality ? 512 : 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />
      <mesh position={[-16, 16, -22]}>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshBasicMaterial color="#fff3b8" />
      </mesh>
      {!lowQuality && (
        <>
          <Sparkles count={24} scale={[30, 8, 30]} size={2} speed={0.12} color="#ffffff" opacity={0.35} />
          <Clouds material={THREE.MeshLambertMaterial} limit={60}>
            <Cloud seed={2} position={[-10, 11, -16]} scale={1.3} color="#ffffff" opacity={0.7} />
            <Cloud seed={5} position={[12, 12, -18]} scale={1.05} color="#fff8fd" opacity={0.66} />
          </Clouds>
        </>
      )}
      <Physics gravity={[0, -18, 0]}>
        <RigidBody type="fixed" colliders={false} friction={1.2}>
          <CuboidCollider args={[40, 0.5, 40]} position={[0, -0.5, 0]} />
          <CuboidCollider args={[16.8, 2, 0.45]} position={[0, 1.5, 16.6]} />
          <CuboidCollider args={[16.8, 2, 0.45]} position={[0, 1.5, -16.6]} />
          <CuboidCollider args={[0.45, 2, 16.8]} position={[16.6, 1.5, 0]} />
          <CuboidCollider args={[0.45, 2, 16.8]} position={[-16.6, 1.5, 0]} />
        </RigidBody>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <circleGeometry args={[23, 72]} />
          <meshStandardMaterial map={ground} roughness={1} />
        </mesh>
        {trees.map(([x, z, pink]) => <Tree key={`${x}-${z}`} position={[x, z]} pink={pink} />)}
        {Array.from({ length: 18 }, (_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          return <Bush key={angle} position={[Math.cos(angle) * 16.8, Math.sin(angle) * 16.8]} />;
        })}
        {houseRegistry.map((house) => <House key={house.id} house={house} visited={visited.includes(house.id)} />)}
        <Farm />
        <PhotoStudio />
        <Player />
        <Interactions />
      </Physics>
    </>
  );
}

function Tree({ position, pink }: { position: [number, number]; pink?: boolean }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.28, 1.1, 0.28]} position={[0, 1.1, 0]} />
      </RigidBody>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.8, 10]} />
        <meshStandardMaterial color="#a07858" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[1.05, 18, 14]} />
        <meshStandardMaterial color={pink ? "#f3b4c4" : "#8dcc86"} roughness={0.85} />
      </mesh>
      <mesh position={[0.55, 2.05, 0.2]} castShadow>
        <sphereGeometry args={[0.62, 14, 12]} />
        <meshStandardMaterial color={pink ? "#ffd0dc" : "#b4e2a4"} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Bush({ position }: { position: [number, number] }) {
  return (
    <mesh position={[position[0], 0.38, position[1]]} castShadow>
      <sphereGeometry args={[0.55, 12, 10]} />
      <meshStandardMaterial color="#9ed496" roughness={0.9} />
    </mesh>
  );
}

function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d")!;
  const grass = context.createRadialGradient(512, 512, 80, 512, 512, 520);
  grass.addColorStop(0, "#c9eda8");
  grass.addColorStop(1, "#a9d98a");
  context.fillStyle = grass;
  context.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 28; i += 1) {
    context.fillStyle = i % 2 ? "rgba(255,255,255,0.045)" : "rgba(120,170,90,0.05)";
    context.beginPath();
    context.arc(80 + ((i * 137) % 860), 70 + ((i * 89) % 880), 50 + (i % 5) * 12, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = "rgba(239, 214, 176, 0.95)";
  context.lineCap = "round";
  context.lineWidth = 78;
  context.filter = "blur(6px)";
  context.beginPath();
  context.moveTo(512, 70);
  context.lineTo(512, 960);
  context.moveTo(90, 620);
  context.lineTo(940, 500);
  context.stroke();
  context.filter = "none";
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
