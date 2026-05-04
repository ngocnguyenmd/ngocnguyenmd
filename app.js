// ==================== CẤU HÌNH TMDB (TỰ ĐỘNG POSTER) ====================
const TMDB_API_KEY = 'c1ba4826351c415243b3d8ea82a77cd7';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'; // w300 cân bằng giữa nét và tải nhanh

// ==================== BẢNG ĐỒ SLUG ====================
const GENRE_SLUG_MAP = {
  'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai',
  'Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich',
  'Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di',
  'Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man',
  'Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can',
  'Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay',
  'Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong',
  'Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien'
};

const COUNTRY_SLUG_MAP = {
  'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban',
  'Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap',
  'Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan',
  'Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia',
  'Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach',
  'Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut',
  'Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi',
  'Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi',
  'Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile',
  'Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore',
  'Quốc Gia Khác': 'quoc-gia-khac'
};

const CUTEE_MENU = {
  'Phim mới': { mode: 'default' },
  'Phim bộ': { mode: 'type', filter: 'phim-bo' },
  'Phim lẻ': { mode: 'type', filter: 'phim-le' },
  'Shows': { mode: 'cutee', slug: 'tv-shows' },
  'Hoạt hình': { mode: 'cutee', slug: 'hoat-hinh' },
  'Phim vietsub': { mode: 'cutee', slug: 'vietsub' },
  'Phim thuyết minh': { mode: 'cutee', slug: 'thuyet-minh' },
  'Phim lồng tiếng': { mode: 'cutee', slug: 'long-tieng' },
  'Phim bộ đang chiếu': { mode: 'cutee', slug: 'phim-dang-chieu' },
  'Phim bộ đã hoàn thành': { mode: 'cutee', slug: 'hoan-tat' },
  'Phim sắp chiếu': { mode: 'cutee', slug: 'phim-sap-chieu' },
  'Subteam': { mode: 'cutee', slug: 'subteam' },
  'Phim chiếu rạp': { mode: 'cutee', slug: 'phim-chieu-rap' }
};

