/**
 * app-nguonc.js — Nguồn DUY NHẤT: Nguonc (cx)
 * Tối ưu: IntersectionObserver lazy-load, LRU cache, AbortController, sessionStorage state
 */

'use strict';

// ==================== CONSTANTS ====================
const GENRE_SLUG_MAP = { 'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai','Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich','Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di','Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man','Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can','Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay','Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong','Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien' };
const COUNTRY_SLUG_MAP = { 'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban','Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap','Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan','Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia','Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach','Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut','Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi','Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi','Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile','Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore','Quốc Gia Khác': 'quoc-gia-khac' };
const CUTEE_MENU = { 'Phim mới': { mode: 'default' },'Phim bộ': { mode: 'type', filter: 'phim-bo' },'Phim lẻ': { mode: 'type', filter: 'phim-le' },'Shows': { mode: 'cutee', slug: 'tv-shows' },'Hoạt hình': { mode: 'cutee', slug: 'hoat-hinh' },'Phim vietsub': { mode: 'cutee', slug: 'vietsub' },'Phim thuyết minh': { mode: 'cutee', slug: 'thuyet-minh' },'Phim lồng tiếng': { mode: 'cutee', slug: 'long-tieng' },'Phim bộ đang chiếu': { mode: 'cutee', slug: 'phim-dang-chieu' },'Phim bộ đã hoàn thành': { mode: 'cutee', slug: 'hoan-tat' },'Phim sắp chiếu': { mode: 'cutee', slug: 'phim-sap-chieu' },'Subteam': { mode: 'cutee', slug: 'subteam' },'Phim chiếu rạp': { mode: 'cutee', slug: 'phim-chieu-rap' } };

// ==================== SOURCE: NGUONC ONLY ====================
const SRC = {
  name: 'Nguonc', code: 'cx', CDN: 'https://phim.nguonc.com/public/images/Poster/',
  url: {
    default: p => `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${p}`,
    genre:   (s,p) => `https://phim.nguonc.com/api/films/danh-sach/${s}?page=${p}`,
    country: (s,p) => `https://phim.nguonc.com/api/films/quoc-gia/${s}?page=${p}`,
    year:    (y,p) => `https://phim.nguonc.com/api/films/nam-phat-hanh/${y}?page=${p}`,
    type:    (t,p) => `https://phim.nguonc.com/api/films/danh-sach/${t}?page=${p}`,
    search:  s     => `https://phim.nguonc.com/api/film/${s}`,
    keyword: (k,p) => `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(k)}&page=${p}`,
  },
  parse: {
    list:    d => d?.items || [],
    search:  d => d?.movie ? [d.movie] : [],
    keyword: d => d?.items || [],
  }
};

// ==================== LRU CACHE ====================
const LRU_MAX = 60;
const _cache = new Map();
const cache = {
  get(k) { if (!_cache.has(k)) return null; const v = _cache.get(k); _cache.delete(k); _cache.set(k, v); return v; },
  set(k, v) { if (_cache.size >= LRU_MAX) _cache.delete(_cache.keys().next().value); _cache.set(k, v); }
};

// ==================== STATE ====================
const ITEMS_PER_PAGE = 24;
let currentMode = 'default', currentFilter = null, currentPage = 1;
let currentSearchQuery = '', currentGenre = null, currentCountry = null, currentYear = null;
const STATE_KEY = 'phim_cx_state';

const saveState = () => sessionStorage.setItem(STATE_KEY, JSON.stringify({ mode: currentMode, filter: currentFilter, page: currentPage, search: currentSearchQuery, genre: currentGenre, country: currentCountry, year: currentYear }));
const loadState = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    if (s.mode) { currentMode = s.mode; currentFilter = s.filter; currentPage = s.page || 1; currentSearchQuery = s.search || ''; currentGenre = s.genre || null; currentCountry = s.country || null; currentYear = s.year || null; }
  } catch {}
};
const clearState = () => sessionStorage.removeItem(STATE_KEY);

