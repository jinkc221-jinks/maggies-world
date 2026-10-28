import { useEffect } from "react";
import { Joystick, VirtualButton } from "ecctrl/input";
import { houseRegistry } from "../data/houses";
import { useWorldStore } from "../store";

export function WelcomeScreen() {
  const started = useWorldStore((state) => state.started);
  const start = useWorldStore((state) => state.start);
  if (started) return null;

  return (
    <div className="welcome-screen">
      <div className="welcome-cloud cloud-a" />
      <div className="welcome-cloud cloud-b" />
      <section className="welcome-card">
        <div className="welcome-world" aria-hidden="true">
          <div className="mini-house"><i /><b /><span>♡</span></div>
          <div className="mini-tree"><i /><b /></div>
          <div className="mini-path" />
        </div>
        <p className="tiny-label">A COZY BLOCKY VILLAGE</p>
        <h1>Maggie 的<br /><em>小世界</em></h1>
        <p>在地面上散步，去五座小屋里拍照、种花、做音乐，再寄一封只留给自己的愿望信。</p>
        <button className="enter-button" onClick={start}>
          <span>进入小世界</span><i>→</i>
        </button>
        <small>电脑：WASD 移动 · 拖动旋转视角 · 空格跳跃<br />手机：左侧摇杆移动 · 滑动画面旋转</small>
      </section>
    </div>
  );
}

export function Hud() {
  const started = useWorldStore((state) => state.started);
  const nearbyHouse = useWorldStore((state) => state.nearbyHouse);
  const activeHouse = useWorldStore((state) => state.activeHouse);
  const mapOpen = useWorldStore((state) => state.mapOpen);
  const settingsOpen = useWorldStore((state) => state.settingsOpen);
  const soundOn = useWorldStore((state) => state.soundOn);
  const lowQuality = useWorldStore((state) => state.lowQuality);
  const visited = useWorldStore((state) => state.visited);
  const openHouse = useWorldStore((state) => state.openHouse);
  const toggleMap = useWorldStore((state) => state.toggleMap);
  const toggleSettings = useWorldStore((state) => state.toggleSettings);
  const setSound = useWorldStore((state) => state.setSound);
  const setLowQuality = useWorldStore((state) => state.setLowQuality);
  const nearby = houseRegistry.find((house) => house.id === nearbyHouse);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyE" && nearbyHouse && !activeHouse) openHouse(nearbyHouse);
      if (event.code === "KeyM" && !activeHouse) toggleMap();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [activeHouse, nearbyHouse, openHouse, toggleMap]);

  if (!started) return null;

  return (
    <div className="hud">
      <header className="world-header">
        <div className="world-logo"><i>♡</i><span><strong>Maggie 的小世界</strong><small>MAGGIE'S LITTLE WORLD</small></span></div>
        <nav>
          <button className={mapOpen ? "active" : ""} onClick={toggleMap} aria-label="打开村庄地图">⌖ <span>地图</span></button>
          <button className={settingsOpen ? "active" : ""} onClick={toggleSettings} aria-label="打开设置">⚙ <span>设置</span></button>
        </nav>
      </header>

      <div className="quest-pill">
        <span>{visited.length === houseRegistry.length ? "所有小屋都留下了你的脚印" : "今天想先去哪一间小屋？"}</span>
        <i>{visited.length} / {houseRegistry.length}</i>
      </div>

      {nearby && !activeHouse && (
        <button className="interact-prompt" onClick={() => openHouse(nearby.id)}>
          <span>{nearby.icon}</span>
          <div><small>按 E 进入</small><strong>{nearby.name}</strong></div>
          <i>→</i>
        </button>
      )}

      {mapOpen && (
        <aside className="floating-panel map-panel">
          <div className="panel-heading"><div><small>VILLAGE MAP</small><h2>小屋地图</h2></div><button onClick={toggleMap}>×</button></div>
          <div className="map-board">
            <div className="map-road vertical" /><div className="map-road horizontal" />
            {houseRegistry.map((house) => (
              <button
                key={house.id}
                className={`map-house map-${house.id} ${visited.includes(house.id) ? "visited" : ""}`}
                onClick={() => openHouse(house.id)}
              >
                <span>{house.icon}</span><i>{house.name}</i>
              </button>
            ))}
            <div className="you-are-here">你在村庄里</div>
          </div>
          <p>沿着浅黄色小路散步，靠近门口就会出现进入提示。</p>
        </aside>
      )}

      {settingsOpen && (
        <aside className="floating-panel settings-panel">
          <div className="panel-heading"><div><small>SETTINGS</small><h2>世界设置</h2></div><button onClick={toggleSettings}>×</button></div>
          <label><span><strong>世界声音</strong><small>音乐小屋与交互音效</small></span><input type="checkbox" checked={soundOn} onChange={(e) => setSound(e.target.checked)} /></label>
          <label><span><strong>省电画质</strong><small>关闭动态装饰与高精度阴影</small></span><input type="checkbox" checked={lowQuality} onChange={(e) => setLowQuality(e.target.checked)} /></label>
          <div className="privacy-note"><b>隐私说明</b><p>照片、愿望与花园都只存放在当前浏览器，不会上传。</p></div>
        </aside>
      )}

      {!activeHouse && (
        <div className="touch-controls" aria-label="手机移动控制">
          <Joystick
            joystickMaxRadius={42}
            joystickWrapperStyle={{ position: "fixed", left: 12, bottom: 20, width: 150, height: 150, zIndex: 22 }}
            joystickBaseStyle={{ width: 92, height: 92, background: "rgba(255,255,255,.46)", border: "2px solid rgba(107,83,97,.16)" }}
            joystickKnobStyle={{ width: 54, height: 54, background: "#ff91ad", boxShadow: "0 8px 20px rgba(112,65,85,.2)" }}
          />
          <VirtualButton
            id="jump"
            label="跳"
            buttonWrapperStyle={{ position: "fixed", right: 18, bottom: 28, zIndex: 22 }}
            buttonCapStyle={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,.72)",
              color: "#5c4452",
              boxShadow: "0 8px 18px rgba(92,58,73,.16)",
            }}
          />
          {nearby && <button className="mobile-enter" onClick={() => openHouse(nearby.id)}>进入</button>}
        </div>
      )}
    </div>
  );
}
