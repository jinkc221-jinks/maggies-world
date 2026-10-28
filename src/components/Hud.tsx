import { useEffect, useRef } from "react";
import { houseRegistry } from "../data/houses";
import { controls } from "../character/input";
import { useWorldStore } from "../store";

export function WelcomeScreen() {
  const started = useWorldStore((state) => state.started);
  const start = useWorldStore((state) => state.start);
  if (!started) {
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
          <p className="tiny-label">A SOFT LITTLE VILLAGE</p>
          <h1>Maggie 的<br /><em>小世界</em></h1>
          <p>在草地上散步，走进五座小屋。种子要亲手拿出来，再带到田里种下。</p>
          <button className="enter-button" onClick={start}>
            <span>进入小世界</span><i>→</i>
          </button>
          <small>WASD 移动 · Shift 跑步 · 拖动旋转视角 · E 互动 · Esc 离开</small>
        </section>
      </div>
    );
  }
  return null;
}

export function Hud() {
  const started = useWorldStore((state) => state.started);
  const prompt = useWorldStore((state) => state.prompt);
  const notice = useWorldStore((state) => state.notice);
  const panel = useWorldStore((state) => state.panel);
  const posing = useWorldStore((state) => state.posing);
  const mapOpen = useWorldStore((state) => state.mapOpen);
  const settingsOpen = useWorldStore((state) => state.settingsOpen);
  const playerVisible = useWorldStore((state) => state.playerVisible);
  const lowQuality = useWorldStore((state) => state.lowQuality);
  const visited = useWorldStore((state) => state.visited);
  const toggleMap = useWorldStore((state) => state.toggleMap);
  const toggleSettings = useWorldStore((state) => state.toggleSettings);
  const setPlayerVisible = useWorldStore((state) => state.setPlayerVisible);
  const setLowQuality = useWorldStore((state) => state.setLowQuality);
  const setNotice = useWorldStore((state) => state.setNotice);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice, setNotice]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyM" && !panel && !posing) toggleMap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, posing, toggleMap]);

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
        <span>{visited.length === houseRegistry.length ? "五座小屋都留下了脚印" : "走进小屋，把种子带到田里"}</span>
        <i>{visited.length} / {houseRegistry.length}</i>
      </div>

      {notice && <div className="notice-toast">{notice}</div>}

      {prompt && !panel && (
        <button className="interact-prompt" onClick={() => window.dispatchEvent(new Event("maggie-use"))}>
          <span>✧</span>
          <div><small>{prompt.action}</small><strong>{prompt.label}</strong></div>
          <i>→</i>
        </button>
      )}

      {mapOpen && (
        <aside className="floating-panel map-panel">
          <div className="panel-heading"><div><small>VILLAGE MAP</small><h2>小屋地图</h2></div><button onClick={toggleMap}>×</button></div>
          <div className="map-board">
            <div className="map-road vertical" /><div className="map-road horizontal" />
            {houseRegistry.map((house) => (
              <div key={house.id} className={`map-house map-${house.id} ${visited.includes(house.id) ? "visited" : ""}`}>
                <span>{house.icon}</span><i>{house.name}</i>
              </div>
            ))}
            <div className="you-are-here">沿着小路走过去</div>
          </div>
          <p>地图只用来认路。种子在花园小屋的柜子里，相机在村子中央的空地上。</p>
        </aside>
      )}

      {settingsOpen && (
        <aside className="floating-panel settings-panel">
          <div className="panel-heading"><div><small>SETTINGS</small><h2>世界设置</h2></div><button onClick={toggleSettings}>×</button></div>
          <label>
            <span><strong>网易云播放器</strong><small>右下角切歌、暂停</small></span>
            <input type="checkbox" checked={playerVisible} onChange={(event) => setPlayerVisible(event.target.checked)} />
          </label>
          <label>
            <span><strong>省电画质</strong><small>减少云朵和阴影</small></span>
            <input type="checkbox" checked={lowQuality} onChange={(event) => setLowQuality(event.target.checked)} />
          </label>
          <div className="privacy-note"><b>隐私说明</b><p>照片、愿望和田地都只存放在当前浏览器，不会上传。</p></div>
        </aside>
      )}

      {!panel && <TouchControls />}
      {playerVisible && (
        <iframe
          className="netease-player"
          title="网易云音乐"
          src="https://music.163.com/outchain/player?type=0&id=3778678&auto=0&height=66"
          allow="autoplay"
        />
      )}
    </div>
  );
}

function TouchControls() {
  const pad = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const active = useRef(false);

  useEffect(() => () => {
    controls.x = 0;
    controls.y = 0;
  }, []);

  const moveStick = (event: React.PointerEvent) => {
    if (!active.current) return;
    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;
    const length = Math.hypot(dx, dy) || 1;
    const scale = Math.min(42, length) / length;
    const knob = pad.current?.querySelector("i");
    if (knob instanceof HTMLElement) knob.style.transform = `translate(calc(-50% + ${dx * scale}px), calc(-50% + ${dy * scale}px))`;
    controls.x = (dx * scale) / 42;
    controls.y = (-dy * scale) / 42;
    controls.run = Math.hypot(controls.x, controls.y) > 0.86;
  };

  return (
    <div className="touch-controls" aria-label="手机移动控制">
      <div
        ref={pad}
        className="joystick"
        onPointerDown={(event) => {
          active.current = true;
          origin.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={moveStick}
        onPointerUp={(event) => {
          active.current = false;
          controls.x = 0;
          controls.y = 0;
          controls.run = false;
          const knob = pad.current?.querySelector("i");
          if (knob instanceof HTMLElement) knob.style.transform = "translate(-50%, -50%)";
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <b />
        <i />
      </div>
      <button
        className="jump-button"
        onPointerDown={() => { controls.jump = true; }}
        onPointerUp={() => { controls.jump = false; }}
        onPointerLeave={() => { controls.jump = false; }}
      >跳</button>
      <button className="mobile-enter" onClick={() => window.dispatchEvent(new Event("maggie-use"))}>互动</button>
    </div>
  );
}
