const params = new URLSearchParams(location.search);
const slug = params.get('slug');
let srcCode = params.get('source') || 'bx';
const srcMap = { ax: 'Ophim', bx: 'Phimapi', cx: 'Nguonc' };
let srcName = srcMap[srcCode] || 'Phimapi';

const API = {
  Ophim: `https://ophim1.com/v1/api/phim/${slug}`,
  Phimapi: `https://phimapi.com/phim/${slug}`,
  Nguonc: `https://phim.nguonc.com/api/film/${slug}`
};

const playerArea = document.getElementById('player-area');
const videoEl = document.getElementById('hls-video');
const embedFrame = document.getElementById('embed-frame');
const loading = playerArea.querySelector('.loading-overlay');
const errorMsg = document.getElementById('error-msg');
const titleBar = document.getElementById('title-bar');
const popup = document.getElementById('popup-confirm');
const popupYes = popup.querySelector('.popup-yes');
const popupNo = popup.querySelector('.popup-no');
const toastEl = document.getElementById('toast');
const bgBlur = document.getElementById('bg');
const plotText = document.getElementById('plot-text');
const sourceModeBar = document.getElementById('source-mode-bar');

let hls = null;
let servers = [], episodes = [], curSrv = 0, curEp = 0;
let movie = '', poster = '', cdn = '', plot = '';
let mode = 'm3u8';
let warned = false;
let timeUpdateHandler = null;
let popupTimeout = null;

function showToast(m) {
  toastEl.textContent = m;
  toastEl.classList.add('show');
  clearTimeout(toastEl.timeout);
  toastEl.timeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function showEndPopup() {
  if (warned || curEp >= episodes.length - 1) return;
  warned = true;
  popup.classList.add('show');
  clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    if (warned) { popup.classList.remove('show'); warned = false; }
  }, 8000);
}

popupYes.onclick = () => { 
  clearTimeout(popupTimeout); 
  popup.classList.remove('show'); 
  warned = false; 
  nextEp(); 
};

popupNo.onclick = () => { 
  clearTimeout(popupTimeout); 
  popup.classList.remove('show'); 
  warned = true; 
};

function epFromUrl() { 
  const e = params.get('e'); 
  return e ? Math.max(0, parseInt(e) - 1) : 0; 
}

function updateUrl(ep) {
  curEp = ep;
  srcCode = Object.entries(srcMap).find(([k, v]) => v === srcName)?.[0] || 'bx';
  history.replaceState(null, '', `?slug=${slug}&source=${srcCode}&e=${ep + 1}`);
}

function getPoster(m) {
  let u = m.poster_url || m.thumb_url || m.poster || '';
  if (srcName === 'Ophim' && u && !u.includes('/uploads/movies/')) {
    const n = u.split('/').pop().replace(/-poster\.jpg|-thumb\.jpg/g, '');
    u = `${cdn || 'https://img.ophim.live'}/uploads/movies/${n}-thumb.jpg`;
  }
  return u.includes('http') ? u : null;
}

const movieCache = new Map();

async function loadMovie() {
  if (movieCache.has(srcName)) {
    const cached = movieCache.get(srcName);
    movie = cached.movie; 
    poster = cached.poster; 
    plot = cached.plot; 
    servers = cached.servers;
    plotText.innerHTML = plot.replace(/\n/g, '<br>');
    if (poster) loadPoster(poster);
    renderServerBar();
    renderSourceModeBar();
    return true;
  }

  try {
    const r = await fetch(API[srcName], { cache: 'force-cache' });
    if (!r.ok) throw new Error('API lỗi');
    const d = await r.json();

    let m = {}, epsList = [];
    if (srcName === 'Nguonc') { 
      m = d.movie; 
      epsList = m.episodes || []; 
    }
    else if (srcName === 'Phimapi') { 
      m = d.movie; 
      epsList = d.episodes || []; 
    }
    else { 
      m = d.data.item; 
      epsList = m.episodes || []; 
      cdn = d.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live'; 
    }

    movie = m.name || m.title || 'Không rõ';
    poster = getPoster(m);
    plot = m.content || m.description || m.plot || 'Chưa có cốt truyện.';

    plotText.innerHTML = plot.replace(/\n/g, '<br>');
    if (poster) loadPoster(poster);

    servers = epsList.map(g => ({
      name: g.server_name || `Server ${servers.length + 1}`,
      data: (g.server_data || g.items || []).map(ep => ({
        name: ep.name || `Tập ${ep.slug?.split('-').pop() || ''}`,
        link_m3u8: srcName === 'Nguonc' ? '' : (ep.link_m3u8 || ep.m3u8 || ''),
        link_embed: ep.link_embed || ep.embed || ''
      })).filter(ep => ep.link_embed || (srcName !== 'Nguonc' && ep.link_m3u8))
    })).filter(s => s.data.length > 0);

    if (servers.length === 0) {
      errorMsg.textContent = 'Không có tập nào';
      errorMsg.style.display = 'flex';
      loading.style.display = 'none';
      return false;
    }

    movieCache.set(srcName, { movie, poster, plot, servers });
    renderServerBar();
    renderSourceModeBar();
    return true;
  } catch (e) {
    console.error(e);
    errorMsg.textContent = 'Lỗi tải phim';
    errorMsg.style.display = 'flex';
    loading.style.display = 'none';
    return false;
  }
}

