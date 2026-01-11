const GENRE_SLUG_MAP = { 'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai','Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich','Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di','Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man','Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can','Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay','Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong','Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien' };
const COUNTRY_SLUG_MAP = { 'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban','Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap','Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan','Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia','Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach','Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut','Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi','Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi','Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile','Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore','Quốc Gia Khác': 'quoc-gia-khac' };
const CUTEE_MENU = { 'Phim mới': { mode: 'default' },'Phim bộ': { mode: 'type', filter: 'phim-bo' },'Phim lẻ': { mode: 'type', filter: 'phim-le' },'Shows': { mode: 'cutee', slug: 'tv-shows' },'Hoạt hình': { mode: 'cutee', slug: 'hoat-hinh' },'Phim vietsub': { mode: 'cutee', slug: 'vietsub' },'Phim thuyết minh': { mode: 'cutee', slug: 'thuyet-minh' },'Phim lồng tiếng': { mode: 'cutee', slug: 'long-tieng' },'Phim bộ đang chiếu': { mode: 'cutee', slug: 'phim-dang-chieu' },'Phim bộ đã hoàn thành': { mode: 'cutee', slug: 'hoan-tat' },'Phim sắp chiếu': { mode: 'cutee', slug: 'phim-sap-chieu' },'Subteam': { mode: 'cutee', slug: 'subteam' },'Phim chiếu rạp': { mode: 'cutee', slug: 'phim-chieu-rap' } };

// TMDB Configuration
const TMDB_API_KEY = 'c1ba4826351c415243b3d8ea82a77cd7';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const tmdbCache = new Map(); // Cache để tránh gọi API nhiều lần

const API_SOURCES = { 
  Ophim: { 
    name: 'Ophim', code: 'ax',
    defaultUrl: p => `https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s,p) => `https://ophim1.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s,p) => `https://ophim1.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y,p) => `https://ophim1.com/v1/api/nam-phat-hanh/${y}?page=${p}`,
    typeUrl: (t,p) => `https://ophim1.com/v1/api/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s,p) => `https://ophim1.com/v1/api/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://ophim1.com/v1/api/phim/${s}`,
    keywordSearchUrl: (k,p=1) => `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.data?.items || [],
    searchParser: d => d?.data?.item ? [d.data.item] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: () => "https://img.ophim.live/uploads/movies/"
  }, 

  Phimapi: { 
    name: 'Phimapi', code: 'bx',
    defaultUrl: p => `https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${p}`,
    genreUrl: (s,p) => `https://phimapi.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s,p) => `https://phimapi.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y,p) => `https://phimapi.com/v1/api/nam/${y}?page=${p}`,
    typeUrl: (t,p) => `https://phimapi.com/v1/api/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s,p) => `https://phimapi.com/v1/api/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://phimapi.com/phim/${s}`,
    keywordSearchUrl: (k,p=1) => `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.data?.items || d?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: d => (d?.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/').replace(/\/+$/, '') + '/'
  }, 

  Nguonc: { 
    name: 'Nguonc', code: 'cx',
    defaultUrl: p => `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s,p) => `https://phim.nguonc.com/api/films/danh-sach/${s}?page=${p}`,
    countryUrl: (s,p) => `https://phim.nguonc.com/api/films/quoc-gia/${s}?page=${p}`,
    yearUrl: (y,p) => `https://phim.nguonc.com/api/films/nam-phat-hanh/${y}?page=${p}`,
    typeUrl: (t,p) => `https://phim.nguonc.com/api/films/danh-sach/${t}?page=${p}`,
    cuteeUrl: (s,p) => `https://phim.nguonc.com/api/films/danh-sach/${s}?page=${p}`,
    searchUrl: s => `https://phim.nguonc.com/api/film/${s}`,
    keywordSearchUrl: (k,p=1) => `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(k)}&page=${p}`,
    parser: d => d?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    keywordParser: d => d?.items || [],
    getCdn: () => "https://phim.nguonc.com/public/images/Poster/"
  }
};

let ITEMS_PER_PAGE = 120;
let currentMode = 'default';
let currentFilter = null;
let currentPage = 1;
let currentSearchQuery = '';
let currentGenre = null;
let currentCountry = null;
let currentYear = null;
let combinedFilterMode = false;