// ==================== API SOURCES ====================
const API_SOURCES = {
  Ophim: {
    name: 'Ophim', code: 'ax',
    defaultUrl: p => `https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s, p) => `https://ophim1.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s, p) => `https://ophim1.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y, p) => `https://ophim1.com/v1/api/nam-phat-hanh/${y}?page=${p}`,
    typeUrl: (t, p) => `https://ophim1.com/v1/api/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s, p) => `https://ophim1.com/v1/api/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://ophim1.com/v1/api/phim/${s}`,
    keywordSearchUrl: (k, p = 1) => `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.data?.items || [],
    searchParser: d => d?.data?.item ? [d.data.item] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: () => "https://img.ophim.live/uploads/movies/"
  },
  Phimapi: {
    name: 'Phimapi', code: 'bx',
    defaultUrl: p => `https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${p}`,
    genreUrl: (s, p) => `https://phimapi.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s, p) => `https://phimapi.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y, p) => `https://phimapi.com/v1/api/nam/${y}?page=${p}`,
    typeUrl: (t, p) => `https://phimapi.com/v1/api/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s, p) => `https://phimapi.com/v1/api/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://phimapi.com/phim/${s}`,
    keywordSearchUrl: (k, p = 1) => `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.data?.items || d?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: d => (d?.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/').replace(/\/+$/, '') + '/'
  },
  Nguonc: {
    name: 'Nguonc', code: 'cx',
    defaultUrl: p => `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s, p) => `https://phim.nguonc.com/api/films/danh-sach/${s}?page=${p}`,
    countryUrl: (s, p) => `https://phim.nguonc.com/api/films/quoc-gia/${s}?page=${p}`,
    yearUrl: (y, p) => `https://phim.nguonc.com/api/films/nam-phat-hanh/${y}?page=${p}`,
    typeUrl: (t, p) => `https://phim.nguonc.com/api/films/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s, p) => `https://phim.nguonc.com/api/films/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://phim.nguonc.com/api/film/${s}`,
    keywordSearchUrl: (k, p = 1) => `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    keywordParser: d => d?.items || [],
    getCdn: () => "https://phim.nguonc.com/public/images/Poster/"
  }
};

// ==================== GIỚI HẠN SỐ LƯỢNG ====================
const SOURCE_LIMITS = {
  'ax': 5, // Ophim
  'bx': 5, // Phimapi
  'cx': 10 // Nguonc
};

// ==================== FETCH LOGIC (PROXY CHO NGUONC) ====================
const fetchDirect = async (url, sourceCode = '') => {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000); 
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (r.ok) return await r.json();
  } catch (e) {
    if (e.name !== 'AbortError') {
        console.warn(`[Fetch Error] ${sourceCode} (Direct):`, e);
    }

    // CHỈ ÁP DỤNG PROXY CHO NGUONC (CX)
    if (sourceCode === 'cx') {
      try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        console.log(`[Proxy] Trying for ${sourceCode}:`, proxyUrl);
        
        const r = await fetch(proxyUrl);
        if (r.ok) {
            const data = await r.json();
            console.log(`[Proxy] Success for ${sourceCode}`);
            return data;
        }
      } catch (proxyErr) {
        console.error(`[Proxy Error] ${sourceCode}:`, proxyErr);
      }
    }
  }
  return null;
};

// ==================== CACHE & STATE ====================
const API_CACHE = {};
let ITEMS_PER_PAGE = 20; 
let currentMode = 'default';
let currentFilter = null;
let currentPage = 1;
let currentSearchQuery = '';
let currentGenre = null;
let currentCountry = null;
let currentYear = null;
let combinedFilterMode = false;

const STATE_KEY = 'phim_state';
const saveState = () => localStorage.setItem(STATE_KEY, JSON.stringify({
  mode: currentMode, filter: currentFilter, page: currentPage, search: currentSearchQuery,
  genre: currentGenre, country: currentCountry, year: currentYear, combined: combinedFilterMode
}));
const loadState = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    if (s.mode) {
      currentMode = s.mode; currentFilter = s.filter; currentPage = s.page || 1;
      currentSearchQuery = s.search || ''; currentGenre = s.genre || null;
      currentCountry = s.country || null; currentYear = s.year || null;
      combinedFilterMode = s.combined === true;
    }
  } catch {}
};
const clearState = () => localStorage.removeItem(STATE_KEY);

// ==================== HELPERS ====================
const getEpisodeDisplay = i => {
  if (!i) return '';
  const m = i.movie || i;
  const e = i.episodes || m.episodes || [];
  if (!m.episode_current && !m.current_episode && !m.episode_total && !m.total_episodes && !Array.isArray(e))
    return (m.type || m.tmdb?.type) === 'tv' ? 'Phim bộ' : 'Phim lẻ';
  let c = '', t = '', l = 0;
  const cur = m.episode_current || m.current_episode || '';
  const tot = m.episode_total || m.total_episodes || '';
  const cm = cur.match(/Tập (\d+)/i) || cur.match(/(\d+)/);
  if (cm) c = cm[1];
  if (tot) t = tot;
  if (Array.isArray(e)) e.forEach(s => { const d = s.server_data || s.items || []; if (Array.isArray(d)) l += d.length; });
  let disp = c && t ? `Tập ${c}/${t}` : c ? `Tập ${c}` : /full|hoàn tất|hoàn thành/i.test(cur) ? 'Hoàn tất' : 'Đang phát';
  if (l > 0) disp += ` (${l} link)`;
  return disp;
};

// ==================== FETCH & PARSE DATA ====================
const fetchFromSource = async (src, p, m, f, genre = null, country = null, year = null, isS = false, isK = false) => {
  const cacheKey = `${src.code}-${m}-${f}-${p}-${genre}-${country}-${year}-${isS}-${isK}`;
  if (API_CACHE[cacheKey]) return API_CACHE[cacheKey];

  let url = '';

  if (isK) url = src.keywordSearchUrl(f, p);
  else if (isS) url = src.searchUrl(f);
  else if (m === 'combined') {
    let base = '';
    if (src.code === 'ax') {
      if (genre) base = `https://ophim1.com/v1/api/the-loai/${genre}`;
      else if (country) base = `https://ophim1.com/v1/api/quoc-gia/${country}`;
      else if (year) base = `https://ophim1.com/v1/api/nam-phat-hanh/${year}`;
      else base = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat';
      const params = new URLSearchParams({ page: p });
      if (genre && !base.includes('/the-loai/')) params.append('genre', genre);
      if (country && !base.includes('/quoc-gia/')) params.append('country', country);
      if (year && !base.includes('/nam-phat-hanh/')) params.append('year', year);
      url = base + (base.includes('?') ? '&' : '?') + params.toString();
    } else if (src.code === 'bx') {
      base = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat-v1';
      if (genre) base = `https://phimapi.com/v1/api/the-loai/${genre}`;
      const params = new URLSearchParams({ page: p });
      if (country) params.append('country', country);
      if (year) params.append('year', year);
      url = base + (base.includes('?') ? '&' : '?') + params.toString();
    } else {
      if (genre) url = src.genreUrl(genre, p);
      else if (country) url = src.countryUrl(country, p);
      else if (year) url = src.yearUrl(year, p);
      else url = src.defaultUrl(p);
    }
  } else if (m === 'genre') url = src.genreUrl(genre, p);
  else if (m === 'country') url = src.countryUrl(country, p);
  else if (m === 'year') url = src.yearUrl(year, p);
  else if (m === 'type' || m === 'cutee') url = (src.cuteeUrl || src.typeUrl)(f, p);
  else url = src.defaultUrl(p);

  const d = await fetchDirect(url, src.code);
  if (!d) return [];

  const parser = isK ? src.keywordParser : isS ? src.searchParser : src.parser;
  let items = parser(d) || [];
  const cdn = typeof src.getCdn === 'function' ? src.getCdn(d) : src.getCdn();

  const result = items.map(it => {
    let thumb = '';
    if (src.code === 'ax') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
    if (src.code === 'bx') thumb = it.poster_url || it.thumb_url || it.poster || it.thumb || '';
    if (src.code === 'cx') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';

    if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//') && cdn)
      thumb = cdn + thumb.replace(/^\/+/, '');

    return {
      name: it.name || it.origin_name || it.title || 'Không rõ',
      thumb_url: thumb, // Ảnh gốc giữ làm dự phòng
      episodeDisplay: getEpisodeDisplay(it),
      slug: it.slug || it._id || '',
      sourceCode: src.code,
      sourceName: src.name,
      year: (it.year || '').toString(),
      lang: (it.lang || '').toUpperCase(),
      quality: it.quality || ''
    };
  }).filter(x => x.slug && x.thumb_url);

  API_CACHE[cacheKey] = result;
  return result;
};

