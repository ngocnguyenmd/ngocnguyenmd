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

// ================= CẤU HÌNH PROXY =================
let proxyList = []; 
let selectedProxyIndex = -1; // -1 = Tắt từ Dropdown
let manualProxyUrl = ''; // Nhập thủ công từ khung văn bản

async function loadProxyConfig() {
  try {
    const r = await fetch('./proxy.txt?t=' + Date.now());
    if (r.ok) {
      const txt = await r.text();
      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('http://') || l.startsWith('https://'));
      if (lines.length > 0) {
        proxyList = lines.map(ip => ip.replace(/\/+$/, '')); 
      }
    }
  } catch (e) {}
}

// Chuyển Proxy Dropdown
window.selectProxy = function(index) {
  selectedProxyIndex = index;
  manualProxyUrl = ''; // Xóa trắng ô nhập thủ công khi chọn từ list
  currentPlayMode = 'so1';
  hlsRetryCount = 0;
  renderSourceModeBar(); 
  switchProxyFast(); // CHUYỂN NHANH KHÔNG LOAD LẠI MÀN HÌNH ĐEN
  showToast(index === -1 ? 'Đã tắt Proxy (Mạng trực tiếp)' : `Chuyển sang Proxy ${index + 1}`);
};

// Áp dụng Proxy thủ công từ khung nhập
window.applyManualProxy = function() {
  const input = document.getElementById('manual-proxy-input');
  if (!input) return;
  const val = input.value.trim();
  
  if (!val) {
    manualProxyUrl = '';
    selectedProxyIndex = -1;
    renderSourceModeBar(); 
    switchProxyFast();
    showToast('Đã xóa Proxy thủ công');
    return;
  }
  
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    showToast('Sai định dạng (Cần http://...)');
    return;
  }
  
  manualProxyUrl = val.replace(/\/+$/, '');
  selectedProxyIndex = -1; // Ngắt Dropdown
  currentPlayMode = 'so1';
  hlsRetryCount = 0;
  renderSourceModeBar();
  switchProxyFast();
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

  // 1. Nút API
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
    if (currentPlayMode === 'so1' && selectedProxyIndex === -1 && !manualProxyUrl) btn.classList.add('active');
    btn.onclick = () => { currentPlayMode = 'so1'; selectedProxyIndex = -1; manualProxyUrl = ''; hlsRetryCount = 0; play(curEp); renderSourceModeBar(); };
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

  // 2. Dropdown Proxy & Khung Nhập Thủ Công
  if (hasSo1) {
    const proxyWrapper = document.createElement('div');
    proxyWrapper.style.width = '100%';
    proxyWrapper.style.marginTop = '5px';
    proxyWrapper.style.display = 'flex';
    proxyWrapper.style.gap = '5px';
    proxyWrapper.style.flexWrap = 'wrap';
    proxyWrapper.style.alignItems = 'center';

    if (proxyList.length > 0) {
      const proxyDiv = document.createElement('div');
      proxyDiv.className = 'source-btn';
      
      let btnText = 'Proxy OFF';
      let btnStyle = 'background: #555;';
      if (selectedProxyIndex !== -1) {
        const shortIp = proxyList[selectedProxyIndex].replace('http://', '');
        btnText = `List ${selectedProxyIndex + 1}`;
        btnStyle = 'background: #27ae60;';
      } else if (manualProxyUrl) {
        btnText = 'Custom ON';
        btnStyle = 'background: #2980b9;'; // Xanh dương cho Custom
      }

      let dropdownHtml = `<button onclick="selectProxy(-1)">🔴 Tắt Proxy</button>`;
      proxyList.forEach((ip, i) => {
        const shortIp = ip.replace('http://', '');
        dropdownHtml += `<button onclick="selectProxy(${i})">🟢 Proxy ${i + 1} (${shortIp})</button>`;
      });

      proxyDiv.innerHTML = `
        <button class="btn" style="${btnStyle}">${btnText}</button>
        <div class="dropdown">${dropdownHtml}</div>
      `;
      proxyWrapper.appendChild(proxyDiv);
    }

    // Khung Nhập Thủ Công (Luôn hiện nếu có M3U8)
    const inputBox = document.createElement('div');
    inputBox.style.display = 'flex';
    inputBox.style.gap = '4px';
    inputBox.style.flex = '1';
    inputBox.style.minWidth = '0';

    inputBox.innerHTML = `
      <input type="text" 
             id="manual-proxy-input" 
             placeholder="Nhập IP:Port thủ công..." 
             value="${manualProxyUrl}"
             style="flex:1; min-width:0; height:32px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:0 8px; border-radius:4px; font-size:12px; outline:none;"
             onkeypress="if(event.key==='Enter') applyManualProxy()"
      >
      <button class="btn" onclick="applyManualProxy()" style="height:32px; padding:0 8px; font-size:12px;">Áp dụng</button>
    `;
    proxyWrapper.appendChild(inputBox);
    sourceModeBar.appendChild(proxyWrapper);
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

// ================= HÀM CHUYỂN PROXY NHANH (KHÔNG LÀM ĐEN MÀN HÌNH) =================
function switchProxyFast() {
  const ep = episodes[curEp];
  if (!ep || !ep.link_so1?.trim()) return;
  
  // Chỉ đập HLS cốt lõi, KHÔNG ẩn thẻ Video
  if (hls) { hls.destroy(); hls = null; }
  embedFrame.src = ''; embedFrame.style.display = 'none';
  errorMsg.style.display = 'none';
  
  // Khởi chạy lại HLS trực tiếp lên Video đang mở
  videoEl.style.display = 'block';
  initializeHls(ep.link_so1.trim());
}

// ================= CORE HLS INITIALIZER =================
function initializeHls(m3u8) {
  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false, 
      maxBufferLength: 15,        
      maxMaxBufferLength: 30,     
      maxBufferSize: 25 * 1000 * 1000,
      maxBufferHole: 1.5,         
      capLevelToPlayerSize: true, 
      startLevel: -1,             
      abrEwmaDefaultEstimate: 800000, 
      abrBandWidthFactor: 0.85,   
      abrBandWidthUpFactor: 0.7,  
      manifestLoadingTimeOut: 15000, 
      manifestLoadingMaxRetry: 3,
      levelLoadingTimeOut: 15000,
      levelLoadingMaxRetry: 3,
      fragLoadingTimeOut: 20000,   
      fragLoadingMaxRetry: 4,
      enableSoftwareAES: true,
      progressive: false,          
      maxAudioFramesDrift: 15,     
      
      // LOGIC ẢNH HƯỞNG ĐẾN TẤT CẢ CÁC CHẾ ĐỘ
      xhrSetup: (xhr, url) => {
        let finalUrl = url;
        let isUsingProxy = false;

        // Ưu tiên 1: Nhập thủ công
        if (manualProxyUrl) {
          finalUrl = `${manualProxyUrl}/${url}`;
          isUsingProxy = true;
        }
        // Ưu tiên 2: Chọn từ Dropdown
        else if (selectedProxyIndex !== -1 && proxyList[selectedProxyIndex]) {
          finalUrl = `${proxyList[selectedProxyIndex]}/${url}`;
          isUsingProxy = true;
        }

        xhr.open('GET', finalUrl, true);
        xhr.withCredentials = false;
        xhr.timeout = isUsingProxy ? 25000 : 20000;
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
              showToast(isUsingProxy() ? `Proxy lỗi, thử lại...` : `Mất kết nối (${hlsRetryCount}/2)...`);
              hls.startLoad();
            } else {
              showToast('Lỗi mạng liên tục, thử đổi Proxy khác...');
              hls.destroy(); hls = null;
              const ep = episodes[curEp];
              if (ep && ep.link_so2) {
                currentPlayMode = 'so2';
                playSo2(ep.link_so2);
                renderSourceModeBar(); 
              } else {
                errorMsg.textContent = 'Lỗi mạng. Hãy đổi Proxy hoặc Server.';
                errorMsg.style.display = 'flex';
                loading.style.display = 'none';
              }
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            // ĐÃ BỎ: Không cố gắng recoverMediaError() để tránh rè tiếng và giật
            showToast('Lỗi file video. Hãy thử Server hoặc Proxy khác.');
            hls.destroy(); hls = null;
            errorMsg.textContent = 'Lỗi giải mã video';
            errorMsg.style.display = 'flex';
            loading.style.display = 'none';
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

// Hàm kiểm tra trạng thái đang dùng Proxy (dùng cho thông báo lỗi)
function isUsingProxy() {
  return manualProxyUrl || (selectedProxyIndex !== -1 && proxyList[selectedProxyIndex]);
}

function playSo1(m3u8) {
  resetPlayer();
  hlsRetryCount = 0; 
  videoEl.style.display = 'block';
  initializeHls(m3u8);
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
  
  await loadProxyConfig();
  
  if (await loadMovie() && servers.length > 0) {
    switchServer(0);
  }
}

init();