const proxyImage = (url) => {
    if (!url || url.includes('images.weserv.nl') || url.includes('placeholder')) return url || 'https://via.placeholder.com/300x450/222222/999999?text=No+Image';
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=200&h=300&fit=outside&output=webp&q=90&il`;
};
const PLACEHOLDER_LOW = 'abc.jpg';

// ==================== TMDB API Functions ====================
const searchTMDB = async (title, year = null, originalName = null) => {
  const cacheKey = `${title}_${originalName}_${year || ''}`;
  if (tmdbCache.has(cacheKey)) {
    return tmdbCache.get(cacheKey);
  }

  try {
    // Thử tìm với tên gốc trước (thường là tên tiếng Anh)
    let searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(originalName || title)}&language=en-US`;
    let response = await fetch(searchUrl);
    let data = await response.json();
    
    // Nếu không tìm thấy với tên gốc, thử tìm với tên Việt
    if (!data.results || data.results.length === 0) {
      searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=vi-VN`;
      response = await fetch(searchUrl);
      data = await response.json();
    }

    if (!response.ok || !data.results || data.results.length === 0) {
      tmdbCache.set(cacheKey, null);
      return null;
    }

    // Ưu tiên kết quả có năm khớp
    let result = data.results[0];
    if (year) {
      const yearMatch = data.results.find(r => {
        const releaseYear = (r.release_date || r.first_air_date || '').substring(0, 4);
        return releaseYear === year.toString();
      });
      if (yearMatch) result = yearMatch;
    }

    const posterPath = result.poster_path;
    const tmdbImage = posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
    
    tmdbCache.set(cacheKey, tmdbImage);
    return tmdbImage;
  } catch (error) {
    console.error('TMDB search error:', error);
    tmdbCache.set(cacheKey, null);
    return null;
  }
};

// ==================== LƯU / KHÔI PHỤC TRẠNG THÁI ====================
const STATE_KEY = 'phim_state';
const saveState = () => {
  const state = {
    mode: currentMode,
    filter: currentFilter,
    page: currentPage,
    search: currentSearchQuery,
    genre: currentGenre,
    country: currentCountry,
    year: currentYear,
    combined: combinedFilterMode
  };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save state error:', e);
  }
};

const loadState = () => { 
  try{ 
    const s = JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); 
    if(s.mode){ 
      currentMode=s.mode; currentFilter=s.filter; currentPage=s.page||1; currentSearchQuery=s.search||''; 
      currentGenre=s.genre||null; currentCountry=s.country||null; currentYear=s.year||null;
      combinedFilterMode=s.combined===true;
    }
  }catch{} 
};

const clearState = () => {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (e) {
    console.error('Clear state error:', e);
  }
};

// ==================== EPISODE DISPLAY ====================
const getEpisodeDisplay = i => {
  if (!i) return '';
  const m = i.movie || i;
  const e = i.episodes || m.episodes || [];
  if (!m.episode_current && !m.current_episode && !m.episode_total && !m.total_episodes && !Array.isArray(e)) return (m.type || m.tmdb?.type) === 'tv' ? 'Phim bộ' : 'Phim lẻ';
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

// ==================== FETCH DỮ LIỆU ====================
const fetchFromSource = async (src, p, m, f, genre=null, country=null, year=null, isS=false, isK=false) => {
  let url = '';
  
  if (isK) {
    url = src.keywordSearchUrl(f, p);
  } else if (isS) {
    url = src.searchUrl(f);
  } else if (m === 'combined') {
    if (src.code === 'ax') {
      let base = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat';
      if (genre) base = `https://ophim1.com/v1/api/the-loai/${genre}`;
      else if (country) base = `https://ophim1.com/v1/api/quoc-gia/${country}`;
      else if (year) base = `https://ophim1.com/v1/api/nam-phat-hanh/${year}`;
      
      const params = new URLSearchParams({ page: p });
      if (country && !base.includes('/quoc-gia/')) params.append('country', country);
      if (year && !base.includes('/nam-phat-hanh/')) params.append('year', year);
      url = base + '?' + params.toString();
    } else if (src.code === 'bx') {
      let base = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat-v1';
      if (genre) base = `https://phimapi.com/v1/api/the-loai/${genre}`;
      const params = new URLSearchParams({ page: p });
      if (country) params.append('country', country);
      if (year) params.append('year', year);
      url = base + '?' + params.toString();
    } else if (src.code === 'cx') {
      if (genre) url = src.genreUrl(genre, p);
      else if (country) url = src.countryUrl(country, p);
      else if (year) url = src.yearUrl(year, p);
      else url = src.defaultUrl(p);
    }
  } else if (m === 'genre') {
    url = src.genreUrl(genre, p);
  } else if (m === 'country') {
    url = src.countryUrl(country, p);
  } else if (m === 'year') {
    url = src.yearUrl(year, p);
  } else if (m === 'type' || m === 'cutee') {
    url = (src.cuteeUrl || src.typeUrl)(f, p);
  } else {
    url = src.defaultUrl(p);
  }

  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    const parser = isK ? src.keywordParser : isS ? src.searchParser : src.parser;
    let items = parser(d) || [];
    const cdn = typeof src.getCdn === 'function' ? src.getCdn(d) : src.getCdn();

    return items.map(it => {
      let thumb = '';
      if (src.code === 'ax') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
      if (src.code === 'bx') thumb = it.poster_url || it.thumb_url || it.poster || it.thumb || '';
      if (src.code === 'cx') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';

      if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//') && cdn) thumb = cdn + thumb.replace(/^\/+/, '');
      
      return {
        name: it.name || it.origin_name || it.title || 'Không rõ',
        originalName: it.origin_name || it.name || '',
        thumb_url: thumb, // Giữ URL gốc tạm thời
        episodeDisplay: getEpisodeDisplay(it),
        slug: it.slug || it._id || '',
        sourceCode: src.code,
        sourceName: src.name,
        year: (it.year || '').toString(),
        lang: (it.lang || '').toUpperCase(),
        quality: it.quality || ''
      };
    }).filter(x => x.slug);
  } catch (e) { 
    console.error('FETCH ERR:', src.name, e); 
    return []; 
  }
};