function loadPoster(url) {
  const img = new Image();
  img.onload = () => {
    bgBlur.style.backgroundImage = `url(${url})`;
    bgBlur.classList.add('loaded');
    document.querySelector('.overlay')?.style.display = 'block';
  };
  img.onerror = () => { bgBlur.style.display = 'none'; };
  img.src = url;
}

function renderSourceModeBar() {
  sourceModeBar.innerHTML = '';
  const sourceDiv = document.createElement('div');
  sourceDiv.className = 'source-btn';
  sourceDiv.innerHTML = `
    <button class="btn active" id="current-source">${srcCode.toUpperCase()}</button>
    <div class="dropdown">
      <button onclick="changeSource('ax')">AX</button>
      <button onclick="changeSource('bx')">BX</button>
      <button onclick="changeSource('cx')">CX</button>
    </div>
  `;
  sourceModeBar.appendChild(sourceDiv);

  const hasM3u8 = episodes.some(e => e.link_m3u8?.trim());
  const hasEmbed = episodes.some(e => e.link_embed?.trim());

  if (srcName === 'Nguonc') {
    mode = 'embed';
    if (hasEmbed) {
      const b = document.createElement('button');
      b.className = 'btn active';
      b.textContent = 'Embed';
      b.onclick = () => showToast('Nguồn C chỉ hỗ trợ Embed');
      sourceModeBar.appendChild(b);
    }
  } else {
    if (hasM3u8) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'M3U8';
      if (mode === 'm3u8') b.classList.add('active');
      b.onclick = () => { mode = 'm3u8'; play(curEp); };
      sourceModeBar.appendChild(b);
    }
    if (hasEmbed) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'Embed';
      if (mode === 'embed') b.classList.add('active');
      b.onclick = () => { mode = 'embed'; play(curEp); };
      sourceModeBar.appendChild(b);
    }
  }
}

function renderServerBar() {
  const bar = document.getElementById('server-select');
  bar.innerHTML = '';
  servers.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = `${s.name} (${s.data.length})`;
    if (i === curSrv) b.classList.add('active');
    b.onclick = () => switchServer(i);
    bar.appendChild(b);
  });
}

function renderGrid() {
  const g = document.getElementById('ep-grid');
  g.innerHTML = '';
  episodes.forEach((_, i) => {
    const b = document.createElement('div');
    b.className = 'ep-btn';
    b.textContent = i + 1;
    if (i === curEp) b.classList.add('active');
    b.onclick = () => play(i);
    g.appendChild(b);
  });
}

function markEp(i) {
  document.querySelectorAll('.ep-btn').forEach((b, k) => b.classList.toggle('active', k === i));
}

function resetPlayer() {
  if (hls) { hls.destroy(); hls = null; }
  if (timeUpdateHandler) {
    videoEl.removeEventListener('timeupdate', timeUpdateHandler);
    timeUpdateHandler = null;
  }
  videoEl.pause();
  videoEl.src = '';
  videoEl.style.display = 'none';
  embedFrame.src = '';
  embedFrame.style.display = 'none';
  
  // Xóa sạch track (phòng trường hợp cũ còn sót)
  while (videoEl.firstChild) {
    videoEl.removeChild(videoEl.firstChild);
  }
  
  loading.style.display = 'flex';
  errorMsg.style.display = 'none';
  warned = false;
  clearTimeout(popupTimeout);
  
  delete videoEl._skipIntroDone;
  delete videoEl._skipMidDone;
}

function playEmbed(url) {
  resetPlayer();
  embedFrame.src = url;
  embedFrame.style.display = 'block';
  embedFrame.onload = () => loading.style.display = 'none';
}

