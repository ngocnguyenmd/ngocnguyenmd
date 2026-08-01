const GENRE_SLUG_MAP = { 'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai','Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich','Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di','Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man','Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can','Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay','Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong','Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien' };
const COUNTRY_SLUG_MAP = { 'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban','Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap','Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan','Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia','Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach','Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut','Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi','Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi','Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile','Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore','Quốc Gia Khác': 'quoc-gia-khac' };
const CUTEE_MENU = { 'Phim mới': { mode: 'default' },'Phim bộ': { mode: 'type', filter: 'phim-bo' },'Phim lẻ': { mode: 'type', filter: 'phim-le' },'Shows': { mode: 'cutee', slug: 'tv-shows' },'Hoạt hình': { mode: 'cutee', slug: 'hoat-hinh' },'Phim vietsub': { mode: 'cutee', slug: 'vietsub' },'Phim thuyết minh': { mode: 'cutee', slug: 'thuyet-minh' },'Phim lồng tiếng': { mode: 'cutee', slug: 'long-tieng' },'Phim bộ đang chiếu': { mode: 'cutee', slug: 'phim-dang-chieu' },'Phim bộ đã hoàn thành': { mode: 'cutee', slug: 'hoan-tat' },'Phim sắp chiếu': { mode: 'cutee', slug: 'phim-sap-chieu' },'Subteam': { mode: 'cutee', slug: 'subteam' },'Phim chiếu rạp': { mode: 'cutee', slug: 'phim-chieu-rap' } };

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

const API_CACHE = {}; 

let ITEMS_PER_PAGE = 16;
let currentMode = 'default';
let currentFilter = null;
let currentPage = 1;
let currentSearchQuery = '';
let currentGenre = null;
let currentCountry = null;
let currentYear = null;
let combinedFilterMode = false;
let aiAbortCtrl = null;

const STATE_KEY = 'phim_state';
const saveState = () => localStorage.setItem(STATE_KEY, JSON.stringify({mode:currentMode,filter:currentFilter,page:currentPage,search:currentSearchQuery,genre:currentGenre,country:currentCountry,year:currentYear,combined:combinedFilterMode}));
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
const clearState = () => localStorage.removeItem(STATE_KEY);

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

const fetchFromSource = async (src, p, m, f, genre=null, country=null, year=null, isS=false, isK=false) => {
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

  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    const parser = isK ? src.keywordParser : isS ? src.searchParser : src.parser;
    let items = parser(d) || [];
    const cdn = typeof src.getCdn === 'function' ? src.getCdn(d) : src.getCdn();

    const result = items.map(it => {
      let thumb = '';
      if (src.code === 'ax') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
      if (src.code === 'bx') thumb = it.poster_url || it.thumb_url || it.poster || it.thumb || '';
      if (src.code === 'cx') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
      if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//') && cdn) thumb = cdn + thumb.replace(/^\/+/, '');
      return {
        name: it.name || it.origin_name || it.title || 'Không rõ',
        thumb_url: thumb,
        episodeDisplay: getEpisodeDisplay(it),
        slug: it.slug || it._id || '',
        sourceCode: src.code,
        sourceName: src.name,
        year: (it.year || '').toString(),
        lang: (it.lang || '').toUpperCase(),
        quality: it.quality || ''
      };
    }).filter(x => x.slug);

    API_CACHE[cacheKey] = result;
    return result;
  } catch (e) { console.error('FETCH ERR:', src.name, e); return []; }
};