// ==================== ABORT ====================
let _currentAbort = null;
const getSignal = () => { _currentAbort?.abort(); _currentAbort = new AbortController(); return _currentAbort.signal; };

// ==================== FETCH ====================
const buildUrl = (mode, filter, page, genre, country, year, isSearch, isKeyword) => {
  if (isKeyword) return SRC.url.keyword(filter, page);
  if (isSearch)  return SRC.url.search(filter);
  if (mode === 'genre')   return SRC.url.genre(genre || filter, page);
  if (mode === 'country') return SRC.url.country(country || filter, page);
  if (mode === 'year')    return SRC.url.year(year || filter, page);
  if (mode === 'type' || mode === 'cutee') return SRC.url.type(filter, page);
  // Nguonc không hỗ trợ combined filter natively — fallback vào genre > country > year
  if (mode === 'combined') {
    if (genre)   return SRC.url.genre(genre, page);
    if (country) return SRC.url.country(country, page);
    if (year)    return SRC.url.year(year, page);
  }
  return SRC.url.default(page);
};

const getEpisodeDisplay = it => {
  if (!it) return '';
  const cur = it.episode_current || it.current_episode || '';
  const tot = it.episode_total || it.total_episodes || '';
  const e = it.episodes || [];
  let c = '', l = 0;
  const cm = cur.match(/Tập (\d+)/i) || cur.match(/(\d+)/);
  if (cm) c = cm[1];
  if (Array.isArray(e)) e.forEach(s => { const d2 = s.server_data || s.items || []; if (Array.isArray(d2)) l += d2.length; });
  let disp = c && tot ? `Tập ${c}/${tot}` : c ? `Tập ${c}` : /full|hoàn tát|hoàn thành/i.test(cur) ? 'Hoàn tất' : cur ? 'Đang phát' : '';
  if (l > 0) disp += ` (${l} link)`;
  return disp;
};

