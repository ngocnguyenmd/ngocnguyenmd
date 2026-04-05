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
const serverBar = document.getElementById('server-select');

let hls = null;
let servers = [], episodes = [], curSrv = 0, curEp = 0;
let movie = '', poster = '', cdn = '', plot = '';
let warned = false;
let popupTimeout = null;
let currentPlayMode = 'so1';
let hlsRetryCount = 0; 

// ================= QUẢN LÝ PROXY GỌN GỌN =================
let proxyList = [];
let isProxyMode = false;
let activeProxyUrl = '';

async function loadProxyConfig() {
  try {
    const r = await fetch('./proxy.txt?t=' + Date.now());
    if (r.ok) {
      const txt = await r.text();
      proxyList = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('http')).map(ip => ip.replace(/\/+$/, ''));
    }
  } catch (e) {}
}

// Hàm gọi khi bấm nút "Lưu" ở khung nhập thủ công
window.applyCustomProxy = function() {
  const input = document.getElementById('custom-proxy-input');
  if (!input) return;
  let val = input.value.trim();
  
  if (!val) {
    // Nếu xóa trắng -> Quay lại server thường
    isProxyMode = false;
    activeProxyUrl = '';
    renderServerBar();
    play(curEp);
    showToast('Đã bỏ Proxy thủ công');
    return;
  }
  
  if (!val.startsWith('http')) val = 'http://' + val;
  val = val.replace(/\/+$/, '');
  
  isProxyMode = true;
  activeProxyUrl = val;
  hlsRetryCount = 0;
  renderServerBar();
  play(curEp);
  showToast('Đã áp dụng Proxy thủ công');
};

function showToast(m) {
  toastEl.textContent = m;
  toastEl.classList.add('show');
  clearTimeout(toastEl.timeout);
  toastEl.timeout = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

function showEndPopup() {
  if (warned || curEp >= episodes.length - 1) return;
  warned = true;
  popup.classList.add('show');
  clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => { if (warned) { popup.classList.remove('show'); warned = false; } }, 8000);
}

popupYes.onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = false; nextEp(); };
popupNo.onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = true; };

function epFromUrl() { const e = params.get('e'); return e ? Math.max(0, parseInt(e) - 1) : 0; }
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
    movie = cached.movie; poster = cached.poster; plot = cached.plot; servers = cached.servers;
    plotText.innerHTML = plot.replace(/\n/g, '<br>');
    if (poster) loadPoster(poster);
    renderServerBar();
    return true;
  }

  try {
    const r = await fetch(API[srcName], { cache: 'force-cache' });
    if (!r.ok) throw new Error('API lỗi');
    const d = await r.json();

    let m = {}, epsList = [];
    if (srcName === 'Nguonc') { m = d.movie; epsList = m.episodes || []; }
    else if (srcName === 'Phimapi') { m = d.movie; epsList = d.episodes || []; }
    else { m = d.data.item; epsList = m.episodes || []; cdn = d.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live'; }

    movie = m.name || m.title || 'Không rõ';
    poster = getPoster(m);
    plot = m.content || m.description || m.plot || 'Chưa có cốt truyện.';

    plotText.innerHTML = plot.replace(/\n/g, '<br>');
    if (poster) loadPoster(poster);

    servers = epsList.map(g => ({
      name: g.server_name || `SV ${servers.length + 1}`,
      data: (g.server_data || g.items || []).map(ep => ({
        name: ep.name || `Tập ${ep.slug?.split('-').pop() || ''}`,
        link_so1: srcName === 'Nguonc' ? '' : (ep.link_m3u8 || ep.m3u8 || ''),
        link_so2: ep.link_embed || ep.embed || ''
      })).filter(ep => ep.link_so1 || ep.link_so2)
    })).filter(s => s.data.length > 0);

    if (servers.length === 0) {
      errorMsg.textContent = 'Không có tập nào';
      errorMsg.style.display = 'flex';
      loading.style.display = 'none';
      return false;
    }

    movieCache.set(srcName, { movie, poster, plot, servers });
    renderServerBar();
    return true;
  } catch (e) {
    errorMsg.textContent = 'Lỗi tải dữ liệu';
    errorMsg.style.display = 'flex';
    loading.style.display = 'none';
    return false;
  }
}