const interleaveFull = async (mode, filter, page, genre=null, country=null, year=null, isSearch=false, isKeyword=false) => {
  let sources = Object.values(API_SOURCES);
  if (combinedFilterMode && (mode === 'combined' || mode === 'genre' || mode === 'country' || mode === 'year')) {
    sources = sources.filter(s => s.code !== 'cx');
  }
  const results = await Promise.all(sources.map(src => fetchFromSource(src, page, mode, filter, genre, country, year, isSearch, isKeyword)));
  const all = [];
  const seen = new Set();
  let idx = new Array(sources.length).fill(0);
  while (all.length < ITEMS_PER_PAGE) {
    let added = false;
    for (let i = 0; i < sources.length; i++) {
      if (idx[i] < results[i].length) {
        const m = results[i][idx[i]];
        if (!seen.has(m.slug + m.sourceCode)) { seen.add(m.slug + m.sourceCode); all.push(m); added = true; }
        idx[i]++;
      }
    }
    if (!added) break;
  }
  return all.slice(0, ITEMS_PER_PAGE);
};

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
  grid.innerHTML = '';
  const [slugMovies, keyMovies] = await Promise.all([
    interleaveFull(null, raw, p, null, null, null, true, false),
    interleaveFull(null, raw, p, null, null, null, false, true)
  ]);
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
  imgReal.onload = function() { this.style.opacity = '1'; this.parentElement.classList.add('loaded'); };
  imgReal.onerror = function() { updateProg(this.dataset.prog); };
  imgReal.dataset.prog = '';
  const imgPlaceholder = document.createElement('div');
  imgPlaceholder.className = 'movie-img-placeholder';
  const imgContainer = document.createElement('div');
  imgContainer.className = 'movie-img-container';
  imgContainer.append(imgReal, imgPlaceholder, epTag, topRight, langTag, yearTag, titleTag);
  c.appendChild(imgContainer);
  return { card: c, imgReal, url: m.thumb_url };
};

const renderFinal = async (movies, container, id) => {
  container.innerHTML = '';
  const disp = movies.slice(0, ITEMS_PER_PAGE);
  total = disp.length;
  loaded = 0;
  const fragment = document.createDocumentFragment();
  const cards = disp.map(m => createCard(m));
  cards.forEach(o => { o.imgReal.dataset.prog = id; fragment.appendChild(o.card); });
  container.appendChild(fragment);
  cards.forEach(o => { if (!o.url) { updateProg(id); return; } o.imgReal.src = o.url; });
  if (total === 0) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px;color:#aaa;">Không tìm thấy kết quả hoặc không hỗ trợ lọc này.<br>Hãy thử tìm bằng từ khóa khác.</div>';
  }
};

const createSec = (id, title) => {
  const s = document.createElement('div');
  s.className = 'section';
  s.id = id;
  s.innerHTML = '<div class="progress-container" id="' + id + '-progress-cont"><div class="progress-bar" id="' + id + '-progress"></div></div><div class="container"><div class="section-header">' + title + '</div><div class="movie-grid" id="' + id + '-grid"></div><div class="pagination" id="' + id + '-pagination"></div></div>';
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
  const el = document.getElementById(sid + '-pagination');
  if (!el) return;
  el.innerHTML = '';
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '\u2039';
  prev.disabled = p === 1;
  prev.onclick = () => { currentPage = p - 1; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); };
  el.appendChild(prev);
  for (let i = Math.max(1, p - 3); i <= p + 4; i++) {
    const b = document.createElement('button');
    b.className = 'page-btn';
    if (i === p) b.classList.add('active');
    b.textContent = i;
    b.onclick = () => { currentPage = i; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); };
    el.appendChild(b);
  }
  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '\u203a';
  next.disabled = !more;
  next.onclick = () => { currentPage = p + 1; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); };
  el.appendChild(next);
};

