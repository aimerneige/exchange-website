const SHELL_CACHE = 'exchange-shell-__VERSION__';
const ASSETS = __ASSETS__;
const scope = self.registration.scope;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(ASSETS.map(path => new URL(path, scope).href))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key =>
      (key.startsWith('exchange-shell-') && key !== SHELL_CACHE) || key === 'exchange-character-images-v1',
    ).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
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
