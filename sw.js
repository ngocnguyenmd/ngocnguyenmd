self.addEventListener('fetch', e => {
  if (e.request.url.includes('graph.nhaccuatui.com')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const h = new Headers(r.headers);
        h.set('Access-Control-Allow-Origin', '*');
        return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
      }).catch(() => new Response('{"error":"fail"}', { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }))
    );
  }
});
