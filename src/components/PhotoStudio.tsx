import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { runtime } from "../character/runtime";
import { useWorldStore } from "../store";
import { photoSpot, tripodSpot, wallSpot } from "../world/places";

const WIDTH = 480;
const HEIGHT = 320;

export function PhotoStudio() {
  const { gl, scene } = useThree();
  const screen = useRef<THREE.Mesh>(null);
  const posing = useWorldStore((state) => state.posing);
  const photos = useWorldStore((state) => state.photos);
  const addPhoto = useWorldStore((state) => state.addPhoto);
  const setNotice = useWorldStore((state) => state.setNotice);
  const setPosing = useWorldStore((state) => state.setPosing);
  const target = useMemo(() => new THREE.WebGLRenderTarget(WIDTH, HEIGHT), []);
  const camera = useMemo(() => new THREE.PerspectiveCamera(30, WIDTH / HEIGHT, 0.1, 40), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ map: target.texture }), [target.texture]);

  useEffect(() => {
    runtime.exitPose = () => setPosing(false);
    runtime.takePhoto = () => {
      if (!screen.current) return;
      screen.current.visible = false;
      camera.position.set(tripodSpot.x, 1.38, tripodSpot.z - 0.2);
      camera.lookAt(photoSpot.x, 1.2, photoSpot.z);
      gl.setRenderTarget(target);
      gl.render(scene, camera);
      const buffer = new Uint8Array(WIDTH * HEIGHT * 4);
      gl.readRenderTargetPixels(target, 0, 0, WIDTH, HEIGHT, buffer);
      gl.setRenderTarget(null);
      screen.current.visible = true;
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) return;
      const image = context.createImageData(WIDTH, HEIGHT);
      for (let y = 0; y < HEIGHT; y += 1) {
        const source = (HEIGHT - 1 - y) * WIDTH * 4;
        image.data.set(buffer.subarray(source, source + WIDTH * 4), y * WIDTH * 4);
      }
      context.putImageData(image, 0, 0);
      context.strokeStyle = "#ffd0e0";
      context.lineWidth = 16;
      context.strokeRect(8, 8, WIDTH - 16, HEIGHT - 16);
      context.fillStyle = "#6b5361";
      context.font = "24px sans-serif";
      context.fillText("Maggie 的小世界", 28, HEIGHT - 28);
      addPhoto(canvas.toDataURL("image/jpeg", 0.74));
      setNotice("快门按下了，照片已经贴到旁边的墙上。");
    };
  }, [addPhoto, camera, gl, scene, setNotice, setPosing, target]);

  useFrame(() => {
    const near = posing || Math.hypot(runtime.position.x - tripodSpot.x, runtime.position.z - tripodSpot.z) < 9;
    const preview = screen.current;
    if (!near || !preview) return;
    preview.visible = false;
    camera.position.set(tripodSpot.x, 1.38, tripodSpot.z - 0.2);
    camera.lookAt(photoSpot.x, 1.2, photoSpot.z);
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    preview.visible = true;
  });

  return (
    <group>
      <group position={[wallSpot.x, 0, wallSpot.z]} rotation={[0, -Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.9, 1.3, 0.12]} position={[0, 1.35, 0]} />
        </RigidBody>
        <RoundedBox args={[3.8, 2.5, 0.16]} radius={0.08} position={[0, 1.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#fff4ea" roughness={0.8} />
        </RoundedBox>
        {Array.from({ length: 8 }, (_, index) => {
          const column = index % 4;
          const row = Math.floor(index / 4);
          return <Frame key={index} url={photos[index]} position={[-1.35 + column * 0.9, 1.85 - row * 0.85, 0.1]} />;
        })}
      </group>

      <group position={[tripodSpot.x, 0, tripodSpot.z]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.28, 0.7, 0.28]} position={[0, 0.7, 0]} />
        </RigidBody>
        {[0, 2.1, 4.2].map((turn) => (
          <mesh key={turn} position={[Math.sin(turn) * 0.28, 0.55, Math.cos(turn) * 0.28]} rotation={[0.18, turn, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, 1.15, 8]} />
            <meshStandardMaterial color="#d7b79a" />
          </mesh>
        ))}
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[0.34, 0.22, 0.42]} />
          <meshStandardMaterial color="#6f8f86" />
        </mesh>
        <mesh position={[0, 1.25, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
          <meshStandardMaterial color="#233038" metalness={0.25} roughness={0.3} />
        </mesh>
        <mesh ref={screen} position={[0, 0.82, 0.16]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.42, 0.28]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function Frame({ url, position }: { url?: string; position: [number, number, number] }) {
  const texture = useMemo(() => (url ? new THREE.TextureLoader().load(url) : null), [url]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.74, 0.56, 0.05]} />
        <meshStandardMaterial color="#f8e7d4" />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.62, 0.44]} />
        {texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : <meshStandardMaterial color="#f6d5e3" />}
      </mesh>
    </group>
  );
}
