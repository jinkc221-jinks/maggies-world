import { Html, RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { HouseDefinition } from "../data/houses";

export function House({ house, visited }: { house: HouseDefinition; visited: boolean }) {
  const [wall, trim, accent] = house.colors;
  return (
    <group position={house.position} rotation={[0, house.rotation, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.55, 1.55, 0.16]} position={[0, 1.55, -2.15]} />
        <CuboidCollider args={[0.16, 1.55, 1.75]} position={[-2.45, 1.55, 0.05]} />
        <CuboidCollider args={[0.16, 1.55, 1.75]} position={[2.45, 1.55, 0.05]} />
        <CuboidCollider args={[0.9, 1.55, 0.16]} position={[-1.55, 1.55, 2.15]} />
        <CuboidCollider args={[0.9, 1.55, 0.16]} position={[1.55, 1.55, 2.15]} />
        {house.id === "garden" && (
          <>
            <CuboidCollider args={[0.42, 0.42, 0.32]} position={[-0.75, 0.42, -1.25]} />
            <CuboidCollider args={[0.32, 0.36, 0.28]} position={[0.75, 0.36, -1.25]} />
          </>
        )}
        {house.id !== "garden" && <CuboidCollider args={[0.7, 0.4, 0.35]} position={[0, 0.4, -1.15]} />}
      </RigidBody>

      <Wall color={wall} args={[5.1, 3.05, 0.28]} position={[0, 1.58, -2.02]} />
      <Wall color={wall} args={[0.28, 3.05, 3.9]} position={[-2.4, 1.58, 0.05]} />
      <Wall color={wall} args={[0.28, 3.05, 3.9]} position={[2.4, 1.58, 0.05]} />
      <Wall color={wall} args={[1.75, 3.05, 0.28]} position={[-1.68, 1.58, 2.05]} />
      <Wall color={wall} args={[1.75, 3.05, 0.28]} position={[1.68, 1.58, 2.05]} />
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[4.7, 0.04, 3.8]} />
        <meshStandardMaterial color="#f7ead4" />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow>
        <sphereGeometry args={[2.55, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={accent} roughness={0.72} />
      </mesh>
      <mesh position={[1.35, 4.55, -0.15]} castShadow>
        <cylinderGeometry args={[0.28, 0.34, 1.15, 16]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      <mesh position={[0, 0.04, 2.55]} receiveShadow>
        <boxGeometry args={[1.7, 0.08, 1.15]} />
        <meshStandardMaterial color="#f3dcc4" />
      </mesh>
      <Door color={accent} />
      {[-1.55, 1.55].map((x) => <Window key={x} x={x} trim={trim} />)}
      <Furniture house={house} />
      <Html position={[0, 0.7, 3.15]} center distanceFactor={14} pointerEvents="none" zIndexRange={[2, 0]}>
        <div className="house-sign"><strong>{house.name}</strong>{visited && <i>去过啦</i>}</div>
      </Html>
    </group>
  );
}

function Wall({ color, args, position }: { color: string; args: [number, number, number]; position: [number, number, number] }) {
  return (
    <RoundedBox args={args} radius={0.12} smoothness={4} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.78} />
    </RoundedBox>
  );
}

function Door({ color }: { color: string }) {
  return (
    <group position={[0, 1.15, 2.18]}>
      {[[-0.62, 0], [0.62, 0]].map(([x]) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 2.1, 0.12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.34, 0.12, 0.12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Window({ x, trim }: { x: number; trim: string }) {
  return (
    <group position={[x, 1.85, 2.2]}>
      <RoundedBox args={[1.05, 0.95, 0.08]} radius={0.08}>
        <meshStandardMaterial color="#c9eefe" roughness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.04, 0.9, 0.03]} /><meshStandardMaterial color={trim} /></mesh>
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.98, 0.04, 0.03]} /><meshStandardMaterial color={trim} /></mesh>
    </group>
  );
}

function Furniture({ house }: { house: HouseDefinition }) {
  if (house.id === "garden") {
    return (
      <group position={[0, 0, -1.25]}>
        <Crate position={[-0.75, 0.32, 0]} color="#e7b07a" label="种子" />
        <group position={[0.75, 0, 0]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 0.5, 16]} />
            <meshStandardMaterial color="#f4d7b4" />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.22, 12]} />
            <meshStandardMaterial color="#8fd4ea" />
          </mesh>
        </group>
      </group>
    );
  }
  return (
    <group position={[0, 0.42, -1.15]}>
      <RoundedBox args={[1.4, 0.75, 0.62]} radius={0.08} castShadow receiveShadow>
        <meshStandardMaterial color={house.id === "post" ? "#e7b896" : "#fff0cf"} />
      </RoundedBox>
    </group>
  );
}

function Crate({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.72, 0.58, 0.58]} radius={0.06} castShadow>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <Html position={[0, 0.48, 0]} center distanceFactor={8} pointerEvents="none">
        <div className="house-sign">{label}</div>
      </Html>
    </group>
  );
}
