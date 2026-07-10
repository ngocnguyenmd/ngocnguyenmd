/**
 * PLAYER.JS - PHIÊN BẢN TỐI ƯU MẠNG YẾU & ỔN ĐỊNH
 * ĐÃ LOẠI BỎ PROXY - SỬ DỤNG MẠNG TRỰC TIẾP
 */

// --- CẤU HÌNH BAN ĐẦU ---
const params = new URLSearchParams(location.search);
const slug = params.get('slug');
let srcCode = params.get('source') || 'bx'; // Mặc định Phimapi
const srcMap = { ax: 'Ophim', bx: 'Phimapi', cx: 'Nguonc' };
let srcName = srcMap[srcCode] || 'Phimapi';

// --- API ENDPOINTS ---
const API = {
    Ophim: `https://ophim1.com/v1/api/phim/${slug}`,
    Phimapi: `https://phimapi.com/phim/${slug}`,
    Nguonc: `https://phim.nguonc.com/api/film/${slug}`
};

// --- BIẾN TRẠNG THÁI TOÀN CỤC ---
let hls = null;
let servers = [], episodes = [], curSrv = 0, curEp = 0;
let movie = '', poster = '', cdn = '', plot = '';
let warned = false;
let popupTimeout = null;
let currentPlayMode = 'so1'; // 'so1': M3U8 (Khuyên dùng), 'so2': Embed
let hlsRetryCount = 0;

// --- CACHE DỮ LIỆU ---
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
    const pYes = popup.querySelector('.popup-yes');
    const pNo = popup.querySelector('.popup-no');
    if(pYes) pYes.onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = false; nextEp(); };
    if(pNo) pNo.onclick = () => { clearTimeout(popupTimeout); popup.classList.remove('show'); warned = true; };
}

// === 1. HÀM HỖ TRỢ (UTILS) ===

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
    popupTimeout = setTimeout(() => {
        if (warned) { popup.classList.remove('show'); warned = false; }
    }, 10000);
}

function updateUrl(ep) {
    curEp = ep;
    history.replaceState(null, '', `?slug=${slug}&source=${srcCode}&e=${ep + 1}`);
}

function getPoster(m) {
    let u = m.poster_url || m.thumb_url || m.poster || '';
    // Xử lý lại link ảnh cho Ophim nếu cần
    if (srcName === 'Ophim' && u && !u.includes('/uploads/movies/')) {
        const n = u.split('/').pop().replace(/-poster\.jpg|-thumb\.jpg/g, '');
        u = `${cdn || 'https://img.ophim.live'}/uploads/movies/${n}-thumb.jpg`;
    }
    return u.includes('http') ? u : null;
}

// === 2. XỬ LÝ DỮ LIỆU PHIM ===