// ==================== GỘP DỮ LIỆU ====================
const interleaveFull = async (mode, filter, page, genre=null, country=null, year=null, isSearch=false, isKeyword=false) => {
  let sources = Object.values(API_SOURCES);
  if (combinedFilterMode && (mode === 'combined' || mode === 'genre' || mode === 'country' || mode === 'year')) {
    sources = sources.filter(s => s.code !== 'cx');
  }
  
  const results = await Promise.all(sources.map(src => fetchFromSource(src, page, mode, filter, genre, country, year, isSearch, isKeyword)));
  const all = [];
  const seen = new Set();
  let idx = new Array(sources.length).fill(0);

  while (all.length < ITEMS_PER_PAGE * 1) {
    let added = false;
    for (let i = 0; i < sources.length; i++) {
      if (idx[i] < results[i].length) {
        const m = results[i][idx[i]];
        if (!seen.has(m.slug + m.sourceCode)) {
          seen.add(m.slug + m.sourceCode);
          all.push(m);
          added = true;
        }
        idx[i]++;
      }
    }
    if (!added) break;
  }
  
  const finalMovies = all.slice(0, ITEMS_PER_PAGE);
  
  // Ưu tiên ảnh TMDB cho tất cả nguồn (ax, bx, cx) để load nhanh hơn
  await Promise.all(finalMovies.map(async (movie) => {
    const tmdbImage = await searchTMDB(movie.name, movie.year, movie.originalName);
    if (tmdbImage) {
      // Tìm thấy trên TMDB - dùng ảnh TMDB (load nhanh)
      movie.thumb_url = tmdbImage;
      movie.usedTMDB = true;
    } else {
      // Không có trên TMDB - fallback về ảnh gốc từ 3 nguồn
      movie.thumb_url = proxyImage(movie.thumb_url);
      movie.usedTMDB = false;
    }
  }));
  
  return finalMovies;
};

// ==================== TÌM KIẾM ====================
const search = async (q = null, p = 1) => {
  const raw = (q || document.getElementById('nav-search-input')?.value || '').trim();
  if (!raw) return load('default');
  currentSearchQuery = raw;
  currentPage = p;
  currentGenre = null;
  currentCountry = null;
  currentYear = null;

  const sid = 'search-sec';
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, `TÌM: "${raw}"`);
  else sec.querySelector('.section-header').textContent = `TÌM: "${raw}"`;

  showSec(sec);
  const grid = document.getElementById(`${sid}-grid`);
  grid.innerHTML = '';

  const slugMovies = await interleaveFull(null, raw, p, null, null, null, true, false);
  const keyMovies = await interleaveFull(null, raw, p, null, null, null, false, true);

  const all = [...slugMovies, ...keyMovies];
  const seen = new Set();
  const fin = all.filter(m => !seen.has(m.slug + m.sourceCode) && seen.add(m.slug + m.sourceCode));

  await renderFinal(fin, grid, `${sid}-progress`);
  renderPag(p, sid, fin.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({behavior:'smooth'});
  saveState();
};

