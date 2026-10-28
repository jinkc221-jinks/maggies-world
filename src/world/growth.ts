import type { PlotState } from "../store";
import { BLOOM_MS, SPROUT_MS } from "./places";

export function growth(plot: PlotState) {
  if (plot.phase === "empty") return "empty";
  if (plot.phase === "sown") return "seed";
  const age = Date.now() - plot.time;
  if (age < SPROUT_MS) return "seed";
  if (age < BLOOM_MS) return "sprout";
  return "ready";
}