const fetchMovies = async (mode, filter, page, genre, country, year, isSearch = false, isKeyword = false, signal = null) => {
  const key = `cx-${mode}-${filter}-${page}-${genre}-${country}-${year}-${isSearch}-${isKeyword}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const url = buildUrl(mode, filter, page, genre, country, year, isSearch, isKeyword);
  try {
    const opts = signal ? { signal } : {};
    const r = await fetch(url, opts);
    if (!r.ok) return [];
    const d = await r.json();
    const parser = isKeyword ? SRC.parse.keyword : isSearch ? SRC.parse.search : SRC.parse.list;
    const items = (parser(d) || []).map(it => {
      let thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
      if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//')) thumb = SRC.CDN + thumb.replace(/^\/+/, '');
      return { name: it.name || it.origin_name || 'Không rõ', thumb_url: thumb, episodeDisplay: getEpisodeDisplay(it), slug: it.slug || it._id || '', year: String(it.year || ''), lang: (it.lang || '').toUpperCase(), quality: it.quality || '' };
    }).filter(x => x.slug && x.thumb_url);
    cache.set(key, items);
    return items;
  } catch (e) { if (e.name !== 'AbortError') console.warn('[cx] fetch err:', e); return []; }
};

// ==================== INTERSECTION OBSERVER ====================
const imgObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      const img = en.target;
      if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      imgObserver.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

// ==================== CARD ====================
const createCard = m => {
  const c = document.createElement('div');
  c.className = 'movie-item';
  c.onclick = () => { saveState(); location.href = `detail.html?slug=${m.slug}&source=cx`; };

  const epTag = document.createElement('div');
  epTag.className = 'movie-ep-tag'; epTag.textContent = m.episodeDisplay || '';
  if (!epTag.textContent) epTag.style.display = 'none';

  const topRight = document.createElement('div');
  topRight.className = 'movie-top-right';
  const qualityTag = document.createElement('div');
  qualityTag.className = 'movie-quality-tag'; qualityTag.textContent = m.quality || '';
  if (!qualityTag.textContent) qualityTag.style.display = 'none';
  const sourceTag = document.createElement('div');
  sourceTag.className = 'movie-source-tag'; sourceTag.textContent = 'cx';
  topRight.append(qualityTag, sourceTag);

  const langTag = document.createElement('div');
  langTag.className = 'movie-lang-tag'; langTag.textContent = m.lang || 'Vietsub';
  const yearTag = document.createElement('div');
  yearTag.className = 'movie-year-tag'; yearTag.textContent = m.year || '';
  if (!yearTag.textContent) yearTag.style.display = 'none';
  const titleTag = document.createElement('div');
  titleTag.className = 'movie-title'; titleTag.textContent = m.name;

  const img = document.createElement('img');
  img.className = 'movie-img-real'; img.alt = m.name; img.loading = 'lazy'; img.decoding = 'async';
  img.dataset.src = m.thumb_url;
  img.onload = function() { this.style.opacity = '1'; this.parentElement?.classList.add('loaded'); };
  img.onerror = function() { this.style.display = 'none'; };
  imgObserver.observe(img);

  const placeholder = document.createElement('div');
  placeholder.className = 'movie-img-placeholder';

  const imgContainer = document.createElement('div');
  imgContainer.className = 'movie-img-container';
  imgContainer.append(img, placeholder, epTag, topRight, langTag, yearTag, titleTag);
  c.appendChild(imgContainer);
  return c;
};

// ==================== RENDER ====================
const renderMovies = (movies, container) => {
  container.innerHTML = '';
  if (!movies.length) { container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px;color:#aaa;">Không tìm thấy kết quả.</div>'; return; }
  const frag = document.createDocumentFragment();
  movies.slice(0, ITEMS_PER_PAGE).forEach(m => frag.appendChild(createCard(m)));
  container.appendChild(frag);
};

// ==================== SECTION ====================
const createSec = (id, title) => {
  const s = document.createElement('div');
  s.className = 'section'; s.id = id;
  s.innerHTML = `<div class="container"><div class="section-header">${title}</div><div class="movie-grid" id="${id}-grid"></div><div class="pagination" id="${id}-pagination"></div></div>`;
  return s;
};

const showSec = sec => {
  document.querySelectorAll('#main-content > .section').forEach(x => x.style.display = 'none');
  const cont = document.getElementById('main-content');
  const ex = document.getElementById(sec.id);
  if (ex) { ex.style.display = 'block'; cont.insertBefore(ex, cont.firstChild); }
  else { cont.insertBefore(sec, cont.firstChild); sec.style.display = 'block'; }
};

// ==================== PAGINATION ====================
const renderPag = (p, sid, more) => {
  const el = document.getElementById(`${sid}-pagination`); if (!el) return;
  el.innerHTML = '';
  const prev = document.createElement('button');
  prev.className = 'page-btn'; prev.textContent = '‹'; prev.disabled = p === 1;
  prev.onclick = () => goPage(p - 1); el.appendChild(prev);
  const start = Math.max(1, p - 3);
  for (let i = start; i <= start + 7; i++) {
    const b = document.createElement('button');
    b.className = 'page-btn'; if (i === p) b.classList.add('active'); b.textContent = i;
    b.onclick = () => goPage(i); el.appendChild(b);
  }
  const next = document.createElement('button');
  next.className = 'page-btn'; next.textContent = '›'; next.disabled = !more;
  next.onclick = () => goPage(p + 1); el.appendChild(next);
};

const goPage = n => {
  currentPage = n;
  if (currentSearchQuery) search(currentSearchQuery, n);
  else load(currentMode, currentFilter, n, currentGenre, currentCountry, currentYear);
};

// ==================== TITLES ====================
const getTitle = (m, f, g, c, y) => {
  if (m === 'default') return 'PHIM MỚI CẬP NHẬT';
  if (m === 'combined') { const parts = []; if (g) parts.push(`THỂ LOẠI: ${Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === g)?.toUpperCase() || g.toUpperCase()}`); if (c) parts.push(`QUỐC GIA: ${Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === c)?.toUpperCase() || c.toUpperCase()}`); if (y) parts.push(`NĂM: ${y}`); return parts.length ? parts.join(' • ') : 'PHIM'; }
  if (m === 'genre')   return `THỂ LOẠI: ${Object.keys(GENRE_SLUG_MAP).find(k => GENRE_SLUG_MAP[k] === f)?.toUpperCase() || f.toUpperCase()}`;
  if (m === 'country') return `QUỐC GIA: ${Object.keys(COUNTRY_SLUG_MAP).find(k => COUNTRY_SLUG_MAP[k] === f)?.toUpperCase() || f.toUpperCase()}`;
  if (m === 'year')    return `NĂM: ${f}`;
  if (m === 'type')    return { 'phim-bo': 'PHIM BỘ', 'phim-le': 'PHIM LẺ' }[f] || f.toUpperCase();
  if (m === 'cutee')  { const l = Object.keys(CUTEE_MENU).find(k => CUTEE_MENU[k].slug === f || CUTEE_MENU[k].filter === f); return l?.toUpperCase() || f.toUpperCase().replace(/-/g, ' '); }
  return f?.toUpperCase() || 'PHIM';
};

// ==================== SEARCH ====================
const search = async (q = null, p = 1) => {
  const raw = (q || document.getElementById('nav-search-input')?.value || '').trim();
  if (!raw) return load('default');
  currentSearchQuery = raw; currentPage = p; currentGenre = null; currentCountry = null; currentYear = null;
  const sid = 'search-sec';
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, `TÌM: "${raw}"`);
  else { const h = sec.querySelector('.section-header'); if (h) h.textContent = `TÌM: "${raw}"`; }
  showSec(sec);
  const grid = document.getElementById(`${sid}-grid`);
  grid.innerHTML = '<div style="text-align:center;padding:60px;color:#aaa;">Đang tìm...</div>';
  const signal = getSignal();
  const [slugRes, kwRes] = await Promise.all([
    fetchMovies(null, raw, p, null, null, null, true, false, signal),
    fetchMovies(null, raw, p, null, null, null, false, true, signal)
  ]);
  const seen = new Set();
  const fin = [...slugRes, ...kwRes].filter(m => !seen.has(m.slug) && seen.add(m.slug));
  renderMovies(fin, grid);
  renderPag(p, sid, fin.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

// ==================== LOAD ====================
const load = async (m, f = null, p = 1, g = null, c = null, y = null) => {
  currentSearchQuery = '';
  const inp = document.getElementById('nav-search-input'); if (inp) inp.value = '';
  currentMode = m; currentFilter = f; currentPage = p;
  if (m === 'genre')        { currentGenre = f; currentCountry = c; currentYear = y; }
  else if (m === 'country') { currentGenre = null; currentCountry = f; currentYear = y; }
  else if (m === 'year')    { currentGenre = null; currentCountry = null; currentYear = f; }
  else if (m === 'combined') { currentGenre = g; currentCountry = c; currentYear = y; }
  else                      { currentGenre = null; currentCountry = null; currentYear = null; }

  if (m === 'default') { document.querySelectorAll('#main-content > .section').forEach(x => x.remove()); loadTxt(); saveState(); return; }

  const title = getTitle(m, f, currentGenre, currentCountry, currentYear);
  const sid = `${m}-${f || ''}-${currentGenre || ''}-${currentCountry || ''}-${currentYear || ''}-sec`.replace(/--+/g, '-');
  let sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, title);
  showSec(sec);
  const grid = document.getElementById(`${sid}-grid`);
  grid.innerHTML = '<div style="text-align:center;padding:60px;color:#aaa;">Đang tải...</div>';
  const signal = getSignal();
  const movies = await fetchMovies(m, f, p, currentGenre, currentCountry, currentYear, false, false, signal);
  renderMovies(movies, grid);
  renderPag(p, sid, movies.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

// ==================== TRANG CHU TXT ====================
const loadTxt = async () => {
  try {
    const r = await fetch('./trangchu.txt?t=' + Date.now());
    if (!r.ok) throw 1;
    const txt = await r.text(); if (!txt.trim()) throw 1;
    const groups = parseTxt(txt);
    for (const [name, items] of Object.entries(groups)) { if (items.length) await loadGroup(name, items); }
  } catch {
    const mc = document.getElementById('main-content');
    if (mc) mc.innerHTML = '<div class="container"><h2 style="text-align:center;padding:100px;color:#aaa;">Chưa có dữ liệu trangchu.txt</h2></div>';
  }
  saveState();
};

const parseTxt = txt => {
  const lines = txt.split('\n'); const g = {}; let cur = null;
  lines.forEach(l => {
    l = l.trim(); if (!l) return;
    if (l.startsWith('#')) { cur = l.substring(1).trim(); if (!g[cur]) g[cur] = []; return; }
    if (!cur) return;
    const parts = l.split('|'); if (parts.length < 2) return;
    const [st, sk] = parts.map(x => x.trim());
    // Chỉ nhận nguồn cx (nguonc)
    if (sk.toLowerCase() !== 'nguonc' && sk.toLowerCase() !== 'cx') return;
    const sl = st.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    g[cur].push({ slug: sl });
  });
  return g;
};

const loadGroup = async (name, items) => {
  const sid = `txt-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  let sec = document.getElementById(sid);
  if (!sec) { sec = createSec(sid, name); document.getElementById('main-content')?.appendChild(sec); }
  sec.style.display = 'block';
  const grid = document.getElementById(`${sid}-grid`); grid.innerHTML = '';
  const results = await Promise.all(items.map(i => fetchMovies(null, i.slug, null, null, null, null, true, false).catch(() => [])));
  const seen = new Set();
  const fin = results.flat().filter(m => !seen.has(m.slug) && seen.add(m.slug));
  renderMovies(fin, grid);
  const pag = document.getElementById(`${sid}-pagination`); if (pag) pag.style.display = 'none';
};

