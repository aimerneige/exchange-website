const SHELL_CACHE = 'exchange-shell-__VERSION__';
const IMAGE_CACHE = 'exchange-character-images-v1';
const ASSETS = __ASSETS__;
const characterImages = new Set(__IMAGE_URLS__);
const scope = self.registration.scope;
const isCharacterImage = url => characterImages.has(url.href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(ASSETS.map(path => new URL(path, scope).href))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('exchange-shell-') && key !== SHELL_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function characterImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    try { await cache.put(request, response.clone()); }
    catch { /* 缓存空间不足时仍返回已下载图片，避免影响在线显示。 */ }
  }
  return response;
}

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_IMAGES' || !Array.isArray(event.data.urls)) return;
  event.waitUntil((async () => {
    for (const url of [...new Set(event.data.urls)].slice(0, characterImages.size)) {
      try {
        if (isCharacterImage(new URL(url))) await characterImage(new Request(url, { mode: 'no-cors', credentials: 'omit' }));
      } catch {
        // 外部图源可能暂不可用；缓存失败不阻止本地交换板使用。
      }
    }
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (isCharacterImage(url)) {
    event.respondWith(characterImage(event.request));
    return;
  }
  if (url.origin !== self.location.origin || !url.href.startsWith(scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // 应用壳内容固定；忽略静态服务器的 Vary: Origin，兼容模块脚本的跨源请求模式。
    const cached = await cache.match(event.request, { ignoreSearch: event.request.mode === 'navigate', ignoreVary: true });
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const shell = await cache.match(new URL('index.html', scope).href, { ignoreVary: true });
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