async function loadMovie() {
    // Kiểm tra cache trước
    if (movieCache.has(srcName)) {
        const cached = movieCache.get(srcName);
        applyData(cached);
        return true;
    }

    try {
        loading.style.display = 'flex';
        
        const r = await fetch(API[srcName], { cache: 'force-cache' });
        if (!r.ok) throw new Error('Lỗi kết nối API');
        const d = await r.json();

        let m = {}, epsList = [];
        
        // Parse dữ liệu tùy theo nguồn
        if (srcName === 'Nguonc') { 
            m = d.movie; epsList = m.episodes || []; 
        } else if (srcName === 'Phimapi') { 
            m = d.movie; epsList = d.episodes || []; 
        } else { 
            m = d.data.item; epsList = m.episodes || []; 
            cdn = d.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live'; 
        }

        const dataObj = {
            movie: m.name || m.title || 'Không rõ',
            poster: getPoster(m),
            plot: m.content || m.description || 'Đang cập nhật...',
            servers: epsList.map(g => ({
                name: g.server_name || `Server ${epsList.indexOf(g) + 1}`,
                data: (g.server_data || g.items || []).map(ep => ({
                    name: ep.name || `Tập ${ep.slug?.split('-').pop() || ''}`,
                    link_so1: srcName === 'Nguonc' ? '' : (ep.link_m3u8 || ep.m3u8 || ''),
                    link_so2: ep.link_embed || ep.embed || ''
                })).filter(ep => ep.link_so1 || ep.link_so2)
            })).filter(s => s.data.length > 0)
        };

        if (dataObj.servers.length === 0) throw new Error('Không có tập phim');

        movieCache.set(srcName, dataObj);
        applyData(dataObj);
        return true;

    } catch (e) {
        console.error(e);
        showError('Lỗi tải dữ liệu phim. Thử đổi nguồn (AX/BX/CX)?');
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

// === 3. RENDER GIAO DIỆN ===

function renderUI() {
    renderSourceModeBar();
    renderServerBar();
    renderGrid();
}

function renderSourceModeBar() {
    sourceModeBar.innerHTML = '';

    // Nút chọn Nguồn (Dropdown)
    const div = document.createElement('div');
    div.className = 'source-dropdown';
    div.style.position = 'relative';
    div.innerHTML = `
        <button class="btn active">${srcCode.toUpperCase()} <small>▼</small></button>
        <div class="dropdown" style="display:none; position:absolute; background:#333; z-index:100; min-width:120px; top:100%; left:0; flex-direction:column; box-shadow:0 4px 8px #000;">
            <button class="btn" style="border-radius:0; border-bottom:1px solid #555;" onclick="changeSource('ax')">AX (Ophim)</button>
            <button class="btn" style="border-radius:0; border-bottom:1px solid #555;" onclick="changeSource('bx')">BX (Phimapi)</button>
            <button class="btn" style="border-radius:0;" onclick="changeSource('cx')">CX (Nguonc)</button>
        </div>
    `;
    // Hiện dropdown khi hover
    div.onmouseover = () => div.querySelector('.dropdown').style.display = 'flex';
    div.onmouseout = () => div.querySelector('.dropdown').style.display = 'none';
    sourceModeBar.appendChild(div);

    // Nút Chế độ phát
    const hasSo1 = episodes.some(e => e.link_so1?.trim());
    const hasSo2 = episodes.some(e => e.link_so2?.trim());

    if (hasSo1) {
        sourceModeBar.appendChild(createBtn('🚀 Mượt (HQ)', currentPlayMode === 'so1', () => {
            currentPlayMode = 'so1'; play(curEp); renderSourceModeBar();
        }));
    }

    if (hasSo2) {
        sourceModeBar.appendChild(createBtn('📺 Dự phòng', currentPlayMode === 'so2', () => {
            currentPlayMode = 'so2'; play(curEp); renderSourceModeBar();
        }));
    }
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
        b.className = `btn ${i === curSrv ? 'active' : ''}`;
        b.textContent = `${s.name} (${s.data.length})`;
        b.onclick = () => switchServer(i);
        bar.appendChild(b));
    });
}

function renderGrid() {
    const g = document.getElementById('ep-grid');
    g.innerHTML = '';
    episodes.forEach((_, i) => {
        const b = document.createElement('div');
        b.className = `ep-btn ${i === curEp ? 'active' : ''}`;
        b.textContent = i + 1;
        b.onclick = () => play(i);
        g.appendChild(b);
    });
}

// === 4. CORE PLAYER (TỐI ƯU MẠNG YẾU) ===

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
    titleBar.textContent = `${movie} | Tập ${i + 1}`;

    const ep = episodes[i];
    resetPlayer();

    if ((currentPlayMode === 'so1') && ep.link_so1?.trim()) {
        initHLSPlayer(ep.link_so1.trim());
    } else if ((currentPlayMode === 'so2') && ep.link_so2?.trim()) {
        playEmbed(ep.link_so2.trim());
    } else if (ep.link_so1?.trim()) {
        currentPlayMode = 'so1';
        initHLSPlayer(ep.link_so1.trim());
    } else if (ep.link_so2?.trim()) {
        currentPlayMode = 'so2';
        playEmbed(ep.link_so2.trim());
    } else {
        showError('Tập này hiện chưa có link.');
    }
}

