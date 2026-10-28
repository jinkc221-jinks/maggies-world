import * as THREE from "three";

const skin = new THREE.MeshPhysicalMaterial({ color: "#f4c3ae", roughness: 0.46, metalness: 0, sheen: 0.25, sheenColor: "#fff1e8" });
const blush = new THREE.MeshPhysicalMaterial({ color: "#ff8ea6", roughness: 0.4, transparent: true, opacity: 0.38 });
const hairMat = new THREE.MeshPhysicalMaterial({ color: "#6a3d4a", roughness: 0.28, metalness: 0.04, sheen: 0.7, sheenColor: "#d7a0b0" });
const hairLite = new THREE.MeshPhysicalMaterial({ color: "#8d5968", roughness: 0.3, sheen: 0.5, sheenColor: "#f0c9d4" });
const dress = new THREE.MeshPhysicalMaterial({ color: "#ff8eaf", roughness: 0.42, metalness: 0, sheen: 0.85, sheenColor: "#ffe4ee", side: THREE.DoubleSide });
const cream = new THREE.MeshStandardMaterial({ color: "#fff3d4", roughness: 0.55 });
const irisMat = new THREE.MeshStandardMaterial({ color: "#6d78ff", roughness: 0.2, emissive: "#3a4296", emissiveIntensity: 0.18 });
const dark = new THREE.MeshStandardMaterial({ color: "#2d2430", roughness: 0.35 });
const white = new THREE.MeshStandardMaterial({ color: "#fffdfb", roughness: 0.3 });
const shoe = new THREE.MeshStandardMaterial({ color: "#fff7f2", roughness: 0.4 });
const ribbon = new THREE.MeshStandardMaterial({ color: "#ffd1e2", roughness: 0.45 });

function bone(name, parent, x, y, z) {
  const next = new THREE.Bone();
  next.name = name;
  next.position.set(x, y, z);
  parent.add(next);
  return next;
}

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}

function quatTrack(name, times, eulers) {
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const values = [];
  eulers.forEach(([x, y, z]) => {
    euler.set(x, y, z);
    quat.setFromEuler(euler);
    values.push(quat.x, quat.y, quat.z, quat.w);
  });
  return new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, values);
}

export function createMaggie() {
  const root = new THREE.Group();
  root.name = "Maggie";
  const hips = bone("hips", root, 0, 0.9, 0);
  const skirt = bone("skirt", hips, 0, 0.02, 0);
  const spine = bone("spine", hips, 0, 0.08, 0);
  const chest = bone("chest", spine, 0, 0.16, 0);
  const neck = bone("neck", chest, 0, 0.16, 0);
  const head = bone("head", neck, 0, 0.07, 0);
  const hair = bone("hair", head, 0, 0.02, -0.02);
  const hairL = bone("hairL", head, -0.1, -0.02, 0);
  const hairR = bone("hairR", head, 0.1, -0.02, 0);
  const armL = bone("armL", chest, 0.16, 0.1, 0);
  const foreL = bone("foreL", armL, 0.02, -0.24, 0);
  const handL = bone("handL", foreL, 0, -0.2, 0);
  const armR = bone("armR", chest, -0.16, 0.1, 0);
  const foreR = bone("foreR", armR, -0.02, -0.24, 0);
  const handR = bone("handR", foreR, 0, -0.2, 0);
  const thighL = bone("thighL", hips, 0.08, -0.06, 0);
  const shinL = bone("shinL", thighL, 0, -0.34, 0);
  const footL = bone("footL", shinL, 0, -0.32, 0);
  const thighR = bone("thighR", hips, -0.08, -0.06, 0);
  const shinR = bone("shinR", thighR, 0, -0.34, 0);
  const footR = bone("footR", shinR, 0, -0.32, 0);
  handR.name = "handR";

  const skirtPoints = [];
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    skirtPoints.push(new THREE.Vector2(0.13 + t * 0.24 + Math.sin(t * Math.PI) * 0.03, -t * 0.4));
  }
  mesh(skirt, new THREE.LatheGeometry(skirtPoints, 28), dress);
  mesh(chest, new THREE.CapsuleGeometry(0.13, 0.16, 8, 16), dress, 0, 0.02, 0);
  mesh(chest, new THREE.SphereGeometry(0.075, 18, 14), cream, 0, 0.04, 0.1);
  mesh(neck, new THREE.CapsuleGeometry(0.045, 0.05, 4, 10), skin);

  mesh(head, new THREE.SphereGeometry(0.155, 28, 22), skin, 0, 0.08, 0);
  mesh(head, new THREE.SphereGeometry(0.045, 12, 10), blush, -0.07, 0.02, 0.12);
  mesh(head, new THREE.SphereGeometry(0.045, 12, 10), blush, 0.07, 0.02, 0.12);
  makeEye(head, -0.055);
  makeEye(head, 0.055);
  mesh(head, new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: "#e98998" }), 0, -0.02, 0.145).scale.set(1.4, 0.55, 0.4);
  mesh(head, new THREE.BoxGeometry(0.05, 0.008, 0.01), dark, -0.055, 0.09, 0.13).rotation.z = 0.25;
  mesh(head, new THREE.BoxGeometry(0.05, 0.008, 0.01), dark, 0.055, 0.09, 0.13).rotation.z = -0.25;

  mesh(hair, new THREE.SphereGeometry(0.168, 24, 18), hairMat, 0, 0.1, -0.02).scale.set(1.05, 1.08, 1.12);
  mesh(hair, new THREE.SphereGeometry(0.09, 16, 12), hairLite, 0, 0.2, 0.04);
  mesh(hair, new THREE.SphereGeometry(0.07, 14, 10), hairMat, -0.08, 0.12, 0.08).scale.set(1.2, 0.55, 0.7);
  mesh(hair, new THREE.SphereGeometry(0.07, 14, 10), hairMat, 0.08, 0.12, 0.08).scale.set(1.2, 0.55, 0.7);
  mesh(hair, new THREE.TorusGeometry(0.045, 0.012, 8, 16), ribbon, 0.12, 0.16, -0.04).rotation.y = 0.8;
  mesh(hairL, new THREE.CapsuleGeometry(0.035, 0.22, 4, 10), hairMat, 0, -0.16, 0);
  mesh(hairR, new THREE.CapsuleGeometry(0.035, 0.22, 4, 10), hairMat, 0, -0.16, 0);

  mesh(armL, new THREE.CapsuleGeometry(0.045, 0.18, 4, 10), skin, 0.01, -0.12, 0);
  mesh(foreL, new THREE.CapsuleGeometry(0.04, 0.14, 4, 10), skin, 0, -0.1, 0);
  mesh(handL, new THREE.SphereGeometry(0.045, 12, 10), skin);
  mesh(armR, new THREE.CapsuleGeometry(0.045, 0.18, 4, 10), skin, -0.01, -0.12, 0);
  mesh(foreR, new THREE.CapsuleGeometry(0.04, 0.14, 4, 10), skin, 0, -0.1, 0);
  mesh(handR, new THREE.SphereGeometry(0.045, 12, 10), skin);

  for (const [thigh, shin, foot] of [[thighL, shinL, footL], [thighR, shinR, footR]]) {
    mesh(thigh, new THREE.CapsuleGeometry(0.055, 0.24, 4, 10), skin, 0, -0.16, 0);
    mesh(shin, new THREE.CapsuleGeometry(0.048, 0.22, 4, 10), skin, 0, -0.15, 0);
    mesh(foot, new THREE.SphereGeometry(0.055, 14, 10), shoe, 0, -0.03, 0.05).scale.set(1, 0.72, 1.45);
  }

  armL.rotation.z = 0.22;
  armR.rotation.z = -0.22;
  foreL.rotation.z = 0.08;
  foreR.rotation.z = -0.08;

  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  const idle = clip("idle", 2.4, breathe(0.035));
  const walk = clip("walk", 0.86, gait(0.62, 0.45, 0.08));
  const run = clip("run", 0.48, gait(1.05, 0.82, 0.28));
  return { root, clips: [idle, walk, run], hand: handR };
}

