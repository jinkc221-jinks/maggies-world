# Maggie 的小世界

一个可爱的地面方块村庄。玩家可以第三人称散步，走进五座小屋拍照、种花、做音乐、寄愿望。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址即可。手机和电脑都能玩。

## 操作

- 电脑：WASD 移动，拖动旋转视角，空格跳跃，靠近门口按 E 进入
- 手机：左侧摇杆移动，滑动画面旋转，右侧按钮跳跃/进入

## 小屋扩展

在 `src/data/houses.ts` 增加一间小屋：

```ts
{
  id: "library",
  name: "绘本屋",
  subtitle: "读一本短短的故事",
  icon: "✦",
  position: [0, 0, 12],
  rotation: Math.PI,
  colors: ["#ffe8b8", "#fff8ef", "#d7a15a"],
  description: "新的小屋说明。",
}
```

然后：

1. 把 `HouseId` 加上新的 id
2. 在 `src/components/MiniApps.tsx` 的 `apps` 里接上对应功能组件

## 依赖

核心开源库都是 MIT 许可：

- Three.js / React Three Fiber / Drei / Rapier
- [ecctrl](https://github.com/pmndrs/ecctrl) 第三人称移动与手机摇杆

所有照片、愿望和花园记录只保存在当前浏览器，不会上传。