/**
 * KHỞI TẠO HLS PLAYER (TÍCH HỢP CẤU HÌNH MẠNG YẾU)
 */
function initHLSPlayer(m3u8Url) {
    resetPlayer();
    hlsRetryCount = 0;
    videoEl.style.display = 'block';

    if (Hls.isSupported()) {
        hls = new Hls({
            // --- CẤU HÌNH QUAN TRỌNG CHO MẠNG YẾU ---
            
            enableWorker: false,       // [QUAN TRỌNG] Tắt Worker để tránh lỗi âm thanh robot sau khi xem lâu
            lowLatencyMode: false,     // Tắt chế độ độ trễ thấp để ưu tiên buffer
            
            // Tăng bộ đệm (Buffer) để giữ video chạy khi mạng gập ghềnh
            maxBufferLength: 30,       // Giữ tối đa 30 giây video
            maxMaxBufferLength: 60,    // Cho phép nạp tới 60s nếu mạng nhanh
            maxBufferSize: 60 * 1000 * 1000,
            
            // Cài đặt chất lượng tự động (ABR)
            startLevel: -1,           // Bắt đầu bằng chất lượng tự động
            abrEwmaDefaultEstimate: 500000, // Ước lượng băng thông ban đầu thấp (480p) để load nhanh
            abrBandWidthFactor: 0.85,      // Nhạy hơn với việc hạ chất lượng khi lag
            abrBandWidthUpFactor: 0.5,     // Chậm hơn khi nâng chất lượng (tránh bị nghẽn)
            
            // Tăng thời gian chờ (Timeout) cho mạng yếu
            manifestLoadingTimeOut: 20000, // Chờ file playlist 20s
            levelLoadingTimeOut: 15000,    // Chờ info 15s
            fragLoadingTimeOut: 25000,     // [QUAN TRỌNG] Chờ từng file .ts 25s (mặc định 10-20s quá ngắn)
            
            // Số lần thử lại (Retry)
            manifestLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 4,
            fragLoadingMaxRetry: 5,        // Thử tải lại file .ts 5 lần nếu fail
            
            progressive: false,        // Tắt chế độ tải tiến triển (giảm lỗi trên mobile)
            
            // Xử lý Request (KHÔNG DÙNG PROXY)
            xhrSetup: (xhr, url) => {
                xhr.open('GET', url, true);
                xhr.timeout = 30000; // Timeout cứng 30s
            }
        });

        hls.loadSource(m3u8Url);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            loading.style.display = 'none';
            videoEl.play().catch(e => showToast('Bấm vào màn hình để phát'));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS Error:", data);
            
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // Nếu lỗi mạng nhưng chưa quá số lần retry -> Thử lại
                        if (hlsRetryCount < 3) {
                            hlsRetryCount++;
                            showToast(`Mạng kém, đang thử lại (${hlsRetryCount}/3)...`);
                            hls.startLoad();
                        } else {
                            // Đã thử đủ 3 lần vẫn lỗi -> Chuyển sang Link Dự phòng (Embed)
                            handleFatalError('M3U8 lỗi liên tục, đang chuyển sang server dự phòng...');
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        showToast('Lỗi giải mã, đang khôi phục...');
                        hls.recoverMediaError();
                        break;
                    default:
                        handleFatalError('Lỗi không xác định');
                        break;
                }
            }
        });
        
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback cho iOS (iPhone/iPad)
        videoEl.src = m3u8Url;
        videoEl.addEventListener('loadedmetadata', () => {
            loading.style.display = 'none';
            videoEl.play().catch(()=>{});
        });
    } else {
        showError('Trình duyệt không hỗ trợ xem phim');
    }

    setupVideoEvents();
}