let loaded = 0, total = 0;
const updateProg = id => {
  loaded++;
  const bar = document.getElementById(id);
  if (bar) bar.style.width = (loaded / total * 100) + '%';
  if (loaded === total) document.getElementById(id + '-cont')?.classList.add('done');
};

const createCard = (m) => {
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
  // Hiển thị badge TMDB nếu dùng ảnh từ TMDB
  sourceTag.textContent = m.usedTMDB ? 'TMDB' : m.sourceCode || '';
  if (m.usedTMDB) {
    sourceTag.style.background = 'linear-gradient(135deg, #01d277 0%, #00b4d8 100%)';
  }

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

  const imgPlaceholder = document.createElement('img');
  imgPlaceholder.className = 'movie-img-placeholder';
  imgPlaceholder.src = PLACEHOLDER_LOW;

  const imgContainer = document.createElement('div');
  imgContainer.className = 'movie-img-container';
  imgContainer.append(imgReal, imgPlaceholder, epTag, topRight, langTag, yearTag, titleTag);
  c.appendChild(imgContainer);

  return { card: c, imgReal, imgPlaceholder, url: m.thumb_url };
};

const renderFinal = async (movies, container, id) => {
  container.innerHTML = '';
  const disp = movies.slice(0, ITEMS_PER_PAGE);
  total = disp.length;
  loaded = 0;

  const cards = disp.map(m => createCard(m));
  cards.forEach(o => container.appendChild(o.card));

  cards.forEach(o => {
    if (!o.url) {
      o.imgPlaceholder.style.opacity = '1';
      updateProg(id);
      return;
    }
    const img = new Image();
    img.onload = () => {
      o.imgReal.src = o.url;
      o.imgReal.style.opacity = '1';
      o.imgPlaceholder.style.opacity = '0';
      updateProg(id);
    };
    img.onerror = () => {
      o.imgPlaceholder.style.opacity = '1';
      updateProg(id);
    };
    img.src = o.url;
  });

  if (total === 0) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px;color:#aaa;">Không tìm thấy phim nào</div>';
  }
};

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
  if (ex) {
    ex.style.display = 'block';
    c.insertBefore(ex, c.firstChild);
  } else {
    c.insertBefore(sec, c.firstChild);
    sec.style.display = 'block';
  }
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