const getTitle = (m, f, g, c, y) => {
  if (m === 'default') return 'PHIM MỚI CẬP NHẬT';
  if (m === 'combined') {
    const parts = [];
    if (g) parts.push('THỂ LOẠI: ' + (Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === g) || g).toUpperCase());
    if (c) parts.push('QUỐC GIA: ' + (Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === c) || c).toUpperCase());
    if (y) parts.push('NĂM: ' + y);
    return parts.length ? parts.join(' \u2022 ') : 'PHIM';
  }
  if (m === 'genre') return 'THỂ LOẠI: ' + (Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === f) || f).toUpperCase();
  if (m === 'country') return 'QUỐC GIA: ' + (Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === f) || f).toUpperCase();
  if (m === 'year') return 'NĂM: ' + f;
  if (m === 'type') return { 'phim-bo': 'PHIM BỘ', 'phim-le': 'PHIM LẺ' }[f] || f.toUpperCase();
  if (m === 'cutee') {
    const l = Object.keys(CUTEE_MENU).find(k => CUTEE_MENU[k].slug === f || CUTEE_MENU[k].filter === f);
    return l ? l.toUpperCase() : f.toUpperCase().replace(/-/g, ' ');
  }
  return f ? f.toUpperCase() : 'PHIM';
};

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
  const sid = (m + '-' + (f || '') + '-' + (currentGenre || '') + '-' + (currentCountry || '') + '-' + (currentYear || '') + '-sec').replace(/--+/g, '-');
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, title);
  showSec(sec);
  const grid = document.getElementById(sid + '-grid');
  grid.innerHTML = '';
  const movies = await interleaveFull(m, f, p, currentGenre, currentCountry, currentYear);
  await renderFinal(movies, grid, sid + '-progress');
  renderPag(p, sid, movies.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

const removeDiacritics = str => {
  const map = {
    'A':'A','\u00C0':'A','\u00C1':'A','\u1EA2':'A','\u00C3':'A','\u1EA0':'A','\u0102':'A','\u1EB0':'A','\u1EB2':'A','\u1EB4':'A','\u1EB6':'A','\u00C2':'A','\u1EA4':'A','\u1EA6':'A','\u1EA8':'A','\u1EAA':'A','\u1EAC':'A',
    'a':'a','\u00E0':'a','\u00E1':'a','\u1EA3':'a','\u00E3':'a','\u1EA1':'a','\u0103':'a','\u1EB1':'a','\u1EB3':'a','\u1EB5':'a','\u1EB7':'a','\u00E2':'a','\u1EA7':'a','\u1EA9':'a','\u1EBB':'a','\u1EBD':'a','\u1EBF':'a',
    'D':'D','\u0110':'D','d':'d','\u0111':'d',
    'E':'E','\u00C8':'E','\u00C9':'E','\u1EBA':'E','\u1EBC':'E','\u1EB8':'E','\u00CA':'E','\u1EC0':'E','\u1EC2':'E','\u1EC4':'E','\u1EC6':'E',
    'e':'e','\u00E8':'e','\u00E9':'e','\u1EBB':'e','\u1EBD':'e','\u1EB9':'e','\u00EA':'e','\u1EC1':'e','\u1EC3':'e','\u1EC5':'e','\u1EC7':'e',
    'I':'I','\u00CC':'I','\u00CD':'I','\u1EC8':'I','\u0128':'I','\u1ECA':'I',
    'i':'i','\u00EC':'i','\u00ED':'i','\u1EC9':'i','\u0129':'i','\u1ECB':'i',
    'O':'O','\u00D2':'O','\u00D3':'O','\u1ED2':'O','\u00D5':'O','\u1ED0':'O','\u00D4':'O','\u1ED4':'O','\u1ED6':'O','\u1ED8':'O','\u1EDA':'O','\u01A0':'O','\u1EDC':'O','\u1EDE':'O','\u1EE0':'O','\u1EE2':'O',
    'o':'o','\u00F2':'o','\u00F3':'o','\u1ED3':'o','\u00F5':'o','\u1ED1':'o','\u00F4':'o','\u1ED5':'o','\u1ED7':'o','\u1ED9':'o','\u1EDB':'o','\u01A1':'o','\u1EDD':'o','\u1EDF':'o','\u1EE1':'o','\u1EE3':'o',
    'U':'U','\u00D9':'U','\u00DA':'U','\u1EE6':'U','\u0168':'U','\u1EE4':'U','\u01AF':'U','\u1EE8':'U','\u1EEA':'U','\u1EEC':'U','\u1EEE':'U',
    'u':'u','\u00F9':'u','\u00FA':'u','\u1EE7':'u','\u0169':'u','\u1EE5':'u','\u01B0':'u','\u1EE9':'u','\u1EEB':'u','\u1EED':'u','\u1EEF':'u',
    'Y':'Y','\u1EF2':'Y','\u00DD':'Y','\u1EF6':'Y','\u1EF8':'Y','\u1EF4':'Y',
    'y':'y','\u1EF3':'y','\u00FD':'y','\u1EF7':'y','\u1EF9':'y','\u1EF5':'y'
  };
  return str.split('').map(c => map[c] || c).join('');
};

const loadTxt = async () => {
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
    document.getElementById('main-content').innerHTML = '<div class="container"><h2 style="text-align:center;padding:100px;color:#aaa;">Chưa có dữ liệu trangchu.txt</h2></div>';
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
    if (l.startsWith('#')) { cur = l.substring(1).trim(); if (!g[cur]) g[cur] = []; return; }
    if (!cur) return;
    const p = l.split('|');
    if (p.length < 2) return;
    const tenPhim = p[0].trim();
    const maNguon = p[1].trim().toLowerCase();
    const linkAnh = (p[2] || '').trim();
    const slug = removeDiacritics(tenPhim).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    g[cur].push({ slug: slug, source: maNguon, image: linkAnh, displayName: tenPhim });
  });
  return g;
};