function loadPoster(url) {
  const img = new Image();
  img.onload = () => { bgBlur.style.backgroundImage = `url(${url})`; bgBlur.classList.add('loaded'); document.querySelector('.overlay').style.display = 'block'; };
  img.onerror = () => { bgBlur.style.display = 'none'; };
  img.src = url;
}

// ================= THANH CHỌN CHẾ ĐỘ (MƯỢT 1, MƯỢT 2) =================
function renderSourceModeBar() {
  sourceModeBar.innerHTML = '';
  const hasSo1 = episodes.some(e => e.link_so1?.trim());
  const hasSo2 = episodes.some(e => e.link_so2?.trim());

  if (hasSo1) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Mượt 1';
    if (currentPlayMode === 'so1') btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so1'; play(curEp); renderSourceModeBar(); };
    sourceModeBar.appendChild(btn);
  }

  if (hasSo2) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Mượt 2';
    if (currentPlayMode === 'so2') btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so2'; play(curEp); renderSourceModeBar(); };
    sourceModeBar.appendChild(btn);
  }
}

// ================= THANH CHỌN SERVER (GỘP PROXY VÀO ĐÂY) =================
function renderServerBar() {
  serverBar.innerHTML = '';

  // 1. Server Thường
  servers.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = s.name;
    if (i === curSrv && !isProxyMode) b.classList.add('active');
    b.onclick = () => { isProxyMode = false; switchServer(i); };
    serverBar.appendChild(b);
  });

  // 2. Proxy từ file txt
  proxyList.forEach((ip, i) => {
    const shortIp = ip.replace('http://', '').substring(0, 15);
    const b = document.createElement('button');
    b.className = 'btn';
    // Nếu đang dùng Proxy này thì đổi màu Xanh lá
    b.style.background = (isProxyMode && activeProxyUrl === ip) ? '#27ae60' : '#444';
    b.textContent = `Proxy ${i + 1}`;
    if (isProxyMode && activeProxyUrl === ip) b.classList.add('active');
    b.onclick = () => {
      isProxyMode = true;
      activeProxyUrl = ip;
      hlsRetryCount = 0;
      renderServerBar();
      play(curEp);
      showToast(`Đang dùng Proxy ${i + 1}`);
    };
    serverBar.appendChild(b);
  });

  // 3. Khung Nhập Thủ Công
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;gap:4px;flex:1;min-width:0;';
  wrapper.innerHTML = `
    <input type="text" id="custom-proxy-input" placeholder="Nhập IP:Port..." value="${isProxyMode && !proxyList.includes(activeProxyUrl) ? activeProxyUrl.replace('http://', '') : ''}" style="flex:1;min-width:0;height:32px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:0 8px;border-radius:4px;font-size:12px;outline:none;">
    <button class="btn" onclick="applyCustomProxy()" style="height:32px;padding:0 10px;font-size:12px;white-space:nowrap;">Lưu</button>
  `;
  serverBar.appendChild(wrapper);
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
  videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'none';
  embedFrame.src = ''; embedFrame.style.display = 'none';
  loading.style.display = 'flex';
  errorMsg.style.display = 'none';
  warned = false;
  clearTimeout(popupTimeout);
}

// ================= CORE HLS (SỬA RÈ ÂM, KHÔNG CỐ KHÔI PHỤC) =================
function initHls(m3u8) {
  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 15, maxMaxBufferLength: 30, maxBufferSize: 25 * 1000 * 1000, maxBufferHole: 1.5,
      capLevelToPlayerSize: true, startLevel: -1,
      abrEwmaDefaultEstimate: 800000, abrBandWidthFactor: 0.85, abrBandWidthUpFactor: 0.7,
      manifestLoadingTimeOut: 15000, manifestLoadingMaxRetry: 3,
      levelLoadingTimeOut: 15000, levelLoadingMaxRetry: 3,
      fragLoadingTimeOut: 20000, fragLoadingMaxRetry: 4,
      enableSoftwareAES: true, progressive: false, maxAudioFramesDrift: 15,
      
      // CHỈ THÊM IP NẾU BẬT PROXY
      xhrSetup: (xhr, url) => {
        let finalUrl = url;
        if (isProxyMode && activeProxyUrl) {
          finalUrl = `${activeProxyUrl}/${url}`;
        }
        xhr.open('GET', finalUrl, true);
        xhr.withCredentials = false;
        xhr.timeout = isProxyMode ? 25000 : 20000;
      }
    });
    
    hls.loadSource(m3u8);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => showToast('Bấm play để phát'));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && hlsRetryCount < 2) {
          hlsRetryCount++;
          showToast(`Mất kết nối, thử lại (${hlsRetryCount}/2)...`);
          hls.startLoad();
        } else {
          // Bỏ hoàn toàn recoverMediaError() tránh rè âm thanh
          hls.destroy(); hls = null;
          errorMsg.textContent = 'Lỗi phát. Hãy đổi Server hoặc Proxy.';
          errorMsg.style.display = 'flex';
          loading.style.display = 'none';
        }
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = m3u8;
    videoEl.addEventListener('loadedmetadata', () => { loading.style.display = 'none'; videoEl.play().catch(() => {}); });
  } else {
    showToast('Trình duyệt quá cũ'); loading.style.display = 'none';
  }
  addAutoSkipLogic();
}

