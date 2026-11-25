// Service worker de ATHLY: la app abre al instante desde la copia guardada en el celular
// (funciona sin señal o con la red inestable) y se actualiza en segundo plano.
const CACHE = 'athly-v2';
const SCOPE = new URL('./', self.registration.scope).href;
const INDEX = SCOPE; // la página principal se guarda con la URL del alcance

async function cachePut(req, res) {
  const c = await caches.open(CACHE);
  await c.put(req, res);
}

/** Descarga la página nueva y TODOS sus archivos antes de reemplazar la copia guardada,
    para que nunca quede una página nueva apuntando a archivos que no están en el celular. */
async function refreshShell() {
  const res = await fetch(INDEX, { cache: 'no-store' });
  if (!res.ok) return;
  const html = await res.clone().text();
  const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => new URL(m[1], INDEX).href)
    .filter((u) => u.startsWith(SCOPE));
  const c = await caches.open(CACHE);
  await Promise.all(assets.map(async (u) => { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok) await c.put(u, r); } }));
  await c.put(INDEX, res);
}

self.addEventListener('install', (e) => {
  e.waitUntil(refreshShell().catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Abrir la app: primero la copia guardada; en segundo plano, buscar la versión nueva
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cached = await caches.match(INDEX);
      if (cached) {
        e.waitUntil(refreshShell().catch(() => {}));
        return cached;
      }
      try {
        const res = await fetch(req);
        if (res.ok) e.waitUntil(refreshShell().catch(() => {}));
        return res;
      } catch {
        return new Response('<p style="font-family:sans-serif;padding:24px">Sin conexión. Abre ATHLY una vez con internet para guardarla en tu celular.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // Archivos (código, estilos, íconos, fuentes): copia guardada primero, red como respaldo
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') e.waitUntil(cachePut(req, res.clone()));
      return res;
    } catch {
      return new Response('', { status: 504 });
    }
  })());
});