// ==================== MODAL ====================
const openModal = (title, items, cb) => {
  const bd = document.getElementById('modalBackdrop'); if (!bd) return;
  document.getElementById('modalTitle').textContent = title;
  const body = document.getElementById('modalBody'); body.innerHTML = '';
  items.forEach(it => {
    const d = document.createElement('div');
    d.className = 'modal-item'; d.textContent = it;
    d.onclick = () => { document.querySelectorAll('.modal-item.active').forEach(x => x.classList.remove('active')); d.classList.add('active'); cb(it); };
    body.appendChild(d);
  });
  bd.classList.add('show');
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  if (currentSearchQuery) { const inp = document.getElementById('nav-search-input'); if (inp) inp.value = currentSearchQuery; search(currentSearchQuery, currentPage); }
  else if (currentMode !== 'default') { load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); }
  else loadTxt();

  const mc = document.getElementById('modalClose');
  const mb = document.getElementById('modalBackdrop');
  if (mc) mc.onclick = () => mb?.classList.remove('show');
  if (mb) mb.onclick = e => { if (e.target === mb) mb.classList.remove('show'); };

  document.getElementById('hamburger')?.addEventListener('click', () => {
    openModal('MENU', ['Trang chủ','Thể Loại','Quốc Gia','Năm','Khác','Phim Bộ','Phim Lẻ','Cinemax'], v => {
      if (v === 'Trang chủ') { clearState(); location.reload(); return; }
      if (v === 'Thể Loại') {
        openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), gName => {
          const gSlug = GENRE_SLUG_MAP[gName];
          openModal('LỌC KẾT HỢP', ['Chỉ lọc thể loại', 'Lọc kết hợp (quốc gia + năm)'], choice => {
            if (choice === 'Chỉ lọc thể loại') { load('genre', gSlug, 1); mb?.classList.remove('show'); }
            else {
              openModal('QUỐC GIA', ['Tất cả', ...Object.keys(COUNTRY_SLUG_MAP)], cName => {
                const cSlug = cName === 'Tất cả' ? null : COUNTRY_SLUG_MAP[cName];
                openModal('NĂM', ['Tất cả', ...Array.from({ length: 25 }, (_, i) => String(2026 - i))], yStr => {
                  load('combined', null, 1, gSlug, cSlug, yStr === 'Tất cả' ? null : yStr); mb?.classList.remove('show');
                });
              });
            }
          });
        }); return;
      }
      if (v === 'Quốc Gia') { openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1)); return; }
      if (v === 'Năm')      { openModal('NĂM', Array.from({ length: 25 }, (_, i) => String(2026 - i)), x => load('year', x, 1)); return; }
      if (v === 'Khác')     { openModal('KHÁC', Object.keys(CUTEE_MENU), x => { const cc = CUTEE_MENU[x]; load(cc.mode, cc.slug || cc.filter, 1); }); return; }
      if (v === 'Phim Bộ')  { load('type', 'phim-bo', 1); mb?.classList.remove('show'); return; }
      if (v === 'Phim Lẻ')  { load('type', 'phim-le', 1); mb?.classList.remove('show'); return; }
      if (v === 'Cinemax')  { load('cutee', 'phim-chieu-rap', 1); mb?.classList.remove('show'); return; }
    });
  });

  document.querySelectorAll('.menu-trigger').forEach(el => {
    el.onclick = e => {
      e.preventDefault(); const t = el.dataset.target;
      if (t === 'genre') {
        openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), gName => {
          const gSlug = GENRE_SLUG_MAP[gName];
          openModal('LỌC KẾT HỢP', ['Chỉ lọc thể loại', 'Lọc kết hợp'], choice => {
            if (choice === 'Chỉ lọc thể loại') { load('genre', gSlug, 1); mb?.classList.remove('show'); }
            else {
              openModal('QUỐC GIA', ['Tất cả', ...Object.keys(COUNTRY_SLUG_MAP)], cName => {
                openModal('NĂM', ['Tất cả', ...Array.from({ length: 25 }, (_, i) => String(2026 - i))], yStr => {
                  load('combined', null, 1, gSlug, cName === 'Tất cả' ? null : COUNTRY_SLUG_MAP[cName], yStr === 'Tất cả' ? null : yStr); mb?.classList.remove('show');
                });
              });
            }
          });
        });
      }
      if (t === 'country') openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1));
      if (t === 'year')    openModal('NĂM', Array.from({ length: 25 }, (_, i) => String(2026 - i)), x => load('year', x, 1));
      if (t === 'cutee')   openModal('KHÁC', Object.keys(CUTEE_MENU), x => { const cc = CUTEE_MENU[x]; load(cc.mode, cc.slug || cc.filter, 1); });
    };
  });

  document.getElementById('home-link')?.addEventListener('click', e => { e.preventDefault(); clearState(); location.reload(); });
  document.getElementById('phim-bo')?.addEventListener('click', e => { e.preventDefault(); load('type', 'phim-bo', 1); });
  document.getElementById('phim-le')?.addEventListener('click', e => { e.preventDefault(); load('type', 'phim-le', 1); });
  document.getElementById('phim-chieu-rap')?.addEventListener('click', e => { e.preventDefault(); load('cutee', 'phim-chieu-rap', 1); });
  document.getElementById('nav-search-btn')?.addEventListener('click', () => search());
  document.getElementById('nav-search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') search(); });
});