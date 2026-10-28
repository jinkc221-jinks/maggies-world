import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HouseId } from "../data/houses";
import { houseRegistry } from "../data/houses";
import { useWorldStore } from "../store";

export function HouseModal() {
  const activeHouse = useWorldStore((state) => state.activeHouse);
  const closeHouse = useWorldStore((state) => state.closeHouse);
  const house = houseRegistry.find((item) => item.id === activeHouse);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeHouse();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [closeHouse]);

  if (!activeHouse || !house) return null;

  const apps: Record<HouseId, ReactNode> = {
    home: <MaggieHome />,
    photo: <PhotoBooth />,
    garden: <FlowerGarden />,
    music: <MusicRoom />,
    post: <WishPost />,
  };

  return (
    <div className="room-backdrop" role="dialog" aria-modal="true" aria-label={house.name}>
      <section className={`room room-${activeHouse}`}>
        <header className="room-header">
          <div className="room-title">
            <span>{house.icon}</span>
            <div>
              <p>{house.subtitle}</p>
              <h2>{house.name}</h2>
            </div>
          </div>
          <button className="round-button close-button" onClick={closeHouse} aria-label="离开小屋">×</button>
        </header>
        <div className="room-body">{apps[activeHouse]}</div>
        <footer className="room-footer">
          <span>所有内容只保存在你的浏览器里</span>
          <button className="soft-button" onClick={closeHouse}>回到村庄</button>
        </footer>
      </section>
    </div>
  );
}

function MaggieHome() {
  const [page, setPage] = useState(0);
  const pages = [
    {
      tag: "WELCOME",
      title: "欢迎来到 Maggie 的小世界",
      text: "这是一个在地面上慢慢生长的方块村庄。你可以散步、种花、做音乐，也可以什么都不做，只在树下看一会儿云。",
      art: "⌂",
    },
    {
      tag: "ABOUT",
      title: "小世界守则",
      text: "不赶时间，不比较进度，不把愿望交给陌生服务器。这里没有登录、排行榜或广告，只有留在你设备里的小小记录。",
      art: "♡",
    },
    {
      tag: "COLLECTION",
      title: "今天的收藏",
      text: "一片云的影子、一朵路边花、音乐小屋漏出来的三个音符，还有写完愿望以后轻一点的心情。",
      art: "✦",
    },
  ];
  const current = pages[page];

  return (
    <div className="home-app">
      <div className="scrapbook-art" aria-hidden="true">
        <span>{current.art}</span>
        <i>MAGGIE'S<br />LITTLE WORLD</i>
      </div>
      <div className="scrapbook-copy">
        <small>{current.tag} · {page + 1} / {pages.length}</small>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="pager">
          <button onClick={() => setPage((page - 1 + pages.length) % pages.length)}>上一页</button>
          <div>{pages.map((_, i) => <i key={i} className={i === page ? "active" : ""} />)}</div>
          <button onClick={() => setPage((page + 1) % pages.length)}>下一页</button>
        </div>
      </div>
    </div>
  );
}

