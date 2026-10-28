import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { controls, keyboardVector } from "../character/input";
import { runtime } from "../character/runtime";
import { useWorldStore } from "../store";
import { photoSpot } from "../world/places";

const modelUrl = `${import.meta.env.BASE_URL}models/maggie.glb?v=2`;

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<THREE.Group>(null);
  const { world, rapier } = useRapier();
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const started = useWorldStore((state) => state.started);
  const posing = useWorldStore((state) => state.posing);
  const panel = useWorldStore((state) => state.panel);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0.42);
  const distance = useRef(7.2);
  const vertical = useRef(0);
  const dragging = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const controllerRef = useRef<ReturnType<typeof world.createCharacterController> | null>(null);
  const controller = () => {
    if (!controllerRef.current) {
      const next = world.createCharacterController(0.06);
      next.enableSnapToGround(0.32);
      next.enableAutostep(0.22, 0.16, true);
      next.setSlideEnabled(true);
      next.setMaxSlopeClimbAngle((46 * Math.PI) / 180);
      controllerRef.current = next;
    }
    return controllerRef.current;
  };

  useEffect(() => () => {
    if (controllerRef.current) world.removeCharacterController(controllerRef.current);
  }, [world]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent, down: boolean) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") controls.keys.forward = down;
      if (event.code === "KeyS" || event.code === "ArrowDown") controls.keys.back = down;
      if (event.code === "KeyA" || event.code === "ArrowLeft") controls.keys.left = down;
      if (event.code === "KeyD" || event.code === "ArrowRight") controls.keys.right = down;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") controls.run = down;
      if (event.code === "Space") controls.jump = down;
    };
    const down = (event: KeyboardEvent) => {
      if (event.repeat) return;
      onKey(event, true);
    };
    const up = (event: KeyboardEvent) => onKey(event, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const element = gl.domElement;
    const start = (event: PointerEvent) => {
      if (event.button !== 0 || event.target !== element) return;
      dragging.current = true;
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      yaw.current -= (event.clientX - pointer.current.x) * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current + (event.clientY - pointer.current.y) * 0.0035, 0.18, 0.85);
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    const end = () => { dragging.current = false; };
    const wheel = (event: WheelEvent) => {
      distance.current = THREE.MathUtils.clamp(distance.current + event.deltaY * 0.008, 5.2, 9.5);
    };
    element.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    element.addEventListener("wheel", wheel, { passive: true });
    return () => {
      element.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      element.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033);
    const rigid = body.current;
    if (!rigid || rigid.numColliders() < 1) return;
    const character = controller();
    const locked = !started || posing || panel !== null;
    const wish = locked ? { x: 0, y: 0 } : keyboardVector();
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const speed = controls.run && wish.y > 0.2 ? 4.7 : 2.35;
    const planar = forward.multiplyScalar(wish.y).add(right.multiplyScalar(wish.x));
    if (planar.lengthSq() > 1) planar.setLength(1);
    const grounded = character.computedGrounded();
    if (grounded && vertical.current < 0) vertical.current = 0;
    if (!locked && grounded && controls.jump) {
      vertical.current = 4.8;
      controls.jump = false;
    }
    if (!grounded || vertical.current > 0) vertical.current -= 18 * dt;

    if (posing) {
      rigid.setNextKinematicTranslation({ x: photoSpot.x, y: 0.62, z: photoSpot.z });
      if (visual.current) visual.current.rotation.y = 0;
      runtime.position.set(photoSpot.x, 0, photoSpot.z);
      runtime.speed = 0;
      runtime.posing = true;
    } else {
      const displacement = { x: planar.x * speed * dt, y: vertical.current * dt, z: planar.z * speed * dt };
      character.computeColliderMovement(rigid.collider(0), displacement);
      const corrected = character.computedMovement();
      const current = rigid.translation();
      const next = { x: current.x + corrected.x, y: current.y + corrected.y, z: current.z + corrected.z };
      rigid.setNextKinematicTranslation(next);
      runtime.position.set(next.x, 0, next.z);
      runtime.speed = Math.hypot(corrected.x, corrected.z) / dt;
      runtime.posing = false;
      if (visual.current && planar.lengthSq() > 0.01) {
        const target = Math.atan2(planar.x, planar.z);
        visual.current.rotation.y = dampAngle(visual.current.rotation.y, target, dt);
      }
    }
    runtime.yaw = yaw.current;

    const target = runtime.position;
    const look = new THREE.Vector3(target.x, 1.15, target.z);
    const desired = new THREE.Vector3(
      target.x + Math.sin(yaw.current) * Math.cos(pitch.current) * distance.current,
      look.y + Math.sin(pitch.current) * distance.current * 0.72,
      target.z + Math.cos(yaw.current) * Math.cos(pitch.current) * distance.current,
    );
    const direction = desired.clone().sub(look);
    const reach = direction.length();
    if (reach > 0.01) {
      direction.normalize();
      const hit = world.castRay(new rapier.Ray(look, direction), reach, true, undefined, undefined, undefined, rigid);
      if (hit) desired.copy(look).add(direction.multiplyScalar(Math.max(2.2, hit.timeOfImpact - 0.45)));
    }
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.lookAt(look);
  });

  return (
    <RigidBody ref={body} type="kinematicPosition" position={[0, 0.62, 1.4]} colliders={false} enabledRotations={[false, false, false]}>
      <CapsuleCollider args={[0.36, 0.22]} />
      <group ref={visual} position={[0, -0.58, 0]}>
        <Maggie />
      </group>
    </RigidBody>
  );
}

function Maggie() {
  const gltf = useGLTF(modelUrl);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const actions = useRef<Record<string, THREE.AnimationAction>>({});
  const current = useRef("idle");
  const carry = useWorldStore((state) => state.carry);
  const seed = useRef<THREE.Group>(null);
  const can = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    for (const clip of gltf.animations) actions.current[clip.name] = mixer.clipAction(clip);
    actions.current.idle?.play();
    const hand = scene.getObjectByName("handR");
    if (hand && seed.current && can.current) {
      hand.add(seed.current, can.current);
    }
  }, [gltf.animations, mixer, scene]);

  useFrame((_, delta) => {
    const next = runtime.posing || runtime.speed < 0.35 ? "idle" : controls.run && runtime.speed > 3 ? "run" : "walk";
    if (next !== current.current && actions.current[next]) {
      actions.current[next].reset().fadeIn(0.16).play();
      actions.current[current.current]?.fadeOut(0.16);
      current.current = next;
    }
    mixer.update(delta);
    const hair = scene.getObjectByName("hair");
    if (hair) hair.rotation.z += Math.sin(performance.now() * 0.0016) * 0.012;
    if (seed.current) seed.current.visible = carry === "seed";
    if (can.current) can.current.visible = carry === "can";
  });

  return (
    <group>
      <primitive object={scene} />
      <group ref={seed} position={[0, -0.02, 0.08]} visible={false}>
        <mesh castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#c98955" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.07, 0]} castShadow>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#7dbb72" />
        </mesh>
      </group>
      <group ref={can} position={[0, 0.02, 0.08]} visible={false}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.12, 12]} />
          <meshStandardMaterial color="#8fd4ea" roughness={0.35} />
        </mesh>
        <mesh position={[0.06, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.035, 0.008, 6, 12]} />
          <meshStandardMaterial color="#d7f4ff" />
        </mesh>
      </group>
    </group>
  );
}

function dampAngle(current: number, target: number, delta: number) {
  const deltaAngle = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + deltaAngle * (1 - Math.pow(0.0008, delta));
}

useGLTF.preload(modelUrl);
