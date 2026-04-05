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
let activeProxy = '';

function showToast(m) {
  toastEl.textContent = m;
  toastEl.classList.add('show');
  clearTimeout(toastEl.timeout);
  toastEl.timeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function createProxyUI() {
  const epGrid = document.getElementById('ep-grid');
  if (!epGrid) return;

  // Kiểm tra xem đã tạo chưa để tránh trùng lặp nếu gọi lại
  if (document.getElementById('proxy-box')) return;

  const box = document.createElement('div');
  box.id = 'proxy-box';
  box.innerHTML = `
    <div style="display:flex; gap:5px; width:100%; margin-bottom:10px;">
      <input type="text" id="proxy-input" placeholder="Proxy IP (vd: 111.227.254.12:22222)" style="flex:1; padding:8px; border:1px solid #444; background:#222; color:#fff; border-radius:4px;" />
      <button id="proxy-on" class="btn proxy-btn active">Bật</button>
      <button id="proxy-off" class="btn proxy-btn" disabled>Tắt</button>
    </div>
    <div id="proxy-status" style="font-size:12px; color:#aaa; margin-bottom:10px; min-height:18px;"></div>
  `;
  
  epGrid.parentNode.insertBefore(box, epGrid);

  const input = document.getElementById('proxy-input');
  const btnOn = document.getElementById('proxy-on');
  const btnOff = document.getElementById('proxy-off');
  const statusDiv = document.getElementById('proxy-status');

  btnOn.onclick = () => {
    let url = input.value.trim();
    if (!url) {
      showToast('Vui lòng nhập địa chỉ proxy');
      return;
    }
    
    // SỬA Ở ĐÂY: Mặc định thêm http:// nếu thiếu (thích hợp cho IP:Port)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url; 
    }

    // Cảnh báo Mixed Content nhưng KHÔNG CHẶN (Để chạy được trên HTTP/Local)
    if (location.protocol === 'https:' && url.startsWith('http://')) {
      statusDiv.innerHTML = '<span style="color:#ffaa00">⚠️ Cảnh báo: Web HTTPS đang dùng Proxy HTTP. Có thể bị chặn bởi trình duyệt (Mixed Content). Nếu lỗi, hãy chạy file này dưới local hoặc dùng HTTP.</span>';
      // Không return nữa, cho phép thử
    } else {
      statusDiv.textContent = '';
    }

    activeProxy = url.replace(/\/+$/, ''); // Bỏ dấu / ở cuối
    input.disabled = true;
    btnOn.disabled = true;
    btnOff.disabled = false;
    btnOn.classList.remove('active');
    btnOff.classList.add('active');
    showToast('Đã bật Proxy: ' + activeProxy);
    
    if (episodes.length > 0 && currentPlayMode === 'so1') {
      play(curEp);
    }
  };

  btnOff.onclick = () => {
    activeProxy = '';
    input.disabled = false;
    btnOn.disabled = false;
    btnOff.disabled = true;
    btnOff.classList.remove('active');
    btnOn.classList.add('active');
    statusDiv.textContent = '';
    showToast('Đã tắt Proxy');
    
    if (episodes.length > 0 && currentPlayMode === 'so1') {
      play(curEp);
    }
  };
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
    btn.onclick = () => { currentPlayMode = 'so1'; play(curEp); };
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

// --- HÀM PLAY SO1 ĐÃ TỐI ƯU CHO PROXY ---
function playSo1(m3u8) {
  resetPlayer();
  videoEl.style.display = 'block';

  const proxyPrefix = activeProxy ? activeProxy.replace(/\/+$/, '') : '';
  
  // Xử lý URL: Nếu có proxy thì ghép tiền tố. Đảm bảo không bị // dư thừa
  let targetM3u8 = m3u8;
  if (proxyPrefix) {
    targetM3u8 = `${proxyPrefix}/${m3u8}`;
  }

  if (Hls.isSupported()) {
    let retryCount = 0;
    
    hls = new Hls({
      enableWorker: true,
      autoStartLoad: true,
      maxBufferLength: 30, // Tăng buffer để mượt hơn với proxy lag
      maxMaxBufferLength: 60,
      manifestLoadingTimeOut: 20000, // Tăng timeout cho proxy
      levelLoadingTimeOut: 20000,
      fragLoadingTimeOut: 30000,
      
      xhrSetup: (xhr, url) => {
        // Logic quan trọng:
        // 1. Nếu đã bật Proxy và URL đang tải chưa có prefix proxy -> Thêm vào.
        // 2. Nếu URL đang tải là URL gốc (không phải blob) -> Ghép proxy.
        
        if (proxyPrefix && !url.startsWith(proxyPrefix) && !url.startsWith('blob:')) {
          // Tránh việc ghép đúp nếu HLS tự tạo URL từ base
          const finalUrl = `${proxyPrefix}/${url}`;
          xhr.open('GET', finalUrl, true);
        } else {
          // Mặc định (trường hợp blob hoặc đã có proxy)
          if (!xhr.readyState) xhr.open('GET', url, true);
        }
        
        xhr.withCredentials = false;
        xhr.timeout = 35000; // Tăng timeout request
      }
    });
    
    hls.loadSource(targetM3u8);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.style.display = 'none';
      videoEl.play().catch(e => showToast('Bấm play để phát'));
    });

    hls.on(Hls.Events.ERROR, (e, data) => {
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('HLS Network Error:', data);
            if (retryCount < 3) { // Tăng số lần retry
              retryCount++;
              showToast(`Mất kết nối - đang thử lại (${retryCount}/3)...`);
              hls.startLoad();
            } else {
              showToast('Lỗi mạng. Kiểm tra lại Proxy hoặc đổi Server.');
              // hls.destroy(); // Không destroy ngay để có thể retry thủ công
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('HLS Media Error:', data);
            showToast('Lỗi định dạng video - đang khôi phục...');
            hls.recoverMediaError();
            break;
          default:
            console.error('HLS Fatal Error:', data);
            hls.destroy();
            break;
        }
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari
    videoEl.src = targetM3u8;
    videoEl.addEventListener('loadedmetadata', () => {
      loading.style.display = 'none';
      videoEl.play().catch(() => {});
    });
  } else {
    showToast('Trình duyệt không hỗ trợ HLS');
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
    showToast('Không thể tua (chưa phát hoặc đang dùng embed)');
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
  
  createProxyUI();
  
  curEp = epFromUrl();
  loading.style.display = 'flex';
  if (await loadMovie() && servers.length > 0) {
    switchServer(0);
  }
}

init();
