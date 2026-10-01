import { useEffect, useRef, useState } from 'react';
import { setTheme } from 'mdui/functions/setTheme.js';
import type { Switch } from 'mdui/components/switch.js';
import { characterGroups, demoItems } from './data/characters';
import { loadItems, saveItems } from './lib/storage';
import type { TradeItem } from './types';
import Icon from './components/Icon';
import ItemCard from './components/ItemCard';
import ItemEditor from './components/ItemEditor';
import ItemImage from './components/ItemImage';
import Modal from './components/Modal';
import { IconButton } from './components/AccessibleControls';

function initialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('exchange-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* 隐私模式可能禁用偏好存储；主题仍可在当前页面切换。 */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const mutationLock = useRef(false);
  const [theme, updateTheme] = useState(initialTheme);
  const [display, setDisplay] = useState(false);
  const [groupFilter, setGroupFilter] = useState('all');
  const [hideTraded, setHideTraded] = useState(false);
  const [editor, setEditor] = useState<{ item?: TradeItem; type: TradeItem['type'] }>();
  const [previewId, setPreviewId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string>();
  const [guide, setGuide] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [serviceWorkerError, setServiceWorkerError] = useState(false);
  const switchRef = useRef<Switch>(null);
  const preview = items.find(item => item.id === previewId);
  const deleting = items.find(item => item.id === deleteId);

  useEffect(() => {
    let active = true;
    loadItems().then(stored => {
      if (!active) return;
      setItems(stored ?? demoItems);
      setDemo(stored === undefined);
      setStorageLoaded(true);
    }).catch(() => {
      if (active) setError('无法读取本地数据。请检查浏览器存储权限后刷新；原有数据不会被覆盖。 / Local storage unavailable.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setTheme(theme);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1b2320' : '#557c72');
    try { localStorage.setItem('exchange-theme', theme); }
    catch { /* 主题偏好保存失败不影响商品数据或当前主题。 */ }
  }, [theme]);

  useEffect(() => {
    const handler = () => setOnline(navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler); };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!('serviceWorker' in navigator)) { setServiceWorkerError(true); return; }
    let active = true;
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(() => navigator.serviceWorker.ready)
      .then(() => { if (active) setOfflineReady(true); })
      .catch(() => { if (active) setServiceWorkerError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const control = switchRef.current;
    if (!control) return;
    control.updateComplete.then(() => control.shadowRoot?.querySelector('input')?.setAttribute('aria-label', '隐藏已交换 / 交換済みを隠す / Hide traded'));
    const change = () => setHideTraded(control.checked);
    control.addEventListener('change', change);
    return () => control.removeEventListener('change', change);
  }, [display, loading]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function commit(next: TradeItem[]): Promise<boolean> {
    if (!storageLoaded) {
      setError('尚未成功读取本地数据，无法保存。请检查浏览器存储权限后刷新。 / Local data could not be loaded; saving is disabled.');
      return false;
    }
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    setError('');
    try {
      await saveItems(next);
      setItems(next);
      setDemo(false);
      setNotice('已保存在此设备 / この端末に保存 / Saved on this device');
      return true;
    } catch {
      setError('保存失败，修改尚未应用。请检查设备空间和浏览器存储权限后重试。 / 保存に失敗 / Could not save; please retry.');
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }

  async function saveItem(item: TradeItem) {
    const actualItems = demo ? [] : items;
    return commit(actualItems.some(current => current.id === item.id)
      ? actualItems.map(current => current.id === item.id ? item : current)
      : [...actualItems, item]);
  }

  function patchItem(id: string, patch: Partial<TradeItem>) {
    void commit(items.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function moveItem(item: TradeItem, direction: -1 | 1) {
    const sameType = items.filter(current => current.type === item.type);
    const target = sameType[sameType.findIndex(current => current.id === item.id) + direction];
    if (!target) return;
    const next = [...items];
    const a = next.findIndex(current => current.id === item.id);
    const b = next.findIndex(current => current.id === target.id);
    [next[a], next[b]] = [next[b], next[a]];
    void commit(next);
  }

  async function leaveDisplay() {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); }
      catch { setNotice('请使用浏览器退出全屏 / Exit fullscreen using your browser.'); }
    }
    setDisplay(false);
  }

  async function fullscreen() {
    if (!document.documentElement.requestFullscreen) {
      setNotice('当前浏览器不支持全屏，展示模式仍可使用 / Fullscreen is unavailable in this browser.'); return;
    }
    try { await document.documentElement.requestFullscreen(); }
    catch { setNotice('无法进入全屏，展示模式仍可使用 / Fullscreen unavailable.'); }
  }

  function addItem(type: TradeItem['type'] = 'have') { setEditor({ type }); }
  const count = (type: TradeItem['type']) => items.filter(item => item.type === type && item.status === 'available').reduce((sum, item) => sum + item.quantity, 0);

  return <div className={`app ${display ? 'display-mode' : ''}`}>
    <header className="app-header">
      <a href="./" className="brand" aria-label="交换小站首页"><span className="brand-icon"><Icon name="exchange" size={25} /></span><span>交换小站<small>EXCHANGE</small></span></a>
      {!display && <nav className="header-nav" aria-label="主导航"><button className={!guide ? 'active' : ''} onClick={() => setGuide(false)}>我的交换板<small>マイボード / My board</small></button><button className={guide ? 'active' : ''} onClick={() => setGuide(true)}>使用指南<small>使い方 / How to use</small></button></nav>}
      <div className="header-tools">
        <span className="save-state"><span className={`status-dot ${!online ? 'offline' : ''}`} />{loading ? '正在读取' : busy ? '正在保存' : !online ? '离线使用中' : demo ? '本地保存 · 无需登录' : '已保存至本机'}</span>
        {!display && <><IconButton aria-label={theme === 'light' ? '切换暗色主题' : '切换亮色主题'} title="亮色 / 暗色 · Light / Dark" onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></IconButton><a className="github-link" href="https://github.com/aimerneige/exchange-website" target="_blank" rel="noreferrer" aria-label="GitHub 代码仓库" title="GitHub 代码仓库"><Icon name="github" size={21} /></a></>}
        {display && <IconButton className="exit-display" aria-label="退出展示 / 編集に戻る / Exit display" onClick={() => void leaveDisplay()}><Icon name="edit" /></IconButton>}
      </div>
    </header>
    <main className="main-content">
      <div className="disclaimer"><Icon name="info" size={15} /><span>本站为非官方同好工具，与 LoveLive! 官方无关。<small>非公式ファンツール / Unofficial fan tool; not affiliated with LoveLive!</small></span></div>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span /> A LITTLE TRADE, A LITTLE JOY</div><h1 lang="ja">交換しませんか<span>？</span></h1><p className="hero-translation">要交换吗？ <span /> Would you like to trade?</p><p className="hero-description">让手中的小小周边，遇见刚好喜欢它的人。</p>
          {!display && <div className="hero-buttons"><mdui-button onClick={() => addItem()} disabled={loading || busy}><Icon name="plus" slot="icon" />添加商品 <span className="button-en">Add item</span></mdui-button><mdui-button variant="outlined" onClick={() => { setDisplay(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={loading}><Icon name="expand" slot="icon" />展示模式 <span className="button-en">Show board</span></mdui-button></div>}
          {display && <p className="display-point">指さしてください <span>请直接指出来 · Please point to the item 👇</span></p>}
        </div>
        {!display && <div className="hero-art" aria-hidden="true"><span className="art-star one">✦</span><span className="art-star two">✧</span><div className="art-card art-have"><span>譲 / HAVE</span><div className="art-sticker"><Icon name="bag" size={49} /></div><div className="art-card-line" /></div><div className="art-exchange"><Icon name="exchange" size={31} /></div><div className="art-card art-want"><span>求 / WANT</span><div className="art-sticker"><Icon name="heart" size={49} /></div><div className="art-card-line" /></div><span className="art-caption">好きが、つながる。</span></div>}
      </section>
      {error && <div className="error-banner" role="alert"><Icon name="info" /><span>{error}</span><IconButton aria-label="关闭错误提示" onClick={() => setError('')}><Icon name="close" size={18} /></IconButton></div>}
      {!display && <div className="board-toolbar"><div className="board-heading"><h2>我的交换板{demo && <span className="demo-tag">示例预览</span>}</h2><p>譲りたいもの、探しているもの。 <span>Your trade wishlist, at a glance.</span></p></div><div className="board-filters"><label className="filter-switch"><mdui-switch ref={switchRef} checked={hideTraded} aria-label="隐藏已交换" /><span>隐藏已交换<small>交換済みを隠す / Hide traded</small></span></label><label className="group-filter"><select aria-label="筛选团体" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}><option value="all">全部角色 / All</option>{characterGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}<option value="custom">其他 / Other</option></select><Icon name="down" size={15} /></label></div></div>}
      {demo && !display && <div className="demo-banner"><span><Icon name="image" size={16} />下面是示例商品。添加首件商品后，会自动替换示例。</span><mdui-button variant="text" disabled={busy || loading} onClick={() => { setGroupFilter('all'); void commit([]); }}>开始我的交换板<Icon name="arrow" slot="end-icon" size={17} /></mdui-button></div>}
      {display && <div className="display-toolbar"><span>{demo ? '示例 / サンプル / DEMO' : 'あなたと交換したいもの / My trade board'}</span><IconButton aria-label="全屏展示 / Fullscreen" onClick={() => void fullscreen()}><Icon name="expand" /></IconButton></div>}
      <div className="trade-board" aria-busy={loading}>
        {(['have', 'want'] as const).map(type => {
          const allInSection = items.filter(item => item.type === type);
          const visible = allInSection.filter(item => (groupFilter === 'all' || (groupFilter === 'custom' ? !item.groupId : item.groupId === groupFilter)) && (type === 'want' || !hideTraded || item.status !== 'traded'));
          return <section className={`board-section ${type}`} key={type} aria-label={type === 'have' ? '可换出 HAVE' : '想要 WANT'}>
            <div className="section-heading"><div className="section-title"><span className="section-symbol">{type === 'have' ? '譲' : '求'}</span><div><h2>{type === 'have' ? '可换出' : '想要'} <span>{type.toUpperCase()}</span><span className="section-count">{count(type)}</span></h2><p>{type === 'have' ? 'お譲りできます / Ready to trade' : '探しています / Looking for'}</p></div></div>{!display && <IconButton aria-label={type === 'have' ? '添加可换出商品' : '添加想要商品'} variant="tonal" disabled={loading || busy} onClick={() => addItem(type)}><Icon name="plus" size={19} /></IconButton>}</div>
            <div className="items-grid">
              {loading ? <div className="empty-state"><Icon name="exchange" size={34} /><h3>正在打开交换板…</h3></div> : visible.map(item => <ItemCard key={item.id} item={item} display={display} demo={demo} busy={busy} first={allInSection[0]?.id === item.id} last={allInSection.at(-1)?.id === item.id} onPreview={() => setPreviewId(item.id)} onEdit={() => setEditor({ item, type })} onTrade={() => patchItem(item.id, { quantity: Math.max(0, item.quantity - 1), status: item.quantity <= 1 ? 'traded' : 'available' })} onToggle={() => patchItem(item.id, { status: item.status === 'traded' ? 'available' : 'traded', quantity: item.status === 'traded' ? Math.max(1, item.quantity) : item.quantity })} onMove={direction => moveItem(item, direction)} onDelete={() => setDeleteId(item.id)} />)}
              {!loading && visible.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name={type === 'have' ? 'bag' : 'heart'} size={34} /></span><h3>{allInSection.length ? '暂时没有符合条件的商品' : type === 'have' ? '分享你的那份喜欢' : '许一个小小的心愿'}</h3><p>{type === 'have' ? '添加你愿意交换的周边' : '添加你正在寻找的周边'}<br /><small>{type === 'have' ? '譲りたいもの / Add something to trade' : '欲しいもの / Add your wishlist'}</small></p>{!display && <mdui-button variant="outlined" onClick={() => addItem(type)} disabled={busy}><Icon name="plus" slot="icon" />{type === 'have' ? '添加可换出 / Add HAVE' : '添加想要 / Add WANT'}</mdui-button>}</div>}
            </div>
            {!display && <div className="section-footnote"><Icon name={type === 'have' ? 'bag' : 'heart'} size={14} />{type === 'have' ? '把多一份的喜欢，送到对的人手里。' : '下一份心动，也许就在这里。'}</div>}
          </section>;
        })}
      </div>
      <div className="point-note"><span className="point-hand">☞</span><p><strong lang="ja">指さしてください</strong><span>请直接指出来 · Please point to the item</span></p><span className="point-thanks">ありがとうございます！<small>谢谢！ / Thank you!</small></span></div>
      {!display && <div className="local-note"><Icon name="shield" size={17} /><p>你的交换板，只属于你。<span>商品和上传图片仅保存在此浏览器，不会上传至服务器。<br className="mobile-break" /> この端末のみ / Stored on this device only.</span></p><span className="offline-status"><Icon name="wifi" size={15} />{serviceWorkerError ? '离线缓存不可用' : offlineReady ? '已支持离线使用' : import.meta.env.DEV ? '离线功能在构建版可用' : '正在准备离线使用'}</span></div>}
    </main>
    <footer className="app-footer"><span>交换小站 <span className="footer-dot">·</span> 让喜欢，遇见喜欢。</span><span>Made for fans, with <Icon name="heart" size={12} /><span className="footer-dot">·</span> 非商业同好工具</span></footer>
    {editor && <ItemEditor key={editor.item?.id ?? 'new'} {...editor} busy={busy} onClose={() => setEditor(undefined)} onSave={saveItem} />}
    {preview && <Modal title={preview.characterName} subtitle={preview.itemName || '周边 / グッズ / Merchandise'} onClose={() => setPreviewId(undefined)} className="preview-dialog"><button className={`preview-picture ${preview.status}`} onClick={() => setPreviewId(undefined)} aria-label="关闭大图 / Close image"><ItemImage item={preview} /></button><div className="preview-details"><span className={`preview-type ${preview.type}`}>{preview.type === 'have' ? '譲 / 可换出 / HAVE' : '求 / 想要 / WANT'}</span><strong>×{preview.quantity}</strong>{preview.status === 'traded' && <span className="preview-traded">交換済み / 已交换 / TRADED</span>}</div>{preview.note && <p className="preview-note">{preview.note}</p>}<p className="preview-hint">点击图片关闭 / タップして閉じる / Tap image to close</p>{!display && !demo && <div className="modal-actions"><mdui-button variant="tonal" onClick={() => { setEditor({ item: preview, type: preview.type }); setPreviewId(undefined); }}><Icon name="edit" slot="icon" />编辑商品 / Edit item</mdui-button></div>}</Modal>}
    {deleting && <Modal title="删除这件商品？" subtitle="商品を削除しますか？ / Delete this item?" onClose={() => setDeleteId(undefined)} className="delete-dialog"><p className="delete-description">{deleting.characterName} · {deleting.itemName}<br /><small>删除后无法恢复 / 削除は元に戻せません / This cannot be undone.</small></p><div className="modal-actions"><mdui-button variant="text" onClick={() => setDeleteId(undefined)}>取消 / Cancel</mdui-button><mdui-button className="danger-button" disabled={busy} onClick={async () => { if (await commit(items.filter(item => item.id !== deleting.id))) setDeleteId(undefined); }}>删除 / 削除 / Delete</mdui-button></div></Modal>}
    {guide && <Modal title="把喜欢，交换给彼此" subtitle="使い方 / A little guide to trading" onClose={() => setGuide(false)} className="guide-dialog"><div className="guide-steps">{[
      ['01', '添加你的商品', '上传实物照片，或选择默认角色图。填写名称和数量，放入可换出或想要。', '商品を追加 / Add your items'],
      ['02', '打开现场展示', '点「展示模式」，把手机或平板给对方看。点商品图片可以放大，现场指一指就懂。', '見せて、指さして / Show and point'],
      ['03', '记录这一份小小的快乐', '退出展示后，点「−」交换一件。数量为 0 时自动标记已交换，也可手动标记。', '交換したら更新 / Update after trading'],
    ].map(([n, title, text, subtitle]) => <div className="guide-step" key={n}><span>{n}</span><div><h3>{title}</h3><small>{subtitle}</small><p>{text}</p></div></div>)}</div><div className="guide-storage"><Icon name="shield" /><div><strong>数据仅在此浏览器保存 / この端末のみ / Device only</strong><p>清除网站数据、使用隐私模式或换设备可能丢失交换板。首次联网打开构建版并完成缓存后，可离线使用，全部默认角色图也可离线查看。可以通过浏览器「添加到主屏幕」安装。</p></div></div><div className="guide-storage"><Icon name="info" /><div><strong>非官方 · 非商业 / Unofficial · Noncommercial</strong><p>本站与 LoveLive! 官方无关。角色图片来源于 LoveLive! 官方网站，权利属于各自权利人。默认图仅代表角色，建议上传实物照片说明实际交换商品。</p></div></div><div className="modal-actions"><mdui-button onClick={() => setGuide(false)}>知道了 / わかりました / Got it</mdui-button></div></Modal>}
    {notice && <div className="toast" role="status"><Icon name="check" size={17} />{notice}</div>}
  </div>;
}
