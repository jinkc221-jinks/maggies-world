import { useMemo, useRef } from "react";
import { Cloud, Clouds, Html, KeyboardControls, Sparkles } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import type { EcctrlHandle } from "ecctrl";
import * as THREE from "three";
import { houseRegistry } from "../data/houses";
import { useWorldStore } from "../store";
import { House } from "./House";
import { Player } from "./Character";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
];

export function WorldScene() {
  const playerRef = useRef<EcctrlHandle>(null);
  const started = useWorldStore((state) => state.started);
  const activeHouse = useWorldStore((state) => state.activeHouse);
  const visited = useWorldStore((state) => state.visited);
  const lowQuality = useWorldStore((state) => state.lowQuality);

  return (
    <>
      <color attach="background" args={["#cbeaff"]} />
      <fog attach="fog" args={["#dff2ff", 28, 62]} />
      <ambientLight intensity={1.35} color="#fff8e8" />
      <hemisphereLight args={["#dff3ff", "#8bbd7d", 1.6]} />
      <directionalLight
        castShadow={!lowQuality}
        position={[14, 22, 10]}
        intensity={2.2}
        color="#fff0cb"
        shadow-mapSize={[lowQuality ? 512 : 1536, lowQuality ? 512 : 1536]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <Sun />
      {!lowQuality && <SkyDecor />}

      <KeyboardControls map={keyboardMap}>
        <Physics gravity={[0, -18, 0]} paused={!started || Boolean(activeHouse)} timeStep="vary">
          <Terrain lowQuality={lowQuality} />
          {houseRegistry.map((house) => (
            <House key={house.id} house={house} visited={visited.includes(house.id)} />
          ))}
          <Player playerRef={playerRef} />
        </Physics>
      </KeyboardControls>
    </>
  );
}

function Terrain({ lowQuality }: { lowQuality: boolean }) {
  const trees = useMemo(
    () => [
      [-17, -14], [-13, -16], [-6, -17], [4, -17], [13, -16], [17, -12],
      [-18, -6], [18, -4], [-17, 6], [18, 7], [-16, 15], [-10, 17],
      [0, 18], [12, 17], [17, 14], [-4, 13], [14, 4], [-14, 3],
    ],
    [],
  );
  const flowers = useMemo(
    () =>
      Array.from({ length: lowQuality ? 24 : 58 }, (_, i) => {
        const angle = i * 2.399;
        const radius = 5 + ((i * 7) % 14);
        return [Math.cos(angle) * radius, Math.sin(angle) * radius] as [number, number];
      }).filter(([x, z]) => Math.abs(x) > 2 || Math.abs(z) > 4),
    [lowQuality],
  );

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" friction={1.4}>
        <mesh position={[0, -0.65, 0]} receiveShadow>
          <boxGeometry args={[42, 1.3, 42]} />
          <meshStandardMaterial color="#a8d98e" roughness={1} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.015, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.6, 38]} />
        <meshStandardMaterial color="#efd5a8" roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[3.4, 31]} />
        <meshStandardMaterial color="#efd5a8" roughness={1} />
      </mesh>
      <mesh position={[15.5, 0.06, -13.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.15, 32]} />
        <meshStandardMaterial color="#8ed7e5" transparent opacity={0.78} roughness={0.2} />
      </mesh>
      {[2.7, 3.25].map((radius) => (
        <mesh key={radius} position={[15.5, 0.025, -13.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.12, 32]} />
          <meshStandardMaterial color={radius > 3 ? "#f6d5e2" : "#fff3a8"} />
        </mesh>
      ))}
      {trees.map(([x, z], index) => <Tree key={`${x}-${z}`} position={[x, 0, z]} pink={index % 4 === 0} />)}
      {flowers.map(([x, z], index) => (
        <Flower key={`${x}-${z}`} position={[x, 0, z]} color={["#ff8fa8", "#fff39b", "#a990ef", "#ffffff"][index % 4]} />
      ))}
      <VillageSign />
      <BoundaryWalls />
    </group>
  );
}

function Tree({ position, pink }: { position: [number, number, number]; pink?: boolean }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.65, 2.2, 0.65]} />
          <meshStandardMaterial color="#9b6d4c" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2.65, 0]} castShadow>
        <dodecahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial color={pink ? "#f5a9bd" : "#78bd75"} roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 2.55, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={pink ? "#ffc5d2" : "#98d287"} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Flower({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position} scale={0.55}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.55, 6]} />
        <meshStandardMaterial color="#5fa35c" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.16, 0.6, Math.sin(angle) * 0.16]}>
            <sphereGeometry args={[0.14, 7, 7]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffd45d" />
      </mesh>
    </group>
  );
}

function VillageSign() {
  return (
    <group position={[-3.8, 0, 6.2]} rotation={[0, 0.25, 0]}>
      <mesh position={[-1.2, 0.8, 0]} castShadow>
        <boxGeometry args={[0.22, 1.6, 0.22]} />
        <meshStandardMaterial color="#93684c" />
      </mesh>
      <mesh position={[1.2, 0.8, 0]} castShadow>
        <boxGeometry args={[0.22, 1.6, 0.22]} />
        <meshStandardMaterial color="#93684c" />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[3.15, 1.15, 0.22]} />
        <meshStandardMaterial color="#fff0bc" />
      </mesh>
      <Html center position={[0, 1.48, 0.14]} distanceFactor={16} occlude={false} pointerEvents="none" zIndexRange={[2, 0]}>
        <div className="house-sign">
          <strong>Maggie 的小世界</strong>
        </div>
      </Html>
    </group>
  );
}

function BoundaryWalls() {
  return (
    <>
      {[
        [0, 2, -21, 42, 4, 1],
        [0, 2, 21, 42, 4, 1],
        [-21, 2, 0, 1, 4, 42],
        [21, 2, 0, 1, 4, 42],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh position={[x, y, z]} visible={false}>
            <boxGeometry args={[sx, sy, sz]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

function Sun() {
  return (
    <mesh position={[-18, 19, -25]}>
      <sphereGeometry args={[2.4, 20, 20]} />
      <meshBasicMaterial color="#fff0a8" />
    </mesh>
  );
}

function SkyDecor() {
  return (
    <>
      <Sparkles count={35} scale={[35, 14, 35]} size={2} speed={0.15} color="#ffffff" opacity={0.45} />
      <Clouds material={THREE.MeshLambertMaterial} limit={80}>
        <Cloud seed={1} position={[-12, 12, -18]} scale={1.5} color="#ffffff" opacity={0.72} />
        <Cloud seed={4} position={[12, 14, -20]} scale={1.2} color="#fff8fd" opacity={0.7} />
        <Cloud seed={7} position={[19, 11, 4]} scale={0.9} color="#ffffff" opacity={0.65} />
      </Clouds>
    </>
  );
}