const loadGroup = async (name, items) => {
  const sid = 'txt-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, name);
  const cont = document.getElementById('main-content');
  if (!document.getElementById(sid)) cont.appendChild(sec);
  sec.style.display = 'block';
  const grid = document.getElementById(sid + '-grid');
  grid.innerHTML = '';
  const fetchPromises = items.map(async (item) => {
    const src = Object.values(API_SOURCES).find(s => s.code === item.source);
    if (!src) return null;
    try {
      const results = await fetchFromSource(src, null, null, item.slug, null, null, null, true, false);
      if (results && results.length > 0) {
        const movie = results[0];
        movie.thumb_url = item.image || '';
        return movie;
      }
    } catch (e) { console.error('Loi load phim:', item.slug, e); }
    return null;
  });
  const results = await Promise.all(fetchPromises);
  const fin = results.filter(m => m !== null);
  await renderFinal(fin, grid, sid + '-progress');
  document.getElementById(sid + '-pagination').style.display = 'none';
};

// ==================== AI SELECTION ====================

async function aiCallGroq(prompt, maxTokens) {
  var key = localStorage.getItem('groq_key') || '';
  if (!key || key.length < 5) throw new Error('Chua co Groq API Key. Nhan nut AI lan nua de nhap key.');
  if (aiAbortCtrl) { try { aiAbortCtrl.abort(); } catch(e){} }
  aiAbortCtrl = new AbortController();
  var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens || 2000, temperature: 0.7 }),
    signal: aiAbortCtrl.signal
  });
  if (!r.ok) {
    var err = await r.json().catch(function(){ return {}; });
    throw new Error((err.error && err.error.message) || 'API loi ' + r.status);
  }
  var d = await r.json();
  return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
}

