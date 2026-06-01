/* 住宅ローン金利ナビ - Service Worker
 * - ナビゲーション: ネットワーク優先 → 失敗時はキャッシュ（オフライン対応）
 * - 静的アセット: キャッシュ優先 → なければ取得してキャッシュ
 * APP_SHELL のハードコードはしない（basePath が環境によって異なるため、
 * 訪問したページ・アセットを随時キャッシュする方式）
 */
const CACHE = 'kinri-navi-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // ページ遷移はネットワーク優先
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r ?? fetch(request))
        )
    );
    return;
  }

  // 静的アセットはキャッシュ優先
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
