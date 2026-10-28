import { houseRegistry, type HouseDefinition } from "../data/houses";

export function localToWorld(house: HouseDefinition, x: number, z: number) {
  const cos = Math.cos(house.rotation);
  const sin = Math.sin(house.rotation);
  return {
    x: house.position[0] + x * cos + z * sin,
    z: house.position[2] - x * sin + z * cos,
  };
}

export const gardenHouse = houseRegistry.find((house) => house.id === "garden")!;
export const homeHouse = houseRegistry.find((house) => house.id === "home")!;
export const postHouse = houseRegistry.find((house) => house.id === "post")!;
export const musicHouse = houseRegistry.find((house) => house.id === "music")!;

export const plots = Array.from({ length: 6 }, (_, index) => {
  const column = index % 3;
  const row = Math.floor(index / 3);
  return { x: 6.15 + column * 1.2, z: -1.85 + row * 1.35 };
});

export const seedSpot = localToWorld(gardenHouse, -0.75, -1.25);
export const canSpot = localToWorld(gardenHouse, 0.75, -1.25);
export const storySpot = localToWorld(homeHouse, 0, -1.15);
export const wishSpot = localToWorld(postHouse, 0, -1.15);
export const musicSpot = localToWorld(musicHouse, 0, -1.15);

export const photoSpot = { x: -2.1, z: 5.1 };
export const tripodSpot = { x: -2.1, z: 7.65 };
export const wallSpot = { x: -5.55, z: 5.1 };

export const SPROUT_MS = 12_000;
export const BLOOM_MS = 30_000;