function playSo1(m3u8) {
  resetPlayer();
  hlsRetryCount = 0;
  videoEl.style.display = 'block';
  initHls(m3u8);
}

function playSo2(embedUrl) {
  resetPlayer();
  embedFrame.src = embedUrl;
  embedFrame.style.display = 'block';
  embedFrame.onload = () => loading.style.display = 'none';
}

function addAutoSkipLogic() {
  videoEl._hasSkippedMid = false;
  const timeUpdate = () => {
    const t = videoEl.currentTime, d = videoEl.duration;
    if (!d || isNaN(d) || videoEl.seeking) return;
    if (!videoEl._hasSkippedMid && t >= 900 && t < 915) {
      if (938 < d) { videoEl.currentTime = 938; showToast('Bỏ 38s'); videoEl._hasSkippedMid = true; }
    }
    if (!warned && d && t >= d - 120 && curEp < episodes.length - 1) showEndPopup();
  };
  videoEl.addEventListener('timeupdate', timeUpdate);
  videoEl.addEventListener('ended', () => { if (curEp < episodes.length - 1 && !warned) nextEp(); });
}

function seek(s) {
  if (videoEl.style.display === 'none' || isNaN(videoEl.duration)) { showToast('Không thể tua'); return; }
  videoEl.currentTime = Math.max(0, Math.min(videoEl.currentTime + s, videoEl.duration));
  showToast(s > 0 ? `+${s}s` : `${s}s`);
}

function play(i) {
  if (i < 0 || i >= episodes.length) return;
  curEp = i; markEp(i); updateUrl(i);
  titleBar.textContent = `${movie} | Tập ${i + 1}`;
  const ep = episodes[i];
  const link_so1 = ep.link_so1?.trim();
  const link_so2 = ep.link_so2?.trim();
  resetPlayer();

  if (currentPlayMode === 'so1' && link_so1) playSo1(link_so1);
  else if (currentPlayMode === 'so2' && link_so2) playSo2(link_so2);
  else if (link_so1) playSo1(link_so1);
  else if (link_so2) playSo2(link_so2);
  else { errorMsg.textContent = 'Không có link'; errorMsg.style.display = 'flex'; loading.style.display = 'none'; }
}

function switchServer(i) {
  if (i < 0 || i >= servers.length) return;
  curSrv = i;
  episodes = servers[i].data;
  renderGrid();
  renderServerBar();
  curEp = Math.min(curEp, episodes.length - 1);
  play(curEp);
}

function prevEp() { if (curEp > 0) play(curEp - 1); else showToast('Đang ở tập đầu'); }
function nextEp() { if (curEp < episodes.length - 1) play(curEp + 1); else showToast('Hết tập'); }

window.changeSource = async function(code) {
  if (code === srcCode) return;
  srcCode = code; srcName = srcMap[code];
  resetPlayer(); loading.style.display = 'flex'; movieCache.delete(srcName);
  if (await loadMovie()) { curSrv = 0; switchServer(0); updateUrl(curEp); }
};

async function init() {
  if (!slug) { errorMsg.textContent = 'Thiếu thông tin phim'; errorMsg.style.display = 'flex'; return; }
  loading.style.display = 'flex';
  await loadProxyConfig();
  if (await loadMovie() && servers.length > 0) switchServer(0);
}

init();