function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "denied">("idle");
  const [shots, setShots] = useState<string[]>([]);
  const [tint, setTint] = useState("#ffd6e1");

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 360;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setShots((old) => [...old.slice(-3), canvas.toDataURL("image/jpeg", 0.88)]);
  }

  function downloadStrip() {
    if (!shots.length) return;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = shots.length * 430 + 100;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = tint;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#6b5361";
    context.font = "bold 28px sans-serif";
    context.textAlign = "center";
    context.fillText("Maggie 的小世界 · PHOTO BOOTH", 300, 48);
    let loaded = 0;
    shots.forEach((src, index) => {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 40, 75 + index * 430, 520, 390);
        context.font = "34px sans-serif";
        context.fillText(["♡", "✿", "✦", "☻"][index], 520, 115 + index * 430);
        loaded++;
        if (loaded === shots.length) {
          const link = document.createElement("a");
          link.download = "maggies-photo-strip.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      image.src = src;
    });
  }

  return (
    <div className="photo-app">
      <div className="camera-stage" style={{ background: tint }}>
        {status !== "ready" && (
          <div className="camera-placeholder">
            <span>▣</span>
            <h3>{status === "denied" ? "没有获得相机权限" : "准备好拍一组四格照了吗？"}</h3>
            <p>{status === "denied" ? "你可以检查浏览器权限后重试。照片始终不会上传。" : "浏览器会询问相机权限，画面只在当前设备中处理。"}</p>
            <button className="primary-button" onClick={startCamera} disabled={status === "loading"}>
              {status === "loading" ? "正在打开…" : status === "denied" ? "重新尝试" : "打开相机"}
            </button>
          </div>
        )}
        <video ref={videoRef} muted playsInline className={status === "ready" ? "" : "hidden"} />
        {status === "ready" && <div className="camera-sticker">♡ MAGGIE ♡</div>}
      </div>
      <div className="photo-controls">
        <div className="tints">
          {["#ffd6e1", "#d7ccff", "#c9edce", "#ffe8b8"].map((color) => (
            <button key={color} style={{ background: color }} onClick={() => setTint(color)} aria-label={`选择${color}相框`} />
          ))}
        </div>
        <button className="shutter" onClick={takePhoto} disabled={status !== "ready"} aria-label="拍照" />
        <span>{shots.length} / 4</span>
      </div>
      {shots.length > 0 && (
        <div className="photo-strip">
          {shots.map((shot, index) => <img src={shot} key={index} alt={`第 ${index + 1} 张拍贴照片`} />)}
          <button className="soft-button" onClick={downloadStrip}>下载拍贴</button>
          <button className="text-button" onClick={() => setShots([])}>重拍</button>
        </div>
      )}
    </div>
  );
}

type Plot = { flower: number; water: number };
const flowerIcons = ["🌷", "🌼", "🌸", "🌻"];

function FlowerGarden() {
  const [plots, setPlots] = useState<Plot[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("maggies-garden") || "null") || Array.from({ length: 8 }, () => ({ flower: -1, water: 0 }));
    } catch {
      return Array.from({ length: 8 }, () => ({ flower: -1, water: 0 }));
    }
  });
  const [seed, setSeed] = useState(0);

  useEffect(() => localStorage.setItem("maggies-garden", JSON.stringify(plots)), [plots]);

  function tend(index: number) {
    setPlots((old) => old.map((plot, i) => {
      if (i !== index) return plot;
      if (plot.flower < 0) return { flower: seed, water: 0 };
      return { ...plot, water: Math.min(3, plot.water + 1) };
    }));
  }

  return (
    <div className="garden-app">
      <div className="seed-tray">
        <div><small>选择种子</small><strong>今天想种什么？</strong></div>
        {flowerIcons.map((icon, index) => (
          <button key={icon} className={seed === index ? "selected" : ""} onClick={() => setSeed(index)}>{icon}</button>
        ))}
      </div>
      <div className="garden-grid">
        {plots.map((plot, index) => (
          <button key={index} className="garden-plot" onClick={() => tend(index)}>
            <span className={`plant stage-${plot.water}`}>
              {plot.flower < 0 ? "·" : plot.water < 2 ? "🌱" : flowerIcons[plot.flower]}
            </span>
            <i>{plot.flower < 0 ? "种下" : plot.water < 2 ? "浇水" : "开花啦"}</i>
          </button>
        ))}
      </div>
      <p className="app-note">点击空花圃播种，再点击为它浇水。花园会自动保存在这台设备上。</p>
    </div>
  );
}

const notes = [261.63, 293.66, 329.63, 392];

