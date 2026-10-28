import { Html, RoundedBox } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { HouseDefinition } from "../data/houses";

type HouseProps = {
  house: HouseDefinition;
  visited: boolean;
};

export function House({ house, visited }: HouseProps) {
  const [wall, trim, accent] = house.colors;

  return (
    <group position={house.position} rotation={[0, house.rotation, 0]}>
      <RigidBody type="fixed" colliders="cuboid" friction={1}>
        <RoundedBox args={[5.4, 3.8, 4.4]} radius={0.22} smoothness={3} position={[0, 2.05, 0]}>
          <meshStandardMaterial color={wall} roughness={0.88} />
        </RoundedBox>
        <mesh position={[0, 4.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.85, 1.75, 4]} />
          <meshStandardMaterial color={accent} roughness={0.86} />
        </mesh>
      </RigidBody>

      <mesh position={[1.65, 5.25, -0.55]} castShadow>
        <boxGeometry args={[0.65, 1.55, 0.72]} />
        <meshStandardMaterial color={trim} />
      </mesh>

      <RoundedBox args={[1.25, 2.15, 0.18]} radius={0.12} position={[0, 1.25, 2.26]} castShadow>
        <meshStandardMaterial color={accent} />
      </RoundedBox>
      <mesh position={[0.4, 1.25, 2.38]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fff7b1" metalness={0.15} />
      </mesh>

      {[-1.65, 1.65].map((x) => (
        <group key={x} position={[x, 2.35, 2.25]}>
          <RoundedBox args={[1.1, 1.15, 0.15]} radius={0.1}>
            <meshStandardMaterial color="#9fd9ef" roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.08, 1.05, 0.05]} />
            <meshStandardMaterial color={trim} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[1.02, 0.08, 0.05]} />
            <meshStandardMaterial color={trim} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0.1, 3.05]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.1, 0.18, 1.4]} />
          <meshStandardMaterial color="#f4d9bb" />
        </mesh>
        <Html center position={[0, 1.05, 0]} distanceFactor={16} occlude={false} pointerEvents="none" zIndexRange={[4, 0]}>
          <div className="house-sign">
            <span>{house.icon}</span>
            <strong>{house.name}</strong>
            {visited && <i>去过啦</i>}
          </div>
        </Html>
      </group>

      <FlowerBox x={-1.65} color={accent} />
      <FlowerBox x={1.65} color={accent} />
    </group>
  );
}

function FlowerBox({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 1.55, 2.48]}>
      <mesh>
        <boxGeometry args={[1.35, 0.35, 0.42]} />
        <meshStandardMaterial color="#a87955" />
      </mesh>
      {[-0.42, 0, 0.42].map((offset, index) => (
        <group key={offset} position={[offset, 0.35, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.35, 6]} />
            <meshStandardMaterial color="#74a96a" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color={index === 1 ? "#fff2a8" : color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
