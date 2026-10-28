export const controls = {
  x: 0,
  y: 0,
  run: false,
  jump: false,
  keys: { forward: false, back: false, left: false, right: false },
};

export function keyboardVector() {
  const x = Number(controls.keys.right) - Number(controls.keys.left) + controls.x;
  const y = Number(controls.keys.forward) - Number(controls.keys.back) + controls.y;
  const length = Math.hypot(x, y);
  if (length < 0.12) return { x: 0, y: 0 };
  const scale = Math.min(1, length);
  return { x: (x / length) * scale, y: (y / length) * scale };
}