function playHLS(m3u8) {
  resetPlayer();
  videoEl.style.display = 'block';

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      autoStartLoad: true,
      startLevel: -1,
      maxBufferLength: 10,
      maxMaxBufferLength: 12,
      maxBufferSize: 50 * 1000 * 1000,
      maxBufferHole: 0.5,
      capLevelToPlayerSize: true,
      xhrSetup: xhr => { xhr.withCredentials = false; }
    });
    
    hls.loadSource(m3u8);
    hls.attachMedia(videoEl);
    
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => {});
    });
    
    hls.on(Hls.Events.ERROR, (e, d) => {
      if (d.fatal) showToast('Lỗi HLS - thử đổi server hoặc chế độ');
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = m3u8;
    videoEl.addEventListener('loadedmetadata', () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => {});
    });
  } else {
    showToast('Trình duyệt không hỗ trợ HLS');
    loading.style.display = 'none';
    return;
  }

  videoEl._skipIntroDone = false;
  videoEl._skipMidDone = false;

  timeUpdateHandler = () => {
    const t = videoEl.currentTime;
    const d = videoEl.duration;
    if (!d || isNaN(d) || videoEl.seeking) return;

    const wasPlaying = !videoEl.paused;

    // Tùy chọn: tua bỏ opening (20s đầu) - có thể xóa nếu không cần
    if (!videoEl._skipIntroDone && t < 25 && d > 60) {
      videoEl.currentTime = 20;
      showToast('Bỏ 20s đầu');
      videoEl._skipIntroDone = true;
      if (wasPlaying) videoEl.play().catch(() => {});
    }

    // Tua +50s khi đến khoảng 15:00 (chỉ 1 lần)
    if (!videoEl._skipMidDone && t >= 890 && t < 920) {  // 14:50 ~ 15:20
      const target = 950; // 15:00 + 50s
      if (target < d) {
        videoEl.currentTime = target;
        showToast('Tự động bỏ qua +50s');
        videoEl._skipMidDone = true;
        if (wasPlaying) videoEl.play().catch(() => {});
      }
    }

    // Popup cảnh báo tập mới
    if (!warned && d && t >= d - 120 && curEp < episodes.length - 1) {
      showEndPopup();
    }
  };

  videoEl.addEventListener('timeupdate', timeUpdateHandler);

  videoEl.addEventListener('ended', () => {
    if (curEp < episodes.length - 1 && !warned) nextEp();
  });
}

function play(i) {
  if (i < 0 || i >= episodes.length) return;
  curEp = i;
  markEp(i);
  updateUrl(i);
  titleBar.textContent = `${movie} | Tập ${i + 1}`;

  const ep = episodes[i];
  const m3u8 = ep.link_m3u8?.trim();
  const embed = ep.link_embed?.trim();

  if (!m3u8 && !embed) {
    errorMsg.textContent = 'Không có link phát';
    errorMsg.style.display = 'flex';
    loading.style.display = 'none';
    return;
  }

  if (srcName === 'Nguonc') {
    if (embed) playEmbed(embed);
    else {
      errorMsg.textContent = 'Nguồn C chỉ hỗ trợ Embed';
      errorMsg.style.display = 'flex';
      loading.style.display = 'none';
    }
  } else {
    if (mode === 'embed' && embed) playEmbed(embed);
    else if (mode === 'm3u8' && m3u8) playHLS(m3u8);
    else if (embed) playEmbed(embed);
    else if (m3u8) playHLS(m3u8);
    else {
      errorMsg.textContent = 'Lỗi nguồn phát';
      errorMsg.style.display = 'flex';
      loading.style.display = 'none';
    }
  }
}

function switchServer(i) {
  if (i < 0 || i >= servers.length) return;
  curSrv = i;
  episodes = servers[i].data;
  renderGrid();
  renderSourceModeBar();
  document.querySelectorAll('#server-select .btn').forEach((b, k) => 
    b.classList.toggle('active', k === i)
  );
  curEp = Math.min(curEp, episodes.length - 1);
  play(curEp);
}

function prevEp() { 
  if (curEp > 0) play(curEp - 1); 
  else showToast('Đang ở tập đầu'); 
}

function nextEp() { 
  if (curEp < episodes.length - 1) play(curEp + 1); 
  else showToast('Hết tập'); 
}

window.changeSource = async function(code) {
  if (code === srcCode) return;
  srcCode = code;
  srcName = srcMap[code];
  resetPlayer();
  loading.style.display = 'flex';
  if (await loadMovie()) {
    curSrv = 0;
    switchServer(0);
    updateUrl(curEp);
  }
};

async function init() {
  if (!slug) {
    errorMsg.textContent = 'Thiếu thông tin phim';
    errorMsg.style.display = 'flex';
    return;
  }
  curEp = epFromUrl();
  loading.style.display = 'flex';
  if (await loadMovie() && servers.length > 0) {
    switchServer(0);
  }
}

init();
