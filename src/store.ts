import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HouseId } from "./data/houses";

export type Carry = "seed" | "can" | null;
export type Panel = "story" | "wish" | "album" | null;
export type PlotState = { phase: "empty" | "sown" | "wet"; flower: number; time: number };

type Prompt = { id: string; label: string; action: string } | null;

type WorldState = {
  started: boolean;
  posing: boolean;
  panel: Panel;
  carry: Carry;
  prompt: Prompt;
  notice: string;
  mapOpen: boolean;
  settingsOpen: boolean;
  playerVisible: boolean;
  lowQuality: boolean;
  visited: HouseId[];
  plots: PlotState[];
  photos: string[];
  start: () => void;
  setPosing: (value: boolean) => void;
  setPanel: (panel: Panel) => void;
  setCarry: (carry: Carry) => void;
  setPrompt: (prompt: Prompt) => void;
  setNotice: (notice: string) => void;
  toggleMap: () => void;
  toggleSettings: () => void;
  setPlayerVisible: (value: boolean) => void;
  setLowQuality: (value: boolean) => void;
  visit: (id: HouseId) => void;
  updatePlot: (index: number, plot: PlotState) => void;
  addPhoto: (photo: string) => void;
};

const emptyPlots = (): PlotState[] => Array.from({ length: 6 }, () => ({ phase: "empty", flower: 0, time: 0 }));

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      started: false,
      posing: false,
      panel: null,
      carry: null,
      prompt: null,
      notice: "",
      mapOpen: false,
      settingsOpen: false,
      playerVisible: true,
      lowQuality: false,
      visited: [],
      plots: emptyPlots(),
      photos: [],
      start: () => set({ started: true }),
      setPosing: (posing) => set({ posing, prompt: null }),
      setPanel: (panel) => set({ panel, mapOpen: false, settingsOpen: false }),
      setCarry: (carry) => set({ carry }),
      setPrompt: (prompt) => set({ prompt }),
      setNotice: (notice) => set({ notice }),
      toggleMap: () => set((state) => ({ mapOpen: !state.mapOpen, settingsOpen: false })),
      toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen, mapOpen: false })),
      setPlayerVisible: (playerVisible) => set({ playerVisible }),
      setLowQuality: (lowQuality) => set({ lowQuality }),
      visit: (id) => set((state) => ({ visited: state.visited.includes(id) ? state.visited : [...state.visited, id] })),
      updatePlot: (index, plot) => set((state) => ({ plots: state.plots.map((item, i) => (i === index ? plot : item)) })),
      addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos].slice(0, 8) })),
    }),
    {
      name: "maggies-world-v2",
      partialize: (state) => ({
        playerVisible: state.playerVisible,
        lowQuality: state.lowQuality,
        visited: state.visited,
        plots: state.plots,
        photos: state.photos,
      }),
    },
  ),
);