const getTitle = (m, f, g, c, y) => {
  if (m === 'default') return 'PHIM MỚI NHÀ BÁNH MÌ';
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

const load = async (m, f = null, p = 1, g = null, c = null, y = null) => {
  currentSearchQuery = '';
  if (document.getElementById('nav-search-input')) document.getElementById('nav-search-input').value = '';

  currentMode = m;
  currentFilter = f;
  currentPage = p;
  
  if (m === 'genre') {
    currentGenre = f;
    currentCountry = c;
    currentYear = y;
  } else if (m === 'country') {
    currentGenre = null;
    currentCountry = f;
    currentYear = y;
  } else if (m === 'year') {
    currentGenre = null;
    currentCountry = null;
    currentYear = f;
  } else if (m === 'combined') {
    currentGenre = g;
    currentCountry = c;
    currentYear = y;
  } else {
    currentGenre = null;
    currentCountry = null;
    currentYear = null;
  }

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
  grid.innerHTML = '';

  const movies = await interleaveFull(m, f, p, currentGenre, currentCountry, currentYear);
  await renderFinal(movies, grid, `${sid}-progress`);
  renderPag(p, sid, movies.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

const loadTxt = async () => {
  try {
    const r = await fetch('china.txt?t=' + Date.now());
    if (!r.ok) throw 1;
    const txt = await r.text();
    if (!txt.trim()) throw 1;
    const groups = parseTxt(txt);
    for (const [name, items] of Object.entries(groups)) if (items.length) await loadGroup(name, items);
  } catch {
    document.getElementById('main-content').innerHTML = '<div class="container"><h2 style="text-align:center;padding:100px;color:#aaa;">Chưa có custom-menu.txt</h2></div>';
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
  grid.innerHTML = '';
  const all = [];
  for (const i of items) {
    const src = Object.values(API_SOURCES).find(s => s.name.toLowerCase() === i.source);
    if (!src) continue;
    const res = await fetchFromSource(src, null, null, i.slug, null, null, null, true, false);
    all.push(...res);
  }
  const seen = new Set();
  const fin = all.filter(m => !seen.has(m.slug + m.sourceCode) && seen.add(m.slug + m.sourceCode));
  
  // Ưu tiên ảnh TMDB cho tất cả nguồn trong custom menu
  await Promise.all(fin.map(async (movie) => {
    const tmdbImage = await searchTMDB(movie.name, movie.year, movie.originalName);
    if (tmdbImage) {
      movie.thumb_url = tmdbImage;
      movie.usedTMDB = true;
    } else {
      movie.thumb_url = proxyImage(movie.thumb_url);
      movie.usedTMDB = false;
    }
  }));
  
  await renderFinal(fin, grid, `${sid}-progress`);
  document.getElementById(`${sid}-pagination`).style.display = 'none';
};

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
          if (v === 'Trang chủ') {
            clearState();
            location.reload();
            return;
          }

          if (v === 'Thể Loại') {
            openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), genreName => {
              const genreSlug = GENRE_SLUG_MAP[genreName];
              openModal('LỌC KẾT HỢP', ['Bật (ax+bx)', 'Tắt (ax+bx+cx)', 'Chỉ lọc thể loại'], choice => {
                if (choice === 'Chỉ lọc thể loại') {
                  combinedFilterMode = false;
                  load('genre', genreSlug, 1);
                  closeModal();
                } else {
                  combinedFilterMode = choice === 'Bật (ax+bx)';
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

          if (v === 'Quốc Gia') {
            openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1));
            return;
          }

          if (v === 'Năm') {
            openModal('NĂM', Array.from({ length: 25 }, (_, i) => 2026 - i), x => load('year', x, 1));
            return;
          }

          if (v === 'Khác') {
            openModal('KHÁC', Object.keys(CUTEE_MENU), x => {
              const c = CUTEE_MENU[x];
              load(c.mode, c.slug || c.filter, 1);
            });
            return;
          }

          if (v === 'Phim Bộ') {
            load('type', 'phim-bo', 1);
            closeModal();
            return;
          }

          if (v === 'Phim Lẻ') {
            load('type', 'phim-le', 1);
            closeModal();
            return;
          }

          if (v === 'Cinemax') {
            load('cutee', 'phim-chieu-rap', 1);
            closeModal();
            return;
          }
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
          openModal('LỌC KẾT HỢP', ['Bật (ax+bx)', 'Tắt (ax+bx+cx)', 'Chỉ lọc thể loại'], choice => {
            if (choice === 'Chỉ lọc thể loại') {
              combinedFilterMode = false;
              load('genre', genreSlug, 1);
              closeModal();
            } else {
              combinedFilterMode = choice === 'Bật (ax+bx)';
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

      if (t === 'country') {
        openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1));
      }

      if (t === 'year') {
        openModal('NĂM', Array.from({ length: 25 }, (_, i) => 2026 - i), x => load('year', x, 1));
      }

      if (t === 'cutee') {
        openModal('KHÁC', Object.keys(CUTEE_MENU), x => {
          const c = CUTEE_MENU[x];
          load(c.mode, c.slug || c.filter, 1);
        });
      }
    };
  });

  document.getElementById('home-link')?.addEventListener('click', e => {
    e.preventDefault();
    clearState();
    location.reload();
  });

  document.getElementById('phim-bo')?.addEventListener('click', e => {
    e.preventDefault();
    load('type', 'phim-bo', 1);
  });

  document.getElementById('phim-le')?.addEventListener('click', e => {
    e.preventDefault();
    load('type', 'phim-le', 1);
  });

  document.getElementById('phim-chieu-rap')?.addEventListener('click', e => {
    e.preventDefault();
    load('cutee', 'phim-chieu-rap', 1);
  });

  document.getElementById('nav-search-btn')?.addEventListener('click', () => search());
  document.getElementById('nav-search-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') search();
  });
});