function makeEye(parent, x) {
  const eye = new THREE.Group();
  eye.position.set(x, 0.045, 0.125);
  parent.add(eye);
  mesh(eye, new THREE.SphereGeometry(0.034, 16, 12), white);
  mesh(eye, new THREE.SphereGeometry(0.02, 14, 12), irisMat, 0, 0, 0.018);
  mesh(eye, new THREE.SphereGeometry(0.01, 10, 8), dark, 0, 0, 0.03);
  mesh(eye, new THREE.SphereGeometry(0.006, 8, 8), white, 0.01, 0.01, 0.036);
}

function clip(name, duration, frames) {
  const times = frames.map((frame) => frame.t * duration);
  const tracks = [
    quatTrack("thighL", times, frames.map((frame) => [frame.leg, 0, 0])),
    quatTrack("thighR", times, frames.map((frame) => [-frame.leg, 0, 0])),
    quatTrack("shinL", times, frames.map((frame) => [frame.leg < 0 ? -frame.leg * 1.25 : 0.04, 0, 0])),
    quatTrack("shinR", times, frames.map((frame) => [frame.leg > 0 ? frame.leg * 1.25 : 0.04, 0, 0])),
    quatTrack("armL", times, frames.map((frame) => [-frame.arm, 0, 0.22])),
    quatTrack("armR", times, frames.map((frame) => [frame.arm, 0, -0.22])),
    quatTrack("foreL", times, frames.map((frame) => [Math.max(0, frame.arm) * 0.7, 0, 0.08])),
    quatTrack("foreR", times, frames.map((frame) => [Math.max(0, -frame.arm) * 0.7, 0, -0.08])),
    quatTrack("spine", times, frames.map((frame) => [frame.lean, frame.sway, 0])),
    quatTrack("chest", times, frames.map((frame) => [frame.lean * 0.4, 0, 0])),
    quatTrack("hair", times, frames.map((frame) => [frame.hair, 0, frame.sway * 1.6])),
    quatTrack("hairL", times, frames.map((frame) => [0, 0, 0.08 + frame.sway])),
    quatTrack("hairR", times, frames.map((frame) => [0, 0, -0.08 - frame.sway])),
    quatTrack("skirt", times, frames.map((frame) => [frame.lean * 0.3, 0, -frame.sway * 1.4])),
  ];
  const animation = new THREE.AnimationClip(name, duration, tracks);
  return animation;
}

function breathe(amount) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    leg: 0,
    arm: Math.sin(t * Math.PI * 2) * 0.04,
    lean: 0,
    sway: Math.sin(t * Math.PI * 2) * amount,
    hair: Math.sin(t * Math.PI * 2) * 0.05,
  }));
}

function gait(leg, arm, lean) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const wave = Math.sin(t * Math.PI * 2);
    return { t, leg: wave * leg, arm: wave * arm, lean, sway: wave * 0.08, hair: -Math.abs(wave) * 0.12 };
  });
}