function playEmbed(url) {
    resetPlayer();
    embedFrame.src = url;
    embedFrame.style.display = 'block';
    embedFrame.onload = () => {
        loading.style.display = 'none';
        videoEl.style.display = 'none';
    };
}

function handleFatalError(msg) {
    showToast(msg);
    if(hls) { hls.destroy(); hls = null; }
    
    const ep = episodes[curEp];
    
    // Chiến thuật chuyển đổi thông minh:
    // 1. Nếu đang ở Mode So1 (M3U8) mà chết -> Chuyển sang So2 (Embed)
    if (currentPlayMode === 'so1' && ep.link_so2) {
        currentPlayMode = 'so2';
        playEmbed(ep.link_so2);
        renderSourceModeBar();
    } else {
        showError('Video không khả dụng. Vui lòng đổi Server.');
    }
}

// === 5. XỬ LÝ SỰ KIỆN VIDEO ===

function setupVideoEvents() {
    // Xóa listener cũ tránh trùng lặp
    videoEl.removeEventListener('timeupdate', timeUpdateHandler);
    videoEl.removeEventListener('ended', endedHandler);
    
    videoEl.addEventListener('timeupdate', timeUpdateHandler);
    videoEl.addEventListener('ended', endedHandler);
    videoEl._hasSkippedMid = false; // Reset flag bỏ qua intro
}

function timeUpdateHandler() {
    const t = videoEl.currentTime;
    const d = videoEl.duration;
    if (!d || isNaN(d)) return;

    // Logic bỏ qua Intro (Cấu hình điểm nhảy tại đây)
    const skipPoint = 90; // Bỏ qua ở giây thứ 90
    const skipDuration = 40; // Bỏ qua 40 giây

    if (!videoEl._hasSkippedMid && t >= skipPoint && t < skipPoint + 10) {
        if (skipPoint + skipDuration < d) {
            videoEl.currentTime = skipPoint + skipDuration;
            showToast('Đã bỏ qua giới thiệu');
            videoEl._hasSkippedMid = true;
        }
    }

    // Popup hỏi xem tiếp (khi còn 120s cuối phim)
    if (!warned && d > 0 && t >= d - 120 && curEp < episodes.length - 1) {
        showEndPopup();
    }
}

function endedHandler() {
    if (curEp < episodes.length - 1 && !warned) nextEp();
}

// === 6. ĐIỀU HƯỞNG CHUNG ===

function switchServer(i) {
    if (i < 0 || i >= servers.length) return;
    curSrv = i;
    episodes = servers[i].data;
    curEp = Math.min(curEp, episodes.length - 1);
    renderUI();
    play(curEp);
}

window.changeSource = async function(code) {
    if (code === srcCode) return;
    srcCode = code;
    srcName = srcMap[code];
    movieCache.delete(srcName); // Xóa cache cũ
    if (await loadMovie()) {
        curSrv = 0;
        switchServer(0);
    }
};

function prevEp() { if (curEp > 0) play(curEp - 1); else showToast('Đang ở tập đầu'); }
function nextEp() { if (curEp < episodes.length - 1) play(curEp + 1); else showToast('Đã hết phim'); }

function markEp(i) {
    document.querySelectorAll('.ep-btn').forEach((b, k) => b.classList.toggle('active', k === i));
}
function showError(msg) {
    if(errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'flex';
    }
    if(loading) loading.style.display = 'none';
}

// === 7. KHỞI CHẠY ===
async function init() {
    if (!slug) { showError('Thiếu Slug phim.'); return; }
    await loadMovie();
    if (servers.length > 0) {
        const startEp = parseInt(params.get('e')) > 0 ? parseInt(params.get('e')) - 1 : 0;
        switchServer(0);
        if(startEp > 0) play(startEp);
        else play(0);
    }
}

init();