function aiParseResponse(content) {
  var groups = {};
  var cur = null;
  content.split('\n').forEach(function(l) {
    l = l.trim();
    if (!l) return;
    if (l.indexOf('#') === 0) { cur = l.replace(/^#+\s*/, '').trim(); if (!groups[cur]) groups[cur] = []; return; }
    if (!cur) return;
    var p = l.split('|');
    if (p.length < 2) return;
    var name = p[0].trim();
    var src = p[1].trim().toLowerCase();
    var img = (p[2] || '').trim();
    var slug = removeDiacritics(name).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (name && src && slug) groups[cur].push({ slug: slug, source: src, image: img, displayName: name });
  });
  return groups;
}

async function aiGenerateSelection() {
  var key = localStorage.getItem('groq_key') || '';
  if (!key || key.length < 5) {
    key = prompt('Nhap Groq API Key (lan sau se tu dong nho):');
    if (!key || !key.trim()) return;
    key = key.trim();
    localStorage.setItem('groq_key', key);
  }

  // Xoa CAC section AI cu (truoc loading) - KHONG dung querySelector voi prefix vi se xoa luon loading
  var oldAiSecs = document.querySelectorAll('.section[data-ai="1"]');
  oldAiSecs.forEach(function(el) { el.remove(); });

  // Tao section loading MOI
  var loadSec = createSec('ai-loading-sec', 'AI DANG PHAN TICH...');
  showSec(loadSec);
  var grid = document.getElementById('ai-loading-sec-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:#e87ba5;font-size:13px;">AI dang chon phim phu hop cho ban...<br><br><span style="color:#555;font-size:11px;">Dung dong trang, qua trinh mat khoang 30-60 giay</span></div>';
  var pagEl = document.getElementById('ai-loading-sec-pagination');
  if (pagEl) pagEl.style.display = 'none';

  try {
    var step1 = await aiCallGroq(
      'Ban la chuyen gia dien anh. Dat ten 6 nhom phim HAY va BAT MAT cho trang web phim.\n\nQUY TAC:\n- Ten nhom phai ngan gon, hap dan, KHONG trung voi ten the loai thong thuong\n- Moi nhom phai co chu de ro rang, khac biet hoan toan\n- Vi du tot: "Dem Kinh Hoang Nhat Cuoc Doi", "Nguoi Han Gioi Nhat", "Xem Khoc Cuoi Cung Con"\n- Vi du xau: "Phim Hanh Dong", "Phim Hay", "Phim Han Quoc"\n\nCHI viet 6 dong, moi dong bat dau bang #, KHONG giai thich gi them:',
      200
    );

    var groupNames = step1.split('\n').filter(function(l) { return l.trim().indexOf('#') === 0; }).map(function(l) { return l.replace(/^#+\s*/, '').trim(); }).filter(Boolean);
    if (groupNames.length < 3) throw new Error('AI khong tao du nhom');

    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#e87ba5;font-size:13px;">Da tao ' + groupNames.length + ' nhom<br><span style="color:#555;font-size:11px;">Dang chon phim cho tung nhom...</span></div>';

    var allGroups = {};
    for (var i = 0; i < groupNames.length; i++) {
      var gn = groupNames[i];
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><span style="color:#e87ba5;font-size:13px;">' + gn + '</span><br><span style="color:#555;font-size:11px;">Nhom ' + (i + 1) + '/' + groupNames.length + '...</span></div>';

      var prompt2 = 'Nhom phim: "' + gn + '"\n\nChon DUNG 8 phim thuoc nhom nay. Moi phim PHAI thuc su phu hop voi chu de "' + gn + '".\n\nFormat moi dong:\nTen phim co dau|ax\n\nQUY TAC:\n- KHONG random, moi phim phai thuc su thuoc nhom "' + gn + '"\n- Uu tien phim co tren ophim (slug tieng Viet khong dau, lowercase, gach ngang)\n- source dung ax\n- CHI viet 8 dong, KHONG so thu tu, KHONG giai thich';

      var result = await aiCallGroq(prompt2, 400);
      var parsed = aiParseResponse(result);
      var firstKey = Object.keys(parsed)[0];
      if (firstKey && parsed[firstKey].length > 0) {
        allGroups[gn] = parsed[firstKey];
      } else if (parsed[gn] && parsed[gn].length > 0) {
        allGroups[gn] = parsed[gn];
      }
    }

    // An loading
    loadSec.style.display = 'none';

    // Hien thi cac nhom - danh dau data-ai="1" de lan sau xoa dung
    var entries = Object.entries(allGroups).filter(function(entry) { return entry[1].length > 0; });
    if (!entries.length) throw new Error('AI khong tim duoc phim nao');

    for (var j = 0; j < entries.length; j++) {
      var name = entries[j][0];
      var items = entries[j][1];
      var sid = 'txt-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      var sec = document.getElementById(sid);
      if (sec) {
        // Danh dau la section AI de lan sau co the xoa
        sec.setAttribute('data-ai', '1');
      }
      await loadGroup(name, items);
      // Danh dau sau khi loadGroup tao moi
      sec = document.getElementById(sid);
      if (sec) sec.setAttribute('data-ai', '1');
    }

    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });

  } catch (e) {
    if (e.name === 'AbortError') return;
    if (grid) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;"><span style="color:#f87171;font-size:13px;">Loi: ' + e.message + '</span><br><br><span style="color:#555;font-size:11px;">Nhan "AI" trong menu de thu lai</span></div>';
    }
  }
}

// ==================== KHOI TAO ====================
document.addEventListener('DOMContentLoaded', function() {
  loadState();

  if (currentSearchQuery) {
    if (document.getElementById('nav-search-input')) document.getElementById('nav-search-input').value = currentSearchQuery;
    search(currentSearchQuery, currentPage);
  } else if (currentMode !== 'default') {
    load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear);
  } else {
    loadTxt();
  }

  var hamburger = document.getElementById('hamburger');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');

  var openModal = function(t, items, cb) {
    modalTitle.textContent = t;
    modalBody.innerHTML = '';
    document.querySelectorAll('.modal-item.active').forEach(function(x) { x.classList.remove('active'); });
    items.forEach(function(it) {
      var d = document.createElement('div');
      d.className = 'modal-item';
      d.textContent = it;
      d.onclick = function() {
        document.querySelectorAll('.modal-item.active').forEach(function(x) { x.classList.remove('active'); });
        d.classList.add('active');
        cb(it);
      };
      modalBody.appendChild(d);
    });
    modalBackdrop.classList.add('show');
  };

  var closeModal = function() { modalBackdrop.classList.remove('show'); };

  if (modalClose) modalClose.onclick = closeModal;
  if (modalBackdrop) modalBackdrop.onclick = function(e) { if (e.target === modalBackdrop) closeModal(); };

  if (hamburger) {
    hamburger.onclick = function() {
      openModal('MENU', ['Trang chu', 'The Loai', 'Quoc Gia', 'Nam', 'Khac', 'Phim Bo', 'Phim Le', 'Cinemax', 'AI De Xuat'], function(v) {
        if (v === 'Trang chu') { clearState(); location.reload(); return; }
        if (v === 'The Loai') {
          openModal('THE LOAI', Object.keys(GENRE_SLUG_MAP), function(genreName) {
            var genreSlug = GENRE_SLUG_MAP[genreName];
            openModal('LOC KET HOP', ['Bat (Toc do cao)', 'Tat (Nhieu ket qua)', 'Chi loc the loai'], function(choice) {
              if (choice === 'Chi loc the loai') { combinedFilterMode = false; load('genre', genreSlug, 1); closeModal(); }
              else {
                combinedFilterMode = choice === 'Bat (Toc do cao)';
                openModal('QUOC GIA', ['Tat ca'].concat(Object.keys(COUNTRY_SLUG_MAP)), function(countryName) {
                  var countrySlug = countryName === 'Tat ca' ? null : COUNTRY_SLUG_MAP[countryName];
                  openModal('NAM', ['Tat ca'].concat(Array.from({ length: 25 }, function(_, i) { return 2026 - i; })), function(yearStr) {
                    var year = yearStr === 'Tat ca' ? null : yearStr;
                    load('combined', null, 1, genreSlug, countrySlug, year);
                    closeModal();
                  });
                });
              }
            });
          });
          return;
        }
        if (v === 'Quoc Gia') { openModal('QUOC GIA', Object.keys(COUNTRY_SLUG_MAP), function(x) { load('country', COUNTRY_SLUG_MAP[x], 1); }); return; }
        if (v === 'Nam') { openModal('NAM', Array.from({ length: 25 }, function(_, i) { return 2026 - i; }), function(x) { load('year', x, 1); }); return; }
        if (v === 'Khac') { openModal('KHAC', Object.keys(CUTEE_MENU), function(x) { var c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); }); return; }
        if (v === 'Phim Bo') { load('type', 'phim-bo', 1); closeModal(); return; }
        if (v === 'Phim Le') { load('type', 'phim-le', 1); closeModal(); return; }
        if (v === 'Cinemax') { load('cutee', 'phim-chieu-rap', 1); closeModal(); return; }
        if (v === 'AI De Xuat') { aiGenerateSelection(); closeModal(); return; }
      });
    };
  }

  document.querySelectorAll('.menu-trigger').forEach(function(el) {
    el.onclick = function(e) {
      e.preventDefault();
      var t = el.dataset.target;
      if (t === 'genre') {
        openModal('THE LOAI', Object.keys(GENRE_SLUG_MAP), function(genreName) {
          var genreSlug = GENRE_SLUG_MAP[genreName];
          openModal('LOC KET HOP', ['Bat (Toc do cao)', 'Tat (Nhieu ket qua)', 'Chi loc the loai'], function(choice) {
            if (choice === 'Chi loc the loai') { combinedFilterMode = false; load('genre', genreSlug, 1); closeModal(); }
            else {
              combinedFilterMode = choice === 'Bat (Toc do cao)';
              openModal('QUOC GIA', ['Tat ca'].concat(Object.keys(COUNTRY_SLUG_MAP)), function(countryName) {
                var countrySlug = countryName === 'Tat ca' ? null : COUNTRY_SLUG_MAP[countryName];
                openModal('NAM', ['Tat ca'].concat(Array.from({ length: 25 }, function(_, i) { return 2026 - i; })), function(yearStr) {
                  var year = yearStr === 'Tat ca' ? null : yearStr;
                  load('combined', null, 1, genreSlug, countrySlug, year);
                  closeModal();
                });
              });
            }
          });
        });
      }
      if (t === 'country') openModal('QUOC GIA', Object.keys(COUNTRY_SLUG_MAP), function(x) { load('country', COUNTRY_SLUG_MAP[x], 1); });
      if (t === 'year') openModal('NAM', Array.from({ length: 25 }, function(_, i) { return 2026 - i; }), function(x) { load('year', x, 1); });
      if (t === 'cutee') openModal('KHAC', Object.keys(CUTEE_MENU), function(x) { var c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); });
      if (t === 'ai') { aiGenerateSelection(); closeModal(); }
    };
  });

  document.getElementById('home-link')?.addEventListener('click', function(e) { e.preventDefault(); clearState(); location.reload(); });
  document.getElementById('home-link-nav')?.addEventListener('click', function(e) { e.preventDefault(); clearState(); location.reload(); });
  document.getElementById('phim-bo')?.addEventListener('click', function(e) { e.preventDefault(); load('type', 'phim-bo', 1); });
  document.getElementById('phim-le')?.addEventListener('click', function(e) { e.preventDefault(); load('type', 'phim-le', 1); });
  document.getElementById('phim-chieu-rap')?.addEventListener('click', function(e) { e.preventDefault(); load('cutee', 'phim-chieu-rap', 1); });
  document.getElementById('nav-search-btn')?.addEventListener('click', function() { search(); });
  document.getElementById('nav-search-input')?.addEventListener('keypress', function(e) { if (e.key === 'Enter') search(); });
});
