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
let warned = false;
let popupTimeout = null;
let currentPlayMode = 'so1';
let hlsRetryCount = 0; // Biến đếm lỗi mạng để chống load vô hạn

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
  popupTimeout = setTimeout(() => {
    if (warned) { popup.classList.remove('show'); warned = false; }
  }, 8000);
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
    renderSourceModeBar();
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
      name: g.server_name || `Server ${servers.length + 1}`,
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
    renderSourceModeBar();
    return true;
  } catch (e) {
    console.error(e);
    errorMsg.textContent = 'Lỗi tải dữ liệu phim';
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
    document.querySelector('.overlay').style.display = 'block';
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

  const hasSo1 = episodes.some(e => e.link_so1?.trim());
  const hasSo2 = episodes.some(e => e.link_so2?.trim());

  if (hasSo1) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Mượt 1';
    if (currentPlayMode === 'so1') btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so1'; hlsRetryCount = 0; play(curEp); };
    sourceModeBar.appendChild(btn);
  }

  if (hasSo2) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Mượt 2';
    if (currentPlayMode === 'so2') btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so2'; play(curEp); };
    sourceModeBar.appendChild(btn);
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
  videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'none';
  embedFrame.src = ''; embedFrame.style.display = 'none';
  loading.style.display = 'flex';
  errorMsg.style.display = 'none';
  warned = false;
  clearTimeout(popupTimeout);
}

// ================= CORE PLAYER (TỐI ƯU MƯỢT MÀ CHO MẠNG YẾU & A04) =================
function playSo1(m3u8) {
  resetPlayer();
  hlsRetryCount = 0; // Reset đếm lỗi khi chuyển tập
  videoEl.style.display = 'block';

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false, // BẮT BUỘC TẮT: Chế độ này vắt kiệt CPU máy yếu
      
      // --- QUẢN LÝ BỘ NHỚ (RAM) ---
      // Giảm buffer từ 60MB xuống 15MB để A04 không bị tràn RAM gây giật lag
      maxBufferLength: 10,        // Chỉ tải trước 10 giây
      maxMaxBufferLength: 20,     // Tối đa 20 giây
      maxBufferSize: 15 * 1000 * 1000, // Chỉ dùng tối đa 15MB RAM (Trước đây là 60MB)
      maxBufferHole: 0.5,         // Cho phép lỗ buffer nhỏ để không bị đơ
      
      // --- ĐIỀU CHỈNH CHẤT LƯỢNG TỰ ĐỘNG ---
      capLevelToPlayerSize: true, // Không tải chất lượng quá cao so với màn hình
      startLevel: -1,             // Để HLS tự chọn, nhưng sẽ bị bóp bởi cấu hình bên dưới
      abrEwmaDefaultEstimate: 500000, // Đo mạng là 0.5Mbps đầu tiên (ép chất lượng thấp ngay lập tức)
      abrBandWidthFactor: 0.8,    // Lùi lại 20% băng thông để tránh tải vượt quá khả năng mạng
      abrBandWidthUpFactor: 0.5,  // Tăng chất lượng RẤT chậm để không bị dật khi mạng oscillate
      
      // --- THỜI GIAN TIMEOUT & RETRY ---
      // Chống load vòng vòng vô định
      manifestLoadingTimeOut: 10000, 
      manifestLoadingMaxRetry: 2,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 2,
      fragLoadingTimeOut: 15000,   // Tối đa 15s cho 1 mảnh video
      fragLoadingMaxRetry: 3,
      
      // --- BỔ SUNG ---
      enableSoftwareAES: true,
      progressive: true,           // Tăng tốc tải giảm độ trễ ban đầu
      xhrSetup: xhr => { 
        xhr.withCredentials = false;
        xhr.timeout = 15000;
      }
    });
    
    hls.loadSource(m3u8);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.style.display = 'none';
      videoEl.play().catch(e => showToast('Bấm play để phát'));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // CHỐNG LOAD VÒNG VÒNG: Chỉ cho phép thử lại tối đa 2 lần
            if (hlsRetryCount < 2) {
              hlsRetryCount++;
              showToast(`Mất kết nối, đang reconnect (${hlsRetryCount}/2)...`);
              hls.startLoad();
            } else {
              // Nếu thử lại 2 lần vẫn lỗi -> Tự động chuyển sang SO2 (Embed)
              showToast('Mạng quá yếu, tự động chuyển sang Server Backup...');
              hls.destroy();
              hls = null;
              const ep = episodes[curEp];
              if (ep && ep.link_so2) {
                currentPlayMode = 'so2';
                playSo2(ep.link_so2);
                renderSourceModeBar(); // Cập nhật UI nút bấm
              } else {
                errorMsg.textContent = 'Mạng quá yếu, không tải được video. Hãy thử đổi Server.';
                errorMsg.style.display = 'flex';
                loading.style.display = 'none';
              }
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            showToast('Lỗi giải mã, đang khôi phục...');
            hls.recoverMediaError();
            break;
          default:
            showToast('Lỗi không xác định, thử đổi Server');
            hls.destroy();
            hls = null;
            errorMsg.textContent = 'Lỗi phát video';
            errorMsg.style.display = 'flex';
            loading.style.display = 'none';
            break;
        }
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Dành cho Safari/iOS
    videoEl.src = m3u8;
    videoEl.addEventListener('loadedmetadata', () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => {});
    });
  } else {
    showToast('Trình duyệt quá cũ, không hỗ trợ m3u8');
    loading.style.display = 'none';
  }

  addAutoSkipLogic();
}

