import { useEffect, useRef, type Ref, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Ecctrl, type EcctrlHandle } from "ecctrl";
import * as THREE from "three";
import { getDoorPosition, houseRegistry } from "../data/houses";
import { useWorldStore } from "../store";

type PlayerProps = {
  playerRef: RefObject<EcctrlHandle | null>;
};

export function Player({ playerRef }: PlayerProps) {
  const enabled = useWorldStore((state) => state.started && !state.activeHouse);

  return (
    <>
      <Ecctrl
        ref={playerRef}
        position={[0, 2, 8]}
        capsuleHalfHeight={0.42}
        capsuleRadius={0.36}
        floatHeight={0.25}
        maxWalkVel={4.2}
        maxRunVel={6.4}
        jumpVel={5}
        autoBalance
        enable={enabled}
      >
        <MaggieCharacter playerRef={playerRef} />
      </Ecctrl>
      <FollowCamera playerRef={playerRef} enabled={enabled} />
      <ProximityTracker playerRef={playerRef} />
    </>
  );
}

function MaggieCharacter({ playerRef }: PlayerProps) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const speed = playerRef.current?.moveSpeed ?? 0;
    const strength = Math.min(speed / 3, 1);
    const swing = Math.sin(clock.elapsedTime * 9) * 0.55 * strength;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing;
    if (rightLeg.current) rightLeg.current.rotation.x = swing;
    if (root.current) root.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 9)) * 0.04 * strength;
  });

  return (
    <group ref={root} position={[0, -0.72, 0]} scale={0.82}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.86, 0.8, 0.72]} />
        <meshStandardMaterial color="#f6c7ad" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.9, -0.03]} castShadow>
        <boxGeometry args={[0.94, 0.32, 0.79]} />
        <meshStandardMaterial color="#714d48" />
      </mesh>
      <mesh position={[-0.22, 1.58, 0.37]}>
        <boxGeometry args={[0.1, 0.12, 0.04]} />
        <meshStandardMaterial color="#4f3f45" />
      </mesh>
      <mesh position={[0.22, 1.58, 0.37]}>
        <boxGeometry args={[0.1, 0.12, 0.04]} />
        <meshStandardMaterial color="#4f3f45" />
      </mesh>
      <mesh position={[0, 1.38, 0.38]}>
        <boxGeometry args={[0.22, 0.06, 0.04]} />
        <meshStandardMaterial color="#d8838c" />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.58]} />
        <meshStandardMaterial color="#ff91ad" />
      </mesh>
      <mesh position={[0, 0.72, 0.32]}>
        <boxGeometry args={[0.5, 0.38, 0.06]} />
        <meshStandardMaterial color="#fff0bd" />
      </mesh>
      <Limb ref={leftArm} position={[-0.58, 1.05, 0]} color="#f6c7ad" />
      <Limb ref={rightArm} position={[0.58, 1.05, 0]} color="#f6c7ad" />
      <Limb ref={leftLeg} position={[-0.25, 0.22, 0]} color="#8b79cf" leg />
      <Limb ref={rightLeg} position={[0.25, 0.22, 0]} color="#8b79cf" leg />
      <mesh position={[-0.22, 1.35, 0.42]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#ff9faa" />
      </mesh>
      <mesh position={[0.22, 1.35, 0.42]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#ff9faa" />
      </mesh>
    </group>
  );
}

const Limb = ({
  position,
  color,
  leg = false,
  ref,
}: {
  position: [number, number, number];
  color: string;
  leg?: boolean;
  ref: Ref<THREE.Group>;
}) => (
  <group ref={ref} position={position}>
    <mesh position={[0, -0.3, 0]} castShadow>
      <boxGeometry args={[leg ? 0.3 : 0.24, 0.7, leg ? 0.42 : 0.28]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {leg && (
      <mesh position={[0, -0.67, 0.08]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.52]} />
        <meshStandardMaterial color="#fff8ef" />
      </mesh>
    )}
  </group>
);

function FollowCamera({ playerRef, enabled }: PlayerProps & { enabled: boolean }) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const yaw = useRef(0.55);
  const pitch = useRef(0.42);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const desired = useRef(new THREE.Vector3(8, 7, 15));
  const distance = useRef(12.2);

  useEffect(() => {
    const element = gl.domElement;
    const onDown = (event: PointerEvent) => {
      if (!enabled) return;
      dragging.current = true;
      last.current = { x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging.current || !enabled) return;
      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      last.current = { x: event.clientX, y: event.clientY };
      yaw.current -= dx * 0.005;
      pitch.current = Math.min(0.72, Math.max(0.16, pitch.current + dy * 0.004));
    };
    const onUp = () => {
      dragging.current = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (!enabled) return;
      distance.current = Math.min(14, Math.max(6.5, distance.current + event.deltaY * 0.01));
    };
    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    element.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      element.removeEventListener("wheel", onWheel);
    };
  }, [enabled, gl]);

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;
    const target = player.currPos;
    if (target.y < -6) {
      player.body.setTranslation({ x: 0, y: 2, z: 8 }, true);
      player.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      player.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
    const lookY = target.y + 1.15;
    desired.current.set(
      target.x + Math.sin(yaw.current) * Math.cos(pitch.current) * distance.current,
      lookY + Math.sin(pitch.current) * distance.current * 0.85,
      target.z + Math.cos(yaw.current) * Math.cos(pitch.current) * distance.current,
    );
    camera.position.lerp(desired.current, 1 - Math.pow(0.0008, delta));
    camera.lookAt(target.x, lookY, target.z);
  });

  return null;
}

function ProximityTracker({ playerRef }: PlayerProps) {
  const previous = useRef<string | null>(null);
  const setNearbyHouse = useWorldStore((state) => state.setNearbyHouse);
  const activeHouse = useWorldStore((state) => state.activeHouse);

  useEffect(() => () => setNearbyHouse(null), [setNearbyHouse]);

  useFrame(() => {
    if (activeHouse || !playerRef.current) return;
    const player = playerRef.current.currPos;
    let nearest: string | null = null;
    let nearestDistance = 2.65;
    for (const house of houseRegistry) {
      const [x, , z] = getDoorPosition(house);
      const distance = Math.hypot(player.x - x, player.z - z);
      if (distance < nearestDistance) {
        nearest = house.id;
        nearestDistance = distance;
      }
    }
    if (nearest !== previous.current) {
      previous.current = nearest;
      setNearbyHouse(nearest as Parameters<typeof setNearbyHouse>[0]);
    }
  });

  return null;
}
