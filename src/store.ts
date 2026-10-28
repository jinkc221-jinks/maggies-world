import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HouseId } from "./data/houses";

type WorldState = {
  started: boolean;
  activeHouse: HouseId | null;
  nearbyHouse: HouseId | null;
  mapOpen: boolean;
  settingsOpen: boolean;
  soundOn: boolean;
  lowQuality: boolean;
  visited: HouseId[];
  start: () => void;
  openHouse: (id: HouseId) => void;
  closeHouse: () => void;
  setNearbyHouse: (id: HouseId | null) => void;
  toggleMap: () => void;
  toggleSettings: () => void;
  setSound: (value: boolean) => void;
  setLowQuality: (value: boolean) => void;
};

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      started: false,
      activeHouse: null,
      nearbyHouse: null,
      mapOpen: false,
      settingsOpen: false,
      soundOn: true,
      lowQuality: false,
      visited: [],
      start: () => set({ started: true }),
      openHouse: (id) =>
        set((state) => ({
          activeHouse: id,
          nearbyHouse: null,
          mapOpen: false,
          settingsOpen: false,
          visited: state.visited.includes(id) ? state.visited : [...state.visited, id],
        })),
      closeHouse: () => set({ activeHouse: null }),
      setNearbyHouse: (id) => set({ nearbyHouse: id }),
      toggleMap: () => set((state) => ({ mapOpen: !state.mapOpen, settingsOpen: false })),
      toggleSettings: () =>
        set((state) => ({ settingsOpen: !state.settingsOpen, mapOpen: false })),
      setSound: (value) => set({ soundOn: value }),
      setLowQuality: (value) => set({ lowQuality: value }),
    }),
    {
      name: "maggies-world-settings",
      partialize: (state) => ({
        soundOn: state.soundOn,
        lowQuality: state.lowQuality,
        visited: state.visited,
      }),
    },
  ),
);
