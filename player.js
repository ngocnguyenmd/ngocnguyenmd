/**
 * PLAYER.JS - PHIÊN BẢN SẠCH, KHÔNG PROXY, TỐI ƯU MẠNG YẾU
 */

// --- CẤU HÌNH ---
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

// --- BIẾN TOÀN CỤC ---
let hls = null;
let servers = [], episodes = [], curSrv = 0, curEp = 0;
let movie = '', poster = '', cdn = '', plot = '';
let warned = false;
let popupTimeout = null;
let currentPlayMode = 'so1';
let hlsRetryCount = 0;
const movieCache = new Map();

// --- DOM ELEMENTS ---
const playerArea = document.getElementById('player-area');
const videoEl = document.getElementById('hls-video');
const embedFrame = document.getElementById('embed-frame');
const loading = playerArea.querySelector('.loading-overlay');
const errorMsg = document.getElementById('error-msg');
const titleBar = document.getElementById('title-bar');
const popup = document.getElementById('popup-confirm');
const toastEl = document.getElementById('toast');
const bgBlur = document.getElementById('bg-blur');
const plotText = document.getElementById('plot-text');
const sourceModeBar = document.getElementById('source-mode-bar');

// --- SỰ KIỆN POPUP ---
if(popup) {
    popup.querySelector('.popup-yes').onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = false; nextEp(); };
    popup.querySelector('.popup-no').onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = true; };
}

// --- HÀM HỖ TRỢ ---
function showToast(m) {
    if(!toastEl) return;
    toastEl.textContent = m;
    toastEl.classList.add('show');
    clearTimeout(toastEl.timeout);
    toastEl.timeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function showEndPopup() {
    if (!popup || warned || curEp >= episodes.length - 1) return;
    warned = true;
    popup.classList.add('show');
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => { if(warned) { popup.classList.remove('show'); warned = false; } }, 10000);
}

function updateUrl(ep) {
    curEp = ep;
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

// --- TẢI DỮ LIỆU PHIM ---
async function loadMovie() {
    if (movieCache.has(srcName)) {
        applyData(movieCache.get(srcName));
        return true;
    }

    try {
        loading.style.display = 'flex';
        const r = await fetch(API[srcName], { cache: 'force-cache' });
        if (!r.ok) throw new Error('API Error');
        const d = await r.json();

        let m = {}, epsList = [];
        if (srcName === 'Nguonc') { m = d.movie; epsList = m.episodes || []; }
        else if (srcName === 'Phimapi') { m = d.movie; epsList = d.episodes || []; }
        else { m = d.data.item; epsList = m.episodes || []; cdn = d.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live'; }

        const dataObj = {
            movie: m.name || m.title || 'N/A',
            poster: getPoster(m),
            plot: m.content || m.description || 'Updating...',
            servers: epsList.map(g => ({
                name: g.server_name || `Server ${epsList.indexOf(g)+1}`,
                data: (g.server_data || g.items || []).map(ep => ({
                    name: ep.name || `Ep ${ep.slug?.split('-').pop()||''}`,
                    link_so1: srcName==='Nguonc' ? '' : (ep.link_m3u8 || ep.m3u8 || ''),
                    link_so2: ep.link_embed || ep.embed || ''
                })).filter(ep => ep.link_so1 || ep.link_so2)
            })).filter(s => s.data.length > 0)
        };

        if (!dataObj.servers.length) throw new Error('Empty Data');
        
        movieCache.set(srcName, dataObj);
        applyData(dataObj);
        return true;

    } catch (e) {
        console.error(e);
        showError('Lỗi tải dữ liệu phim.');
        return false;
    }
}

function applyData(d) {
    movie = d.movie; poster = d.poster; plot = d.plot; servers = d.servers;
    titleBar.textContent = movie;
    plotText.innerHTML = plot.replace(/\n/g, '<br>');
    if (poster && bgBlur) {
        bgBlur.style.backgroundImage = `url(${poster})`;
        bgBlur.classList.add('loaded');
    }
    renderUI();
}

// --- RENDER GIAO DIỆN (ĐƠN GIẢN) ---
function renderUI() {
    renderSourceModeBar();
    renderServerBar();
    renderGrid();
}

function renderSourceModeBar() {
    sourceModeBar.innerHTML = '';

    // 1. Nút chọn Nguồn (AX/BX/CX)
    const srcDiv = document.createElement('div');
    srcDiv.className = 'source-btn'; // Dùng class của bạn nếu có
    srcDiv.style.position = 'relative'; displayStyle = 'inline-block';
    
    srcDiv.innerHTML = `
        <button class="btn active" id="current-source">${srcCode.toUpperCase()}</button>
        <div class="dropdown" style="display:none; position:absolute; background:#222; z-index:100; min-width:100px;">
            <button class="btn" onclick="changeSource('ax')" style="width:100%; text-align:left;">AX</button>
            <button class="btn" onclick="changeSource('bx')" style="width:100%; text-align:left;">BX</button>
            <button class="btn" onclick="changeSource('cx')" style="width:100%; text-align:left;">CX</button>
        </div>
    `;
    
    // Hiện dropdown khi click hoặc hover
    const btn = srcDiv.querySelector('#current-source');
    const drop = srcDiv.querySelector('.dropdown');
    
    btn.onclick = (e) => { e.stopPropagation(); drop.style.display = drop.style.display==='block'?'none':'block'; };
    // Click bên ngoài để tắt
    document.addEventListener('click', () => drop.style.display='none');

    sourceModeBar.appendChild(srcDiv);

    // 2. Nút Chế độ Phát
    const hasSo1 = episodes.some(e => e.link_so1?.trim());
    const hasSo2 = episodes.some(e => e.link_so2?.trim());

    if (hasSo1) {
        const b = document.createElement('button');
        b.className = `btn ${currentPlayMode==='so1' ? 'active' : ''}`;
        b.textContent = 'Mượt 1';
        b.onclick = () => { currentPlayMode='so1'; play(curEp); renderSourceModeBar(); };
        sourceModeBar.appendChild(b);
    }

    if (hasSo2) {
        const b = document.createElement('button');
        b.className = `btn ${currentPlayMode==='so2' ? 'active' : ''}`;
        b.textContent = 'Mượt 2';
        b.onclick = () => { currentPlayMode='so2'; play(curEp); renderSourceModeBar(); };
        sourceModeBar.appendChild(b);
    }
}

function renderServerBar() {
    const bar = document.getElementById('server-select');
    bar.innerHTML = '';
    servers.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = `btn ${i===curSrv ? 'active' : ''}`;
        b.textContent = `${s.name} (${s.data.length})`;
        b.onclick = () => switchServer(i);
        bar.appendChild(b); // ĐÃ SỬA LỖI CÚ PHÁP Ở ĐÂY
    });
}