function MusicRoom() {
  const [grid, setGrid] = useState<boolean[][]>(() => notes.map((_, row) => Array.from({ length: 8 }, (_, col) => (row + col * 2) % 7 === 0)));
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(-1);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOn = useWorldStore((state) => state.soundOn);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioRef.current?.close();
  }, []);

  function tone(frequency: number, when = 0) {
    if (!soundOn) return;
    const context = audioRef.current || new AudioContext();
    audioRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + when + 0.35);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + when);
    oscillator.stop(context.currentTime + when + 0.38);
  }

  function toggleCell(row: number, col: number) {
    setGrid((old) => old.map((line, r) => line.map((value, c) => r === row && c === col ? !value : value)));
    tone(notes[row]);
  }

  function togglePlay() {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPlaying(false);
      setBeat(-1);
      return;
    }
    let current = 0;
    setPlaying(true);
    setBeat(current);
    grid.forEach((row, i) => row[current] && tone(notes[i]));
    timerRef.current = window.setInterval(() => {
      current = (current + 1) % 8;
      setBeat(current);
      grid.forEach((row, i) => row[current] && tone(notes[i]));
    }, 360);
  }

  return (
    <div className="music-app">
      <div className="music-top">
        <div><small>8 BEAT MUSIC BOX</small><h3>点亮方块，拼一段旋律</h3></div>
        <button className={`play-button ${playing ? "playing" : ""}`} onClick={togglePlay}>{playing ? "暂停" : "播放"}</button>
      </div>
      <div className="sequencer">
        {grid.map((row, rowIndex) => (
          <div className="note-row" key={rowIndex}>
            <span>{["高", "咪", "来", "哆"][rowIndex]}</span>
            {row.map((active, colIndex) => (
              <button
                key={colIndex}
                className={`${active ? "active" : ""} ${beat === colIndex ? "now" : ""}`}
                onClick={() => toggleCell(rowIndex, colIndex)}
                aria-label={`${rowIndex + 1}行第${colIndex + 1}拍`}
              />
            ))}
          </div>
        ))}
      </div>
      {!soundOn && <p className="app-note">当前世界声音已关闭，请在右上角设置中打开。</p>}
    </div>
  );
}

type Wish = { id: number; text: string; paper: string; date: string };

function WishPost() {
  const [text, setText] = useState("");
  const [paper, setPaper] = useState("#fff1df");
  const [wishes, setWishes] = useState<Wish[]>(() => {
    try { return JSON.parse(localStorage.getItem("maggies-wishes") || "[]"); } catch { return []; }
  });

  useEffect(() => localStorage.setItem("maggies-wishes", JSON.stringify(wishes)), [wishes]);

  function sendWish() {
    const value = text.trim();
    if (!value) return;
    setWishes((old) => [{ id: Date.now(), text: value, paper, date: new Date().toLocaleDateString("zh-CN") }, ...old]);
    setText("");
  }

  return (
    <div className="post-app">
      <div className="letter-editor" style={{ background: paper }}>
        <span>TO：未来的我</span>
        <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={180} placeholder="我希望……" />
        <div>
          <div className="paper-picks">
            {["#fff1df", "#ffe1ea", "#e3ddff", "#dff2df"].map((color) => (
              <button key={color} style={{ background: color }} onClick={() => setPaper(color)} aria-label="选择信纸颜色" />
            ))}
          </div>
          <small>{text.length} / 180</small>
        </div>
        <button className="stamp-button" onClick={sendWish} disabled={!text.trim()}>盖章寄出</button>
      </div>
      <div className="mailbox">
        <h3>我的本地信箱 <span>{wishes.length}</span></h3>
        {wishes.length === 0 ? <p>信箱还是空的。写下第一封给未来的信吧。</p> : (
          <div className="wish-list">
            {wishes.map((wish) => (
              <article key={wish.id} style={{ background: wish.paper }}>
                <small>{wish.date}</small>
                <p>{wish.text}</p>
                <button onClick={() => setWishes((old) => old.filter((item) => item.id !== wish.id))}>删除</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
