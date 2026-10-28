export type HouseId = "home" | "photo" | "garden" | "music" | "post";

export type HouseDefinition = {
  id: HouseId;
  name: string;
  subtitle: string;
  icon: string;
  position: [number, number, number];
  rotation: number;
  colors: [string, string, string];
  description: string;
};

export const houseRegistry: HouseDefinition[] = [
  {
    id: "home",
    name: "Maggie 之家",
    subtitle: "认识这个小世界",
    icon: "⌂",
    position: [0, 0, -11],
    rotation: 0,
    colors: ["#ffd2dc", "#fff2d6", "#d77991"],
    description: "一间装着故事、照片和小收藏的奶油色小屋。",
  },
  {
    id: "photo",
    name: "拍贴照相馆",
    subtitle: "到户外相机前留影",
    icon: "▣",
    position: [-10.5, 0, -1],
    rotation: Math.PI / 2,
    colors: ["#d9ccff", "#fff6fc", "#8d72d2"],
    description: "走出小屋，到三脚架前站好，确认小屏幕里的画面再按快门。",
  },
  {
    id: "garden",
    name: "种花花园",
    subtitle: "把种子亲手带到田里",
    icon: "✿",
    position: [10.4, 0, -1],
    rotation: -Math.PI / 2,
    colors: ["#c9edb8", "#fff4c9", "#67a867"],
    description: "种子和水壶都在屋里。拿在手里，再走到门外的田里。",
  },
  {
    id: "music",
    name: "音乐小屋",
    subtitle: "听一会儿歌",
    icon: "♫",
    position: [-10.2, 0, 8.4],
    rotation: Math.PI / 2,
    colors: ["#bfe7ff", "#fef1c8", "#5794bd"],
    description: "村里的歌由右下角的网易云播放器播放。",
  },
  {
    id: "post",
    name: "愿望邮局",
    subtitle: "寄给未来的自己",
    icon: "✉",
    position: [7.4, 0, 10.2],
    rotation: Math.PI,
    colors: ["#ffcda9", "#fff1e4", "#c97b57"],
    description: "写下愿望，盖上邮戳，悄悄保存在这台设备里。",
  },
];

export function getDoorPosition(house: HouseDefinition): [number, number, number] {
  const distance = 3.15;
  return [
    house.position[0] + Math.sin(house.rotation) * distance,
    0,
    house.position[2] + Math.cos(house.rotation) * distance,
  ];
}
