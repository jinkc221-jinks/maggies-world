import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { houseRegistry, getDoorPosition } from "../data/houses";
import { runtime } from "../character/runtime";
import { useWorldStore } from "../store";
import { canSpot, musicSpot, plots, seedSpot, storySpot, tripodSpot, wallSpot, wishSpot } from "../world/places";
import { growth } from "../world/growth";

type Action = { id: string; x: number; z: number; label: string; run: () => void };

export function Interactions() {
  const current = useRef<Action | null>(null);
  const promptId = useRef<string | null>(null);
  const setPrompt = useWorldStore((state) => state.setPrompt);
  const posing = useWorldStore((state) => state.posing);
  const panel = useWorldStore((state) => state.panel);

  useFrame(() => {
    if (posing || panel) {
      current.current = null;
      const next = posing ? "shutter" : null;
      if (promptId.current !== next) {
        promptId.current = next;
        setPrompt(posing ? { id: "shutter", label: "按下快门", action: "E 拍照 · Esc 离开" } : null);
      }
      return;
    }
    const position = runtime.position;
    let best: Action | null = null;
    let distance = 1.7;
    for (const action of actions()) {
      const gap = Math.hypot(position.x - action.x, position.z - action.z);
      if (gap < distance) {
        best = action;
        distance = gap;
      }
    }
    const visited = useWorldStore.getState().visited;
    for (const house of houseRegistry) {
      const [x, , z] = getDoorPosition(house);
      if (!visited.includes(house.id) && Math.hypot(position.x - x, position.z - z) < 2.4) useWorldStore.getState().visit(house.id);
    }
    current.current = best;
    const next = best ? `${best.id}:${best.label}` : null;
    if (next !== promptId.current) {
      promptId.current = next;
      setPrompt(best ? { id: best.id, label: best.label, action: "按 E" } : null);
    }
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const state = useWorldStore.getState();
      if (event.code === "Escape") {
        if (state.posing) runtime.exitPose();
        else if (state.panel) state.setPanel(null);
      }
      if (event.code === "KeyE") {
        if (state.posing) runtime.takePhoto();
        else if (!state.panel) current.current?.run();
      }
    };
    const onUse = () => {
      const state = useWorldStore.getState();
      if (state.posing) runtime.takePhoto();
      else if (!state.panel) current.current?.run();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("maggie-use", onUse);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("maggie-use", onUse);
    };
  }, []);

  return null;
}

function actions(): Action[] {
  const state = useWorldStore.getState();
  const notice = state.setNotice;
  const list: Action[] = [
    {
      id: "seed",
      ...seedSpot,
      label: state.carry === "seed" ? "放回种子" : "拿起种子",
      run: () => {
        if (state.carry === "can") return notice("手里已经拿着水壶，先把它放下。");
        state.setCarry(state.carry === "seed" ? null : "seed");
        notice(state.carry === "seed" ? "种子放回柜子了。" : "种子拿在手里了，走到外面的田里种下。");
      },
    },
    {
      id: "can",
      ...canSpot,
      label: state.carry === "can" ? "放下水壶" : "拿起水壶",
      run: () => {
        if (state.carry === "seed") return notice("手里已经拿着种子，先种下或放回去。");
        state.setCarry(state.carry === "can" ? null : "can");
        notice(state.carry === "can" ? "水壶放回原处了。" : "水壶拿在手里了，去给种子浇水。");
      },
    },
    {
      id: "story",
      ...storySpot,
      label: "翻开故事本",
      run: () => state.setPanel("story"),
    },
    {
      id: "wish",
      ...wishSpot,
      label: "写一封信",
      run: () => state.setPanel("wish"),
    },
    {
      id: "music",
      ...musicSpot,
      label: "打开唱片",
      run: () => {
        state.setPlayerVisible(true);
        notice("音乐在右下角的网易云播放器里，可以切歌和暂停。");
      },
    },
    {
      id: "tripod",
      ...tripodSpot,
      label: "站到镜头前",
      run: () => state.setPosing(true),
    },
    {
      id: "wall",
      ...wallSpot,
      label: "看看照片墙",
      run: () => state.setPanel("album"),
    },
  ];
  plots.forEach((plot, index) => {
    const data = state.plots[index];
    const stage = growth(data);
    list.push({
      id: `plot-${index}`,
      x: plot.x,
      z: plot.z,
      label: labelFor(stage, state.carry),
      run: () => tend(index),
    });
  });
  return list;
}

function labelFor(stage: string, carry: string | null) {
  if (stage === "empty") return carry === "seed" ? "种下种子" : "空着的田地";
  if (stage === "seed") return carry === "can" ? "浇水" : "等待浇水";
  if (stage === "sprout") return "正在长大";
  return "收获花朵";
}

function tend(index: number) {
  const state = useWorldStore.getState();
  const plot = state.plots[index];
  const stage = growth(plot);
  if (stage === "empty") {
    if (state.carry !== "seed") return state.setNotice("先去花园小屋的柜子里，把种子拿在手里。");
    state.updatePlot(index, { phase: "sown", flower: Math.floor(Math.random() * 4), time: 0 });
    state.setCarry(null);
    state.setNotice("种子放进土里了。再拿起水壶浇水。");
    return;
  }
  if (stage === "seed") {
    if (plot.phase === "sown" && state.carry !== "can") return state.setNotice("种子还渴着。去屋里把水壶拿过来。");
    if (plot.phase === "sown") {
      state.updatePlot(index, { ...plot, phase: "wet", time: Date.now() });
      state.setNotice("浇好了。过一会儿它会发芽、开花。");
    } else state.setNotice("已经浇过水了，再等一会儿。");
    return;
  }
  if (stage === "sprout") return state.setNotice("它正在长大，先不要拔起来。");
  state.updatePlot(index, { phase: "empty", flower: 0, time: 0 });
  state.setNotice("花朵收获了，田地可以再种一轮。");
}