// ==================== FETCH ẢNH TỪ TMDB ====================
const fetchTmdbImage = async (movieName, movieYear) => {
  if (!movieName) return null;
  
  try {
    const query = encodeURIComponent(movieName);
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=vi-VN&query=${query}&year=${movieYear}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const posterPath = data.results[0].poster_path;
      if (posterPath) return posterPath;
    }
  } catch (e) {
    console.error("Lỗi TMDB:", e);
  }
  return null;
};

// ==================== UI LOGIC ====================
let streamState = { loaded: 0, total: 0 };

const updateProg = id => {
  streamState.loaded++;
  const bar = document.getElementById(id);
  if (bar && streamState.total > 0) {
    const pct = (streamState.loaded / streamState.total * 100);
    bar.style.width = pct + '%';
  }
};

const updateTotalUI = (id) => {
  streamState.total++;
  const bar = document.getElementById(id);
  if (bar && streamState.total > 0) {
    const pct = (streamState.loaded / streamState.total * 100);
    bar.style.width = pct + '%';
  }
};

const appendItem = (m, container, id, seenSet) => {
  if (seenSet.has(m.slug)) return false; 

  seenSet.add(m.slug); 
  updateTotalUI(id); 

  const c = document.createElement('div');
  c.className = 'movie-item';
  c.dataset.slug = m.slug;
  c.dataset.source = m.sourceCode; 
  c.onclick = () => { saveState(); location.href = `detail.html?slug=${m.slug}&source=${m.sourceCode}`; };

  const epTag = document.createElement('div');
  epTag.className = 'movie-ep-tag';
  epTag.textContent = m.episodeDisplay || '';
  if (!epTag.textContent) epTag.style.display = 'none';

  const topRight = document.createElement('div');
  topRight.className = 'movie-top-right';

  const qualityTag = document.createElement('div');
  qualityTag.className = 'movie-quality-tag';
  qualityTag.textContent = m.quality || '';
  if (!qualityTag.textContent) qualityTag.style.display = 'none';

  const sourceTag = document.createElement('div');
  sourceTag.className = 'movie-source-tag';
  sourceTag.textContent = m.sourceCode || '';

  topRight.append(qualityTag, sourceTag);

  const langTag = document.createElement('div');
  langTag.className = 'movie-lang-tag';
  langTag.textContent = m.lang || "Vietsub";

  const yearTag = document.createElement('div');
  yearTag.className = 'movie-year-tag';
  yearTag.textContent = m.year || '';
  if (!yearTag.textContent) yearTag.style.display = 'none';

  const titleTag = document.createElement('div');
  titleTag.className = 'movie-title';
  titleTag.textContent = m.name;

  const imgReal = document.createElement('img');
  imgReal.className = 'movie-img-real';
  imgReal.loading = 'lazy';
  
  const finishLoading = () => {
    imgReal.style.opacity = '1';
    imgReal.parentElement.classList.add('loaded');
    updateProg(id); 
  };

  const handleLoadError = () => {
    updateProg(id);
  };

  imgReal.onload = finishLoading;
  imgReal.onerror = handleLoadError;

  const imgPlaceholder = document.createElement('div');
  imgPlaceholder.className = 'movie-img-placeholder';

  const imgContainer = document.createElement('div');
  imgContainer.className = 'movie-img-container';
  imgContainer.append(imgReal, imgPlaceholder, epTag, topRight, langTag, yearTag, titleTag);
  c.appendChild(imgContainer);

  container.appendChild(c);

  // ==================== LOGIC LOAD ẢNH (TMDB CHO AX, BX) ====================
  (async () => {
    let finalImageSrc = '';

    // CHỈ TÌM TMDB CHO VÀNG NGUỒN AX VÀ BX (Yêu cầu của bạn)
    if (m.sourceCode === 'ax' || m.sourceCode === 'bx') {
      const tmdbPath = await fetchTmdbImage(m.name, m.year);
      
      if (tmdbPath) {
        finalImageSrc = TMDB_IMAGE_BASE + tmdbPath;
        // Nếu dùng ảnh TMDB, đổi tag nguồn thành TMDB để phân biệt
        sourceTag.textContent = 'TMDB';
        sourceTag.style.color = '#ffcc00'; // Tô màu vàng cho TMDB
      } else {
        // Nếu TMDB không có ảnh, dùng lại ảnh nguồn (Fallback)
        finalImageSrc = m.thumb_url || '';
      }
    } else {
      // Cx (Nguonc) hoặc các nguồn khác: Dùng ảnh nguồn trực tiếp
      finalImageSrc = m.thumb_url || '';
    }

    if (finalImageSrc) {
      imgReal.src = finalImageSrc;
    } else {
      handleLoadError();
    }
  })();

  return true; 
};