function renderGrid() {
    const g = document.getElementById('ep-grid');
    g.innerHTML = '';
    episodes.forEach((_, i) => {
        const b = document.createElement('div');
        b.className = `ep-btn ${i===curEp ? 'active' : ''}`;
        b.textContent = i + 1;
        b.onclick = () => play(i);
        g.appendChild(b);
    });
}

// --- LOGIC CHƠI PHIM (TỐI ƯU MẠNG YẾU) ---
function resetPlayer() {
    if (hls) { hls.destroy(); hls = null; }
    videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); 
    videoEl.style.display = 'none';
    embedFrame.src = ''; embedFrame.style.display = 'none';
    loading.style.display = 'flex';
    errorMsg.style.display = 'none';
    warned = false;
    clearTimeout(popupTimeout);
}

function play(i) {
    if (i < 0 || i >= episodes.length) return;
    curEp = i;
    markEp(i);
    updateUrl(i);
    titleBar.textContent = `${movie} | Tập ${i+1}`;
    
    const ep = episodes[i];
    resetPlayer();

    if ((currentPlayMode==='so1') && ep.link_so1?.trim()) initHLSPlayer(ep.link_so1.trim());
    else if ((currentPlayMode==='so2') && ep.link_so2?.trim()) playEmbed(ep.link_so2.trim());
    else if (ep.link_so1?.trim()) { currentPlayMode='so1'; initHLSPlayer(ep.link_so1.trim()); }
    else if (ep.link_so2?.trim()) { currentPlayMode='so2'; playEmbed(ep.link_so2.trim()); }
    else showError('Tập này chưa có link.');
}

