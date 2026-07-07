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
let hlsRetryCount = 0; 

// ================= CẤU HÌNH PROXY TỰ ĐỘNG =================
let proxyUrl = '';
let isProxyEnabled = false; // Trạng thái nút (Mặc định TẮT)

// Hàm đọc file proxy.txt từ cùng thư mục
async function loadProxyConfig() {
  try {
    const r = await fetch('./proxy.txt?t=' + Date.now());
    if (r.ok) {
      const txt = await r.text();
      // Lấy dòng đầu tiên chứa http(s)://
      const match = txt.match(/https?:\/\/[^\s]+/);
      if (match) {
        proxyUrl = match[0].replace(/\/+$/, ''); // Xóa dấu / thừa ở cuối
        console.log('Đã tải Proxy:', proxyUrl);
      }
    }
  } catch (e) {
    console.log('Không tìm thấy file proxy.txt, dùng mạng trực tiếp.');
  }
}

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
    if (currentPlayMode === 'so1' && !isProxyEnabled) btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so1'; isProxyEnabled = false; hlsRetryCount = 0; play(curEp); renderSourceModeBar(); };
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

  // ==================================================================
  // NÚT BẬT/TẮT PROXY
  // ==================================================================
  if (hasSo1) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'proxy-toggle-btn';
    
    // Nếu đang bật, đổi màu và chữ
    if (isProxyEnabled) {
      btn.classList.add('active');
      btn.style.background = '#27ae60'; // Màu xanh lá khi BẬT
      btn.textContent = 'Proxy ON';
    } else {
      btn.style.background = '#555'; // Màu xám khi TẮT
      btn.textContent = proxyUrl ? 'Proxy OFF' : 'No Proxy';
    }

    btn.onclick = () => {
      if (!proxyUrl) {
        showToast('Không tìm thấy cấu hình Proxy trong file proxy.txt');
        return;
      }
      // Đảo trạng thái
      isProxyEnabled = !isProxyEnabled; 
      currentPlayMode = 'so1';
      hlsRetryCount = 0;
      
      // Cập nhật lại giao diện các nút
      renderSourceModeBar();
      
      // Chơi lại tập hiện tại để áp dụng Proxy mới
      play(curEp);
      
      showToast(isProxyEnabled ? `Đã bật Proxy: ${proxyUrl}` : 'Đã tắt Proxy (Mạng trực tiếp)');
    };
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

// ================= CORE PLAYER (TÍCH HỢP LOGIC PROXY VÀO XHR) =================
function playSo1(m3u8) {
  resetPlayer();
  hlsRetryCount = 0; 
  videoEl.style.display = 'block';

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      maxBufferSize: 15 * 1000 * 1000,
      maxBufferHole: 0.5,
      capLevelToPlayerSize: true,
      startLevel: -1,
      abrEwmaDefaultEstimate: 500000,
      abrBandWidthFactor: 0.8,
      abrBandWidthUpFactor: 0.5,
      manifestLoadingTimeOut: 10000, 
      manifestLoadingMaxRetry: 2,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 2,
      fragLoadingTimeOut: 15000,
      fragLoadingMaxRetry: 3,
      enableSoftwareAES: true,
      progressive: true,
      
      // =======================================================
      // VÙNG CHẠN REQUEST: BẮT LINK M3U8 GÁN THÊM PROXY VÀO
      // =======================================================
      xhrSetup: (xhr, url) => {
        let finalUrl = url;
        
        // Nếu nút Proxy đang ON và có cấu hình IP
        if (isProxyEnabled && proxyUrl) {
          // Cấu trúc chuyển đổi: http://188.239.43.6:80/https://link-m3u8-goc.com/file.m3u8
          // Nếu proxy của bạn cần mã hóa (encode), hãy đổi thành: proxyUrl + '/' + encodeURIComponent(url)
          finalUrl = `${proxyUrl}/${url}`;
        }

        // Mở request bằng URL cuối cùng
        xhr.open('GET', finalUrl, true);
        xhr.withCredentials = false;
        
        // Nếu dùng Proxy, tăng timeout lên vì mạng đi vòng có thể chậm hơn
        xhr.timeout = isProxyEnabled ? 25000 : 15000;
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
            if (hlsRetryCount < 2) {
              hlsRetryCount++;
              showToast(isProxyEnabled ? `Proxy lag, thử lại (${hlsRetryCount}/2)...` : `Mất kết nối (${hlsRetryCount}/2)...`);
              hls.startLoad();
            } else {
              showToast('Lỗi mạng liên tục, thử chế độ khác...');
              hls.destroy(); hls = null;
              const ep = episodes[curEp];
              if (isProxyEnabled) {
                // Nếu đang dùng Proxy mà lỗi -> Tự động tắt Proxy và chạy trực tiếp
                isProxyEnabled = false;
                renderSourceModeBar();
                play(curEp);
              } else if (ep && ep.link_so2) {
                currentPlayMode = 'so2';
                playSo2(ep.link_so2);
                renderSourceModeBar(); 
              } else {
                errorMsg.textContent = 'Mạng quá yếu. Hãy bật Proxy hoặc đổi Server.';
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
            showToast('Lỗi không xác định');
            hls.destroy(); hls = null;
            errorMsg.textContent = 'Lỗi phát video';
            errorMsg.style.display = 'flex';
            loading.style.display = 'none';
            break;
        }
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = m3u8;
    videoEl.addEventListener('loadedmetadata', () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => {});
    });
  } else {
    showToast('Trình duyệt quá cũ');
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

  const midSkipPoint = 900;    
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
  
  loading.style.display = 'flex';
  
  // 1. Tải cấu hình Proxy trước
  await loadProxyConfig();
  
  // 2. Sau đó mới tải dữ liệu phim và khởi tạo
  if (await loadMovie() && servers.length > 0) {
    switchServer(0);
  }
}

init();