// ==================== CORE LOAD LOGIC ====================
const processStream = async (container, sources, p, mode, filter, genre, country, year, isSearch, isKeyword, sid) => {
  container.innerHTML = '';
  streamState = { loaded: 0, total: 0 };
  const progId = `${sid}-progress`;
  
  const seenSlugs = new Set();
  const sourceCounts = { ax: 0, bx: 0, cx: 0 };

  const handleSource = async (src) => {
    try {
      const items = await fetchFromSource(src, p, mode, filter, genre, country, year, isSearch, isKeyword);
      const limit = SOURCE_LIMITS[src.code] || 5; 
      
      for (const m of items) {
        if (sourceCounts[src.code] >= limit) break;
        
        const added = appendItem(m, container, progId, seenSlugs);
        if (added) sourceCounts[src.code]++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const promises = sources.map(src => handleSource(src));
  await Promise.all(promises);

  setTimeout(() => {
    document.getElementById(`${progId}-cont`)?.classList.add('done');
    const totalRendered = sourceCounts.ax + sourceCounts.bx + sourceCounts.cx;
    if (totalRendered === 0) {
      container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px;color:#aaa;">Không tìm thấy kết quả hoặc API chậm.</div>';
    }
  }, 500);

  return sourceCounts.ax + sourceCounts.bx + sourceCounts.cx;
};

// ==================== SECTION & PAGINATION ====================
const createSec = (id, title) => {
  const s = document.createElement('div');
  s.className = 'section';
  s.id = id;
  s.innerHTML = `<div class="progress-container" id="${id}-progress-cont"><div class="progress-bar" id="${id}-progress"></div></div><div class="container"><div class="section-header">${title}</div><div class="movie-grid" id="${id}-grid"></div><div class="pagination" id="${id}-pagination"></div></div>`;
  return s;
};

const showSec = sec => {
  document.querySelectorAll('#main-content > .section').forEach(x => x.style.display = 'none');
  const c = document.getElementById('main-content');
  const ex = document.getElementById(sec.id);
  if (ex) { ex.style.display = 'block'; c.insertBefore(ex, c.firstChild); }
  else { c.insertBefore(sec, c.firstChild); sec.style.display = 'block'; }
};

const renderPag = (p, sid, more) => {
  const el = document.getElementById(`${sid}-pagination`);
  if (!el) return;
  el.innerHTML = '';

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '‹';
  prev.disabled = p === 1;
  prev.onclick = () => {
    currentPage = p - 1;
    if (currentSearchQuery) search(currentSearchQuery, currentPage);
    else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear);
  };
  el.appendChild(prev);

  for (let i = Math.max(1, p - 3); i <= p + 4; i++) {
    const b = document.createElement('button');
    b.className = 'page-btn';
    if (i === p) b.classList.add('active');
    b.textContent = i;
    b.onclick = () => {
      currentPage = i;
      if (currentSearchQuery) search(currentSearchQuery, currentPage);
      else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear);
    };
    el.appendChild(b);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '›';
  next.disabled = !more;
  next.onclick = () => {
    currentPage = p + 1;
    if (currentSearchQuery) search(currentSearchQuery, currentPage);
    else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear);
  };
  el.appendChild(next);
};

// ==================== GET TITLE ====================
const getTitle = (m, f, g, c, y) => {
  if (m === 'default') return 'PHIM MỚI CẬP NHẬT';
  if (m === 'combined') {
    const parts = [];
    if (g) parts.push(`THỂ LOẠI: ${Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === g)?.toUpperCase() || g.toUpperCase()}`);
    if (c) parts.push(`QUỐC GIA: ${Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === c)?.toUpperCase() || c.toUpperCase()}`);
    if (y) parts.push(`NĂM: ${y}`);
    return parts.length ? parts.join(' • ') : 'PHIM';
  }
  if (m === 'genre') return `THỂ LOẠI: ${Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === f)?.toUpperCase() || f.toUpperCase()}`;
  if (m === 'country') return `QUỐC GIA: ${Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === f)?.toUpperCase() || f.toUpperCase()}`;
  if (m === 'year') return `NĂM: ${f}`;
  if (m === 'type') return { 'phim-bo': 'PHIM BỘ', 'phim-le': 'PHIM LẺ' }[f] || f.toUpperCase();
  if (m === 'cutee') {
    const l = Object.keys(CUTEE_MENU).find(k => CUTEE_MENU[k].slug === f || CUTEE_MENU[k].filter === f);
    return l?.toUpperCase() || f.toUpperCase().replace(/-/g, ' ');
  }
  return f?.toUpperCase() || 'PHIM';
};

// ==================== LOAD ====================
const load = async (m, f = null, p = 1, g = null, c = null, y = null) => {
  currentSearchQuery = '';
  if (document.getElementById('nav-search-input')) document.getElementById('nav-search-input').value = '';

  currentMode = m;
  currentFilter = f;
  currentPage = p;

  if (m === 'genre') { currentGenre = f; currentCountry = c; currentYear = y; }
  else if (m === 'country') { currentGenre = null; currentCountry = f; currentYear = y; }
  else if (m === 'year') { currentGenre = null; currentCountry = null; currentYear = f; }
  else if (m === 'combined') { currentGenre = g; currentCountry = c; currentYear = y; }
  else { currentGenre = null; currentCountry = null; currentYear = null; }

  if (m === 'default') {
    document.querySelectorAll('#main-content > .section').forEach(x => x.remove());
    loadTxt();
    saveState();
    return;
  }

  const title = getTitle(m, f, currentGenre, currentCountry, currentYear);
  const sid = `${m}-${f || ''}-${currentGenre || ''}-${currentCountry || ''}-${currentYear || ''}-sec`.replace(/--+/g, '-');
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, title);

  showSec(sec);
  const grid = document.getElementById(`${sid}-grid`);
  
  let sources = Object.values(API_SOURCES);

  const finalCount = await processStream(grid, sources, p, m, f, currentGenre, currentCountry, currentYear, false, false, sid);
  
  renderPag(p, sid, finalCount >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

// ==================== TÌM KIẾM ====================
const search = async (q = null, p = 1) => {
  const raw = (q || document.getElementById('nav-search-input')?.value || '').trim();
  if (!raw) return load('default');
  currentSearchQuery = raw;
  currentPage = p;
  currentGenre = null; currentCountry = null; currentYear = null;

  const sid = 'search-sec';
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, `TÌM: "${raw}"`);
  else sec.querySelector('.section-header').textContent = `TÌM: "${raw}"`;

  showSec(sec);
  const grid = document.getElementById(`${sid}-grid`);

  const processSearchStream = async (container, sources, p, keyword, sid) => {
    container.innerHTML = '';
    streamState = { loaded: 0, total: 0 };
    const progId = `${sid}-progress`;
    const seenSlugs = new Set();
    const sourceCounts = { ax: 0, bx: 0, cx: 0 };

    const handleSource = async (src) => {
      try {
        const [slugItems, keyItems] = await Promise.all([
          fetchFromSource(src, p, null, keyword, null, null, null, true, false),
          fetchFromSource(src, p, null, keyword, null, null, null, false, true)
        ]);
        const all = [...slugItems, ...keyItems];
        const limit = SOURCE_LIMITS[src.code] || 5;

        for (const m of all) {
          if (sourceCounts[src.code] >= limit) break;
          const added = appendItem(m, container, progId, seenSlugs);
          if (added) sourceCounts[src.code]++;
        }
      } catch (e) {}
    };

    await Promise.all(sources.map(src => handleSource(src)));
    
    setTimeout(() => {
      document.getElementById(`${progId}-cont`)?.classList.add('done');
      const totalRendered = sourceCounts.ax + sourceCounts.bx + sourceCounts.cx;
      if (totalRendered === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px;color:#aaa;">Không tìm thấy kết quả.</div>';
      }
    }, 500);

    return sourceCounts.ax + sourceCounts.bx + sourceCounts.cx;
  };

  const finalCount = await processSearchStream(grid, Object.values(API_SOURCES), p, raw, sid);
  renderPag(p, sid, finalCount >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

// ==================== LOAD TXT (XỬ LÝ FILE LOCAL) ====================
const loadTxt = async () => {
  // XỬ LÝ LỖI CORS KHI CHẠY LOCAL
  if (window.location.protocol === 'file:') {
    console.warn("Chạy trên local file://, bỏ qua load trangchu.txt");
    return;
  }

  try {
    const r = await fetch('./trangchu.txt?t=' + Date.now());
    if (!r.ok) throw 1;
    const txt = await r.text();
    if (!txt.trim()) throw 1;
    const groups = parseTxt(txt);
    const promises = Object.entries(groups).map(([name, items]) => {
      if (items.length) return loadGroup(name, items);
      return Promise.resolve();
    });
    await Promise.all(promises);
  } catch {
    document.getElementById('main-content').innerHTML = '<div class="container"><h2 style="text-align:center;padding:100px;color:#aaa;">Chưa có dữ liệu trangchu.txt (hoặc lỗi khi tải).</h2></div>';
  }
  saveState();
};

const parseTxt = txt => {
  const lines = txt.split('\n');
  const g = {};
  let cur = null;

  lines.forEach(l => {
    l = l.trim();
    if (!l) return;
    if (l.startsWith('#')) {
      cur = l.substring(1).trim();
      if (!g[cur]) g[cur] = [];
      return;
    }
    if (!cur) return;
    const p = l.split('|');
    if (p.length < 2) return;
    const [st, sk, dt] = p.map(x => x.trim());
    const sl = st.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    g[cur].push({ slug: sl, source: sk.toLowerCase(), display: dt || st });
  });

  return g;
};

const loadGroup = async (name, items) => {
  const sid = `txt-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, name);
  const cont = document.getElementById('main-content');
  if (!document.getElementById(sid)) cont.appendChild(sec);
  sec.style.display = 'block';
  const grid = document.getElementById(`${sid}-grid`);

  const handleTxtItem = async (item) => {
    const src = Object.values(API_SOURCES).find(s => s.name.toLowerCase() === item.source);
    if (!src) return;
    const m = (await fetchFromSource(src, null, null, item.slug, null, null, null, true, false))[0];
    if (m) appendItem(m, grid, `${sid}-progress`, new Set()); 
  };

  grid.innerHTML = '';
  streamState = { loaded: 0, total: 0 };
  await Promise.all(items.map(handleTxtItem));
  document.getElementById(`${sid}-pagination`).style.display = 'none';
  setTimeout(() => document.getElementById(`${sid}-progress-cont`)?.classList.add('done'), 500);
};

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  if (currentSearchQuery) {
    if (document.getElementById('nav-search-input')) document.getElementById('nav-search-input').value = currentSearchQuery;
    search(currentSearchQuery, currentPage);
  } else if (currentMode !== 'default') {
    load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear);
  } else {
    loadTxt();
  }

  const hamburger = document.getElementById('hamburger');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  const openModal = (t, items, cb) => {
    modalTitle.textContent = t;
    modalBody.innerHTML = '';
    document.querySelectorAll('.modal-item.active').forEach(x => x.classList.remove('active'));
    items.forEach(it => {
      const d = document.createElement('div');
      d.className = 'modal-item';
      d.textContent = it;
      d.onclick = () => {
        document.querySelectorAll('.modal-item.active').forEach(x => x.classList.remove('active'));
        d.classList.add('active');
        cb(it);
      };
      modalBody.appendChild(d);
    });
    modalBackdrop.classList.add('show');
  };

  const closeModal = () => modalBackdrop.classList.remove('show');

  if (modalClose) modalClose.onclick = closeModal;
  if (modalBackdrop) modalBackdrop.onclick = e => { if (e.target === modalBackdrop) closeModal(); };

  if (hamburger) {
    hamburger.onclick = () =>
      openModal(
        'MENU',
        ['Trang chủ', 'Thể Loại', 'Quốc Gia', 'Năm', 'Khác', 'Phim Bộ', 'Phim Lẻ', 'Cinemax'],
        v => {
          if (v === 'Trang chủ') { clearState(); location.reload(); return; }
          if (v === 'Thể Loại') {
            openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), genreName => {
              const genreSlug = GENRE_SLUG_MAP[genreName];
              openModal('LỌC KẾT HỢP', ['Bật (Tốc độ cao)', 'Tắt (Nhiều kết quả)', 'Chỉ lọc thể loại'], choice => {
                if (choice === 'Chỉ lọc thể loại') {
                  combinedFilterMode = false;
                  load('genre', genreSlug, 1);
                  closeModal();
                } else {
                  combinedFilterMode = choice === 'Bật (Tốc độ cao)';
                  openModal('QUỐC GIA', ['Tất cả', ...Object.keys(COUNTRY_SLUG_MAP)], countryName => {
                    const countrySlug = countryName === 'Tất cả' ? null : COUNTRY_SLUG_MAP[countryName];
                    openModal('NĂM', ['Tất cả', ...Array.from({ length: 25 }, (_, i) => 2026 - i)], yearStr => {
                      const year = yearStr === 'Tất cả' ? null : yearStr;
                      load('combined', null, 1, genreSlug, countrySlug, year);
                      closeModal();
                    });
                  });
                }
              });
            });
            return;
          }
          if (v === 'Quốc Gia') { openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1)); return; }
          if (v === 'Năm') { openModal('NĂM', Array.from({ length: 25 }, (_, i) => 2026 - i), x => load('year', x, 1)); return; }
          if (v === 'Khác') { openModal('KHÁC', Object.keys(CUTEE_MENU), x => { const c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); }); return; }
          if (v === 'Phim Bộ') { load('type', 'phim-bo', 1); closeModal(); return; }
          if (v === 'Phim Lẻ') { load('type', 'phim-le', 1); closeModal(); return; }
          if (v === 'Cinemax') { load('cutee', 'phim-chieu-rap', 1); closeModal(); return; }
        }
      );
  }

  document.querySelectorAll('.menu-trigger').forEach(el => {
    el.onclick = e => {
      e.preventDefault();
      const t = el.dataset.target;
      if (t === 'genre') {
        openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), genreName => {
          const genreSlug = GENRE_SLUG_MAP[genreName];
          openModal('LỌC KẾT HỢP', ['Bật (Tốc độ cao)', 'Tắt (Nhiều kết quả)', 'Chỉ lọc thể loại'], choice => {
            if (choice === 'Chỉ lọc thể loại') { combinedFilterMode = false; load('genre', genreSlug, 1); closeModal(); }
            else {
              combinedFilterMode = choice === 'Bật (Tốc độ cao)';
              openModal('QUỐC GIA', ['Tất cả', ...Object.keys(COUNTRY_SLUG_MAP)], countryName => {
                const countrySlug = countryName === 'Tất cả' ? null : COUNTRY_SLUG_MAP[countryName];
                openModal('NĂM', ['Tất cả', ...Array.from({ length: 25 }, (_, i) => 2026 - i)], yearStr => {
                  const year = yearStr === 'Tất cả' ? null : yearStr;
                  load('combined', null, 1, genreSlug, countrySlug, year);
                  closeModal();
                });
              });
            }
          });
        });
      }
      if (t === 'country') openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1));
      if (t === 'year') openModal('NĂM', Array.from({ length: 25 }, (_, i) => 2026 - i), x => load('year', x, 1));
      if (t === 'cutee') openModal('KHÁC', Object.keys(CUTEE_MENU), x => { const c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); });
    };
  });

  document.getElementById('home-link')?.addEventListener('click', e => { e.preventDefault(); clearState(); location.reload(); });
  document.getElementById('phim-bo')?.addEventListener('click', e => { e.preventDefault(); load('type', 'phim-bo', 1); });
  document.getElementById('phim-le')?.addEventListener('click', e => { e.preventDefault(); load('type', 'phim-le', 1); });
  document.getElementById('phim-chieu-rap')?.addEventListener('click', e => { e.preventDefault(); load('cutee', 'phim-chieu-rap', 1); });

  document.getElementById('nav-search-btn')?.addEventListener('click', () => search());
  document.getElementById('nav-search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') search(); });
});