function initHLSPlayer(url) {
    resetPlayer();
    hlsRetryCount = 0;
    videoEl.style.display = 'block';

    if (Hls.isSupported()) {
        hls = new Hls({
            // --- CẤU HÌNH TỐI ƯU CHO MẠNG YẾU & KHÔNG LỖI TIẾNG ---
            enableWorker: false,         // TẮT: Tránh lỗi tiếng robot sau 15 phút
            maxBufferLength: 30,         // TĂNG: Giữ 30s video để mạng gập ghềnh không bị dừng
            maxMaxBufferLength: 60,
            fragLoadingTimeOut: 25000,   // TĂNG: Chờ tải file .ts lâu hơn (mặc định 10-20s quá ngắn)
            fragLoadingMaxRetry: 5,      // TĂNG: Thử lại nhiều lần khi lỗi mạng
            abrEwmaDefaultEstimate: 500000, // Bắt đầu chất lượng thấp để load nhanh
            progressive: false,          // TẮT: Giảm lỗi trên mobile/mạng chập chờn
            
            // KHÔNG SỬ DỤNG PROXY
            xhrSetup: (xhr, u) => { 
                xhr.open('GET', u, true); 
                xhr.timeout = 30000; 
            }
        });

        hls.loadSource(url);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            loading.style.display = 'none';
            videoEl.play().catch(()=>showToast('Bấm vào màn hình để phát'));
        });

        hls.on(Hls.Events.ERROR, (_, d) => {
            if(d.fatal) {
                if(d.type === Hls.ErrorTypes.NETWORK_ERROR && hlsRetryCount < 3) {
                    hlsRetryCount++;
                    showToast(`Mất kết nối (${hlsRetryCount}/3)...`);
                    hls.startLoad();
                } else {
                    handleFatalError('Lỗi mạng liên tục, đang chuyển server dự phòng...');
                }
            }
        });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = url;
        videoEl.addEventListener('loadedmetadata', () => { loading.style.display='none'; videoEl.play(); });
    } else showError('Trình duyệt không hỗ trợ');

    setupVideoEvents();
}

function playEmbed(url) {
    resetPlayer();
    embedFrame.src = url;
    embedFrame.style.display = 'block';
    embedFrame.onload = () => { loading.style.display='none'; videoEl.style.display='none'; };
}

function handleFatalError(msg) {
    showToast(msg);
    if(hls) { hls.destroy(); hls=null; }
    const ep = episodes[curEp];
    // Nếu Mode 1 lỗi -> Chuyển sang Mode 2 (Embed)
    if(currentPlayMode==='so1' && ep.link_so2) { 
        currentPlayMode='so2'; 
        playEmbed(ep.link_so2); 
        renderSourceModeBar(); 
    } else {
        showError('Video lỗi. Vui lòng đổi Server.');
    }
}

// --- XỬ LÝ SỰ KIỆN VIDEO ---
function setupVideoEvents() {
    videoEl.removeEventListener('timeupdate', timeUpdateHandler);
    videoEl.removeEventListener('ended', endedHandler);
    videoEl.addEventListener('timeupdate', timeUpdateHandler);
    videoEl.addEventListener('ended', endedHandler);
    videoEl._hasSkippedMid = false;
}

function timeUpdateHandler() {
    const t=videoEl.currentTime, d=videoEl.duration;
    if(!d||isNaN(d)) return;
    // Skip Intro Logic (tùy chỉnh số giây ở đây)
    if(!videoEl._hasSkippedMid && t>=90 && t<100) { 
        if(130<d){videoEl.currentTime=130; showToast('Đã bỏ qua intro'); videoEl._hasSkippedMid=true;} 
    }
    // Popup hỏi xem tiếp
    if(!warned && t>=d-120 && curEp<episodes.length-1) showEndPopup();
}
function endedHandler() { if(curEp<episodes.length-1 && !warned) nextEp(); }

// --- ĐIỀU HƯỞNG ---
function switchServer(i) {
    if(i<0||i>=servers.length) return;
    curSrv=i; episodes=servers[i].data; curEp=Math.min(curEp, episodes.length-1);
    renderUI(); play(curEp);
}
window.changeSource = async (c) => {
    if(c===srcCode) return; 
    srcCode=c; srcName=srcMap[c]; 
    movieCache.delete(srcName);
    if(await loadMovie()) { curSrv=0; switchServer(0); }
};
function prevEp() { if(curEp>0) play(curEp-1); else showToast('Đang ở tập đầu.'); }
function nextEp() { if(curEp<episodes.length-1) play(curEp+1); else showToast('Đã hết phim.'); }
function markEp(i) { document.querySelectorAll('.ep-btn').forEach((b,k)=>b.classList.toggle('active',k===i)); }
function showError(msg) { 
    if(errorMsg){errorMsg.textContent=msg; errorMsg.style.display='flex';} 
    if(loading)loading.style.display='none'; 
}

// --- KHỞI CHẠY ---
async function init() {
    if(!slug) { showError('Thiếu Slug.'); return; }
    await loadMovie();
    if(servers.length>0) { 
        switchServer(0); 
        let startE = parseInt(params.get('e'))>0?parseInt(params.get('e'))-1:0;
        if(startE>0) play(startE); else play(0);
    }
}
init();