function playSo2(embedUrl) {
  resetPlayer();
  embedFrame.src = embedUrl;
  embedFrame.style.display = 'block';
  embedFrame.onload = () => loading.style.display = 'none';
}

function addAutoSkipLogic() {
  videoEl._hasSkippedMid = false;

  const midSkipPoint = 900;    // 15:00
  const midSkipAmount = 38;

  const timeUpdate = () => {
    const t = videoEl.currentTime;
    const d = videoEl.duration;
    if (!d || isNaN(d) || videoEl.seeking) return;

    if (!videoEl._hasSkippedMid && t >= midSkipPoint && t < midSkipPoint + 15) {
      const target = midSkipPoint + midSkipAmount;
      if (target < d) {
        videoEl.currentTime = target;
        showToast('Bỏ 38s');
        videoEl._hasSkippedMid = true;
      }
    }

    if (!warned && d && t >= d - 120 && curEp < episodes.length - 1) {
      showEndPopup();
    }
  };

  videoEl.addEventListener('timeupdate', timeUpdate);
  videoEl.addEventListener('ended', () => {
    if (curEp < episodes.length - 1 && !warned) nextEp();
  });
}

function seek(seconds) {
  if (videoEl.style.display === 'none' || isNaN(videoEl.duration)) {
    showToast('Không thể tua (đang dùng chế độ Embed)');
    return;
  }
  
  const newTime = videoEl.currentTime + seconds;
  videoEl.currentTime = Math.max(0, Math.min(newTime, videoEl.duration));
  
  showToast(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
}

function play(i) {
  if (i < 0 || i >= episodes.length) return;
  curEp = i;
  markEp(i);
  updateUrl(i);
  titleBar.textContent = `${movie} | Tập ${i + 1}`;

  const ep = episodes[i];
  const link_so1 = ep.link_so1?.trim();
  const link_so2 = ep.link_so2?.trim();

  resetPlayer();

  if (currentPlayMode === 'so1' && link_so1) {
    playSo1(link_so1);
  } else if (currentPlayMode === 'so2' && link_so2) {
    playSo2(link_so2);
  } else if (link_so1) {
    playSo1(link_so1);
  } else if (link_so2) {
    playSo2(link_so2);
  } else {
    errorMsg.textContent = 'Không có link phát cho tập này';
    errorMsg.style.display = 'flex';
    loading.style.display = 'none';
  }
}

function switchServer(i) {
  if (i < 0 || i >= servers.length) return;
  curSrv = i;
  episodes = servers[i].data;
  renderGrid();
  renderSourceModeBar();
  document.querySelectorAll('#server-select .btn').forEach((b, k) => b.classList.toggle('active', k === i));
  curEp = Math.min(curEp, episodes.length - 1);
  play(curEp);
}

function prevEp() { if (curEp > 0) play(curEp - 1); else showToast('Đang ở tập đầu'); }
function nextEp() { if (curEp < episodes.length - 1) play(curEp + 1); else showToast('Hết tập'); }

window.changeSource = async function(code) {
  if (code === srcCode) return;
  srcCode = code;
  srcName = srcMap[code];
  resetPlayer();
  loading.style.display = 'flex';
  movieCache.delete(srcName);
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
