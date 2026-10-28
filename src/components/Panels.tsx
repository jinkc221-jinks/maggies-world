import { useState } from "react";
import { useWorldStore } from "../store";

type Wish = { id: string; text: string; at: number };
const WISH_KEY = "maggies-wishes";

export function Panels() {
  const panel = useWorldStore((state) => state.panel);
  const setPanel = useWorldStore((state) => state.setPanel);
  if (!panel) return null;
  return (
    <div className="room-backdrop" onClick={() => setPanel(null)}>
      <section className="room" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        {panel === "story" && <Story onClose={() => setPanel(null)} />}
        {panel === "wish" && <WishDesk onClose={() => setPanel(null)} />}
        {panel === "album" && <Album onClose={() => setPanel(null)} />}
      </section>
    </div>
  );
}

function Story({ onClose }: { onClose: () => void }) {
  const pages = [
    "Maggie 把五座小屋建在同一片草地上。门都开着，想进去就走进去。",
    "花园柜子里的种子要亲手拿出来。走到门外的田里放下，再回去取水壶。",
    "照相馆外面有一台三脚架。先看相机上的小屏幕，满意了再按快门。",
    "愿望信只写给自己，存在这台浏览器里。歌则交给右下角的播放器。",
  ];
  const [page, setPage] = useState(0);
  return (
    <>
      <header className="room-header">
        <div className="room-title"><span>⌂</span><div><p>MAGGIE'S HOME</p><h2>小屋故事</h2></div></div>
        <button className="close-button" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="room-body home-app">
        <div className="scrapbook-art"><span>♡</span><i>A SOFT VILLAGE</i></div>
        <div className="scrapbook-copy">
          <h3>第 {page + 1} 页</h3>
          <p>{pages[page]}</p>
          <div className="pager">
            <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))}>上一页</button>
            <div>{pages.map((_, index) => <i key={index} className={index === page ? "active" : ""} />)}</div>
            <button type="button" onClick={() => setPage((value) => Math.min(pages.length - 1, value + 1))}>下一页</button>
          </div>
        </div>
      </div>
    </>
  );
}

function WishDesk({ onClose }: { onClose: () => void }) {
  const [wishes, setWishes] = useState<Wish[]>(() => readWishes());
  const [text, setText] = useState("");
  const save = () => {
    const next = text.trim();
    if (!next) return;
    const updated = [{ id: `${Date.now()}`, text: next, at: Date.now() }, ...wishes].slice(0, 30);
    localStorage.setItem(WISH_KEY, JSON.stringify(updated));
    setWishes(updated);
    setText("");
  };
  const remove = (id: string) => {
    const updated = wishes.filter((wish) => wish.id !== id);
    localStorage.setItem(WISH_KEY, JSON.stringify(updated));
    setWishes(updated);
  };
  return (
    <>
      <header className="room-header">
        <div className="room-title"><span>✉</span><div><p>FOR FUTURE ME</p><h2>写给自己的信</h2></div></div>
        <button className="close-button" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="room-body post-app">
        <div className="letter-editor">
          <textarea value={text} maxLength={280} placeholder="亲爱的自己，今天想记住的事是……" onChange={(event) => setText(event.target.value)} />
          <div><small>{text.length} / 280</small><button className="stamp-button" type="button" onClick={save}>盖邮戳保存</button></div>
        </div>
        <div className="mailbox">
          <h3>信箱 <span>{wishes.length}</span></h3>
          <div className="wish-list">
            {wishes.length === 0 && <p>还没有信。写下一句，它会留在这台浏览器里。</p>}
            {wishes.map((wish) => (
              <article key={wish.id}>
                <small>{new Date(wish.at).toLocaleString()}</small>
                <p>{wish.text}</p>
                <button type="button" onClick={() => remove(wish.id)}>收起这封</button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Album({ onClose }: { onClose: () => void }) {
  const photos = useWorldStore((state) => state.photos);
  return (
    <>
      <header className="room-header">
        <div className="room-title"><span>▣</span><div><p>PHOTO WALL</p><h2>照片墙</h2></div></div>
        <button className="close-button" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="room-body">
        {photos.length === 0 && <p className="app-note">墙上还空着。走到三脚架前，看小屏幕里的画面，再按 E 拍照。</p>}
        <div className="album-grid">
          {photos.map((photo, index) => <img key={`${index}-${photo.slice(-24)}`} src={photo} alt={`村庄照片 ${index + 1}`} />)}
        </div>
      </div>
    </>
  );
}

function readWishes(): Wish[] {
  try {
    const raw = localStorage.getItem(WISH_KEY);
    const parsed = raw ? JSON.parse(raw) as Wish[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
