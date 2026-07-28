// sw.js — CORS Proxy Service Worker
// Chỉ 15 dòng, không cần cài gì
self.addEventListener('fetch', e => {
  if (e.request.url.includes('graph.nhaccuatui.com')) {
    e.respondWith(
      fetch(e.request, {
        headers: { 'Referer': 'https://www.nhaccuatui.com/' }
      }).then(r => {
        const h = new Headers(r.headers);
        h.set('Access-Control-Allow-Origin', '*');
        return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
      }).catch(() => new Response('{"error":"proxy fail"}', { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }))
    );
  }
});