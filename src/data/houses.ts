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
    position: [0, 0, -8],
    rotation: 0,
    colors: ["#ffd2dc", "#fff2d6", "#d77991"],
    description: "一间装着故事、照片和小收藏的奶油色小屋。",
  },
  {
    id: "photo",
    name: "拍贴照相馆",
    subtitle: "拍一张可爱四格照",
    icon: "▣",
    position: [-10, 0, -2],
    rotation: Math.PI / 2,
    colors: ["#d9ccff", "#fff6fc", "#8d72d2"],
    description: "照片只在你的设备里处理，不会上传。",
  },
  {
    id: "garden",
    name: "种花花园",
    subtitle: "种下今天的心情",
    icon: "✿",
    position: [10, 0, -2],
    rotation: -Math.PI / 2,
    colors: ["#c9edb8", "#fff4c9", "#67a867"],
    description: "浇浇水，等一朵只属于你的花慢慢长大。",
  },
  {
    id: "music",
    name: "音乐小屋",
    subtitle: "做一段八拍旋律",
    icon: "♫",
    position: [-8, 0, 10],
    rotation: Math.PI,
    colors: ["#bfe7ff", "#fef1c8", "#5794bd"],
    description: "点亮音符，用浏览器合成一段轻快旋律。",
  },
  {
    id: "post",
    name: "愿望邮局",
    subtitle: "寄给未来的自己",
    icon: "✉",
    position: [8, 0, 10],
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
