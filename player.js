/**
 * PLAYER.JS - FIX ERROR & OPTIMIZED
 */

// --- CONFIG ---
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

// --- STATE ---
let hls = null;
let servers = [], episodes = [], curSrv = 0, curEp = 0;
let movie = '', poster = '', cdn = '', plot = '';
let warned = false;
let popupTimeout = null;
let currentPlayMode = 'so1';
let hlsRetryCount = 0;

const movieCache = new Map();

// --- DOM ---
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

// --- EVENTS SETUP ---
if(popup) {
    popup.querySelector('.popup-yes').onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = false; nextEp(); };
    popup.querySelector('.popup-no').onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = true; };
}

// --- UTILS ---
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

// --- DATA LOADING ---
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
        showError('Lỗi tải dữ liệu. Thử đổi nguồn?');
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

// --- UI RENDERING ---
function renderUI() {
    renderSourceModeBar();
    renderServerBar();
    renderGrid();
}

function renderSourceModeBar() {
    sourceModeBar.innerHTML = '';
    
    // Source Dropdown
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.innerHTML = `
        <button class="btn active">${srcCode.toUpperCase()} ▼</button>
        <div class="dropdown" style="display:none; position:absolute; background:#333; z-index:100; min-width:120px; top:100%; left:0; flex-direction:column; box-shadow:0 4px 8px #000;">
            <button class="btn" style="border-radius:0; border-bottom:1px solid #555;" onclick="changeSource('ax')">AX</button>
            <button class="btn" style="border-radius:0; border-bottom:1px solid #555;" onclick="changeSource('bx')">BX</button>
            <button class="btn" style="border-radius:0;" onclick="changeSource('cx')">CX</button>
        </div>`;
    div.onmouseover = () => div.querySelector('.dropdown').style.display = 'flex';
    div.onmouseout = () => div.querySelector('.dropdown').style.display = 'none';
    sourceModeBar.appendChild(div);

    // Mode Buttons
    const hasSo1 = episodes.some(e => e.link_so1?.trim());
    const hasSo2 = episodes.some(e => e.link_so2?.trim());

    if (hasSo1) sourceModeBar.appendChild(createBtn('🚀 Mượt', currentPlayMode==='so1', () => { currentPlayMode='so1'; play(curEp); renderSourceModeBar(); }));
    if (hasSo2) sourceModeBar.appendChild(createBtn('📺 Dự phòng', currentPlayMode==='so2', () => { currentPlayMode='so2'; play(curEp); renderSourceModeBar(); }));
}

function createBtn(text, isActive, onClick) {
    const b = document.createElement('button');
    b.className = `btn ${isActive ? 'active' : ''}`;
    b.textContent = text;
    b.onclick = onClick;
    return b;
}

function renderServerBar() {
    const bar = document.getElementById('server-select');
    bar.innerHTML = '';
    servers.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = `btn ${i===curSrv ? 'active' : ''}`;
        b.textContent = `${s.name} (${s.data.length})`;
        b.onclick = () => switchServer(i);
        bar.appendChild(b); // <<< ĐÃ SỬA LỖI Ở ĐÂY (BỎ DẤU ) THỪA)
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

// --- PLAYER LOGIC ---
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
            enableWorker: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            fragLoadingTimeOut: 25000,
            fragLoadingMaxRetry: 5,
            abrEwmaDefaultEstimate: 500000,
            progressive: false,
            xhrSetup: (xhr, u) => { xhr.open('GET', u, true); xhr.timeout = 30000; }
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
                    showToast(`Mạng yếu, thử lại (${hlsRetryCount}/3)...`);
                    hls.startLoad();
                } else {
                    handleFatalError('Lỗi mạng liên tục, chuyển chế độ dự phòng...');
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
    if(currentPlayMode==='so1' && ep.link_so2) { currentPlayMode='so2'; playEmbed(ep.link_so2); renderSourceModeBar(); }
    else showError('Video lỗi. Vui lòng đổi Server.');
}

// --- VIDEO EVENTS ---
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
    if(!videoEl._hasSkippedMid && t>=90 && t<100) { if(130<d){videoEl.currentTime=130; showToast('Đã bỏ qua intro'); videoEl._hasSkippedMid=true;} }
    if(!warned && t>=d-120 && curEp<episodes.length-1) showEndPopup();
}
function endedHandler() { if(curEp<episodes.length-1 && !warned) nextEp(); }

// --- NAVIGATION ---
function switchServer(i) {
    if(i<0||i>=servers.length) return;
    curSrv=i; episodes=servers[i].data; curEp=Math.min(curEp, episodes.length-1);
    renderUI(); play(curEp);
}
window.changeSource = async (c) => {
    if(c===srcCode) return; srcCode=c; srcName=srcMap[c]; movieCache.delete(srcName);
    if(await loadMovie()) { curSrv=0; switchServer(0); }
};
function prevEp() { if(curEp>0) play(curEp-1); else showToast('Đầu tập.'); }
function nextEp() { if(curEp<episodes.length-1) play(curEp+1); else showToast('Hết phim.'); }
function markEp(i) { document.querySelectorAll('.ep-btn').forEach((b,k)=>b.classList.toggle('active',k===i)); }
function showError(msg) { if(errorMsg){errorMsg.textContent=msg; errorMsg.style.display='flex';} if(loading)loading.style.display='none'; }

// --- INIT ---
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
