const GENRE_SLUG_MAP = { 'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai','Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich','Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di','Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man','Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can','Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay','Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong','Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien' };
const COUNTRY_SLUG_MAP = { 'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban','Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap','Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan','Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia','Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach','Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut','Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi','Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi','Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile','Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore','Quốc Gia Khác': 'quoc-gia-khac' };
const TYPE_MAP = {'phim-bo': 'phim-bo','phim-le': 'phim-le','thuyet-minh': 'phim-thuyet-minh','chieu-rap': 'phim-chieu-rap'};
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

let ITEMS_PER_PAGE = 18, currentMode = 'default', currentFilter = null, currentPage = 1, currentSearchQuery = '';

// ==================== PROXY ẢNH WESERV.NL ====================
const proxyImage = (url) => {
    if (!url || url.includes('images.weserv.nl') || url.includes('placeholder')) return url || 'https://via.placeholder.com/300x450/222222/999999?text=No+Image';
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=200&fit=outside&output=webp&q=90&il`;
};
const PLACEHOLDER_LOW = 'abc.jpg';

// ==================== LƯU / KHÔI PHỤC TRẠNG THÁI ====================
const STATE_KEY = 'phim_state';
const saveState = () => localStorage.setItem(STATE_KEY, JSON.stringify({mode:currentMode,filter:currentFilter,page:currentPage,search:currentSearchQuery}));
const loadState = () => { try{ const s = JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); if(s.mode){ currentMode=s.mode; currentFilter=s.filter; currentPage=s.page||1; currentSearchQuery=s.search||''; }}catch{} };
const clearState = () => localStorage.removeItem(STATE_KEY);

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

// ==================== FETCH + XỬ LÝ DỮ LIỆU (CHỈ SỬA DÒNG NÀY) ====================
const fetchFromSource = async (src, p, m, f, isS = false, isK = false) => {
  let url = '';
  if (isK) url = src.keywordSearchUrl(f, p);
  else if (isS) url = src.searchUrl(f);
  else if (m === 'genre') url = src.genreUrl(f, p);
  else if (m === 'country') url = src.countryUrl(f, p);
  else if (m === 'year') url = src.yearUrl(f, p);
  else if (m === 'type' || m === 'cutee') url = (src.cuteeUrl || src.typeUrl)(f, p);
  else url = src.defaultUrl(p);

  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    const parser = isK ? src.keywordParser : isS ? src.searchParser : src.parser;
    let items = parser(d) || [];
    const cdn = typeof src.getCdn === 'function' ? src.getCdn(d) : src.getCdn();

    return items.map(it => {
      // ĐÂY LÀ DÒNG DUY NHẤT ĐƯỢC SỬA THEO YÊU CẦU CỦA BẠN
      let thumb = '';
      if (src.code === 'ax') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';        // Ophim → thumb_url
      if (src.code === 'bx') thumb = it.poster_url || it.thumb_url || it.poster || it.thumb || '';        // Phimapi → poster_url
      if (src.code === 'cx') thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';        // Nguonc → thumb_url

      if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//') && cdn) thumb = cdn + thumb.replace(/^\/+/, '');
      return {
        name: it.name || it.origin_name || it.title || 'Không rõ',
        thumb_url: proxyImage(thumb),
        episodeDisplay: getEpisodeDisplay(it),
        slug: it.slug || it._id || '',
        sourceCode: src.code,
        sourceName: src.name,
        year: (it.year || '').toString(),
        lang: (it.lang || '').toUpperCase(),
        quality: it.quality || ''
      };
    }).filter(x => x.slug && x.thumb_url);
  } catch (e) { console.error('FETCH ERR:', src.name, e); return []; }
};

// ==================== TỪ ĐÂY TRỞ XUỐNG GIỮ NGUYÊN 100% CODE CỦA BẠN ====================
const interleaveFull = async (mode, filter, page, isSearch = false, isKeyword = false) => {
const sources = Object.values(API_SOURCES);
  const results = await Promise.all(sources.map(src => fetchFromSource(src, page, mode, filter, isSearch, isKeyword)));
  const all = []; const seen = new Set(); let idx = new Array(sources.length).fill(0);
  while (all.length < ITEMS_PER_PAGE * 1) {
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
  const raw = (q || document.getElementById('nav-search-input').value).trim();
  if (!raw) return load('default');
  currentSearchQuery = raw; currentPage = p;
  const sid = 'search-sec';
  let sec = document.getElementById(sid); if (!sec) sec = createSec(sid, `TÌM: "${raw}"`);
  else sec.querySelector('.section-header').textContent = `TÌM: "${raw}"`;
  showSec(sec); const grid = document.getElementById(`${sid}-grid`); grid.innerHTML = '';
  const slugMovies = await interleaveFull(null, raw, p, true);
  const keyMovies = await interleaveFull(null, raw, p, false, true);
  const all = [...slugMovies, ...keyMovies];
  const seen = new Set(), fin = all.filter(m => !seen.has(m.slug + m.sourceCode) && seen.add(m.slug + m.sourceCode));
  await renderFinal(fin, grid, `${sid}-progress`);
  renderPag(p, sid, fin.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({behavior:'smooth'});
  saveState();
};

let loaded = 0, total = 0, progId = null;
const updateProg = id => {
  loaded++;
  const bar = document.getElementById(id);
  if (bar) bar.style.width = (loaded / total * 100) + '%';
  if (loaded === total) document.getElementById(id + '-cont')?.classList.add('done');
};

const createCard = (m) => {
  const c = document.createElement('div'); c.className = 'movie-item';
  c.dataset.slug = m.slug; c.dataset.source = m.sourceCode;
  c.onclick = () => { saveState(); location.href = `detail.html?slug=${m.slug}&source=${m.sourceCode}`; };

  const epTag = document.createElement('div'); epTag.className = 'movie-ep-tag'; epTag.textContent = m.episodeDisplay || ''; if (!epTag.textContent) epTag.style.display = 'none';
  const topRight = document.createElement('div'); topRight.className = 'movie-top-right';
  const qualityTag = document.createElement('div'); qualityTag.className = 'movie-quality-tag'; qualityTag.textContent = m.quality || ''; if (!qualityTag.textContent) qualityTag.style.display = 'none';
  const sourceTag = document.createElement('div'); sourceTag.className = 'movie-source-tag'; sourceTag.textContent = m.sourceCode || '';
  topRight.append(qualityTag, sourceTag);
  const langTag = document.createElement('div'); langTag.className = 'movie-lang-tag'; langTag.textContent = m.lang || "Vietsub";
  const yearTag = document.createElement('div'); yearTag.className = 'movie-year-tag'; yearTag.textContent = m.year || ''; if (!yearTag.textContent) yearTag.style.display = 'none';
  const titleTag = document.createElement('div'); titleTag.className = 'movie-title'; titleTag.textContent = m.name;

  const imgReal = document.createElement('img'); imgReal.className = 'movie-img-real'; imgReal.loading = 'lazy';
  const imgPlaceholder = document.createElement('img'); imgPlaceholder.className = 'movie-img-placeholder'; imgPlaceholder.src = PLACEHOLDER_LOW;

  const imgContainer = document.createElement('div'); imgContainer.className = 'movie-img-container';
  imgContainer.append(imgReal, imgPlaceholder, epTag, topRight, langTag, yearTag, titleTag);
  c.appendChild(imgContainer);

  return { card: c, imgReal, imgPlaceholder, url: m.thumb_url };
};

const renderFinal = async (movies, container, id) => {
  container.innerHTML = '';
  const disp = movies.slice(0, ITEMS_PER_PAGE);
  total = disp.length; loaded = 0; progId = id;
  const cards = disp.map(m => createCard(m));
  cards.forEach(o => container.appendChild(o.card));
  cards.forEach(o => {
    if (!o.url) { o.imgPlaceholder.style.opacity = '1'; updateProg(id); return; }
    const img = new Image();
    img.onload = () => { o.imgReal.src = o.url; o.imgReal.style.opacity = '1'; o.imgPlaceholder.style.opacity = '0'; updateProg(id); };
    img.onerror = () => { o.imgPlaceholder.style.opacity = '1'; updateProg(id); };
    img.src = o.url;
  });
};


const createSec = (id, title) => {
  const s = document.createElement('div'); s.className='section'; s.id=id;
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
  const el = document.getElementById(`${sid}-pagination`); if (!el) return; el.innerHTML = '';
  const prev = document.createElement('button'); prev.className='page-btn'; prev.textContent='‹'; prev.disabled=p===1;
  prev.onclick = () => { currentSearchQuery ? search(currentSearchQuery, p-1) : load(currentMode, currentFilter, p-1); }; el.appendChild(prev);
  for (let i = Math.max(1, p-3); i <= p+4; i++) {
    const b = document.createElement('button'); b.className='page-btn'; if (i===p) b.classList.add('active'); b.textContent=i;
    b.onclick = () => { currentSearchQuery ? search(currentSearchQuery, i) : load(currentMode, currentFilter, i); }; el.appendChild(b);
  }
  const next = document.createElement('button'); next.className='page-btn'; next.textContent='›'; next.disabled=!more;
  next.onclick = () => { currentSearchQuery ? search(currentSearchQuery, p+1) : load(currentMode, currentFilter, p+1); }; el.appendChild(next);
};

const getTitle = (m, f) => {
  if (m==='default') return 'PHIM MỚI NHÀ BÁNH MÌ';
  if (m==='genre') return `THỂ LOẠI: ${Object.keys(GENRE_SLUG_MAP).find(k=>GENRE_SLUG_MAP[k]===f)?.toUpperCase()||f.toUpperCase()}`;
  if (m==='country') return `QUỐC GIA: ${Object.keys(COUNTRY_SLUG_MAP).find(k=>COUNTRY_SLUG_MAP[k]===f)?.toUpperCase()||f.toUpperCase()}`;
  if (m==='year') return `NĂM: ${f}`;
  if (m==='type') return {'phim-bo':'PHIM BỘ','phim-le':'PHIM LẺ'}[f]||f.toUpperCase();
  if (m==='cutee') { const l=Object.keys(CUTEE_MENU).find(k=>CUTEE_MENU[k].slug===f||CUTEE_MENU[k].filter===f); return l?.toUpperCase()||f.toUpperCase().replace(/-/g,' '); }
  return f?.toUpperCase()||'PHIM';
};

const load = async (m, f=null, p=1) => {
  currentSearchQuery = ''; document.getElementById('nav-search-input').value = '';
  currentMode=m; currentFilter=f; currentPage=p;
  if (m==='default') { document.querySelectorAll('#main-content > .section').forEach(x=>x.remove()); loadTxt(); saveState(); return; }
  const title=getTitle(m,f), sid=`${m}-${f||''}-sec`.replace(/--/g,'-');
  let sec=document.getElementById(sid); if(!sec) sec=createSec(sid,title);
  showSec(sec); const grid=document.getElementById(`${sid}-grid`); grid.innerHTML='';
  const movies=await interleaveFull(m,f,p);
  await renderFinal(movies,grid,`${sid}-progress`);
  renderPag(p,sid,movies.length>=ITEMS_PER_PAGE);
  sec.scrollIntoView({behavior:'smooth'});
  saveState();
};

const loadTxt = async () => {
  try {
    const r = await fetch('custom-menu.txt?t=' + Date.now());
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
  const lines = txt.split('\n'), g = {}; let cur = null;
  lines.forEach(l => {
    l = l.trim(); if (!l) return;
    if (l.startsWith('#')) { cur = l.substring(1).trim(); if (!g[cur]) g[cur] = []; return; }
    if (!cur) return;
    const p = l.split('|'); if (p.length < 2) return;
    const [st, sk, dt] = p.map(x => x.trim());
    const sl = st.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'-').replace(/^-+|-+$/g,'');
    g[cur].push({slug:sl, source:sk.toLowerCase(), display:dt||st});
  });
  return g;
};
const loadGroup = async (name, items) => {
  const sid = `txt-${name.toLowerCase().replace(/[^a-z0-9]/g,'-')}`;
  let sec = document.getElementById(sid); if (!sec) sec = createSec(sid, name);
  const cont = document.getElementById('main-content');
  if (!document.getElementById(sid)) cont.appendChild(sec);
  sec.style.display = 'block';
  const grid = document.getElementById(`${sid}-grid`); grid.innerHTML = '';
  const all = [];
  for (const i of items) {
    const src = Object.values(API_SOURCES).find(s => s.name.toLowerCase() === i.source);
    if (!src) continue;
    const res = await fetchFromSource(src, null, null, i.slug, true, false);
    all.push(...res);
  }
  const seen = new Set(), fin = all.filter(m => !seen.has(m.slug + m.sourceCode) && seen.add(m.slug + m.sourceCode));
  await renderFinal(fin, grid, `${sid}-progress`);
  document.getElementById(`${sid}-pagination`).style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (currentSearchQuery) {
    document.getElementById('nav-search-input').value = currentSearchQuery;
    search(currentSearchQuery, currentPage);
  } else if (currentMode !== 'default') {
    load(currentMode, currentFilter, currentPage);
  } else {
    loadTxt();
  }

  const hamburger = document.getElementById('hamburger');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  const openModal = (t, items, cb) => {
    modalTitle.textContent = t; modalBody.innerHTML = '';
    document.querySelectorAll('.modal-item.active').forEach(x=>x.classList.remove('active'));
    items.forEach(it => {
      const d = document.createElement('div'); d.className = 'modal-item'; d.textContent = it;
      d.onclick = () => { document.querySelectorAll('.modal-item.active').forEach(x=>x.classList.remove('active')); d.classList.add('active'); cb(it); };
      modalBody.appendChild(d);
    });
    modalBackdrop.classList.add('show');
  };
  const closeModal = () => modalBackdrop.classList.remove('show');
  modalClose.onclick = closeModal;
  modalBackdrop.onclick = e => { if (e.target === modalBackdrop) closeModal(); };

  if (hamburger) hamburger.onclick = () => openModal(
    'MENU',
    ['Trang chủ','Thể Loại','Quốc Gia','Năm','Khác','Phim Bộ','Phim Lẻ','Cinemax'],
    v => {
      if (v === 'Trang chủ') { clearState(); location.reload(); return; }
      if (v === 'Thể Loại') openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), x => load('genre', GENRE_SLUG_MAP[x], 1));
      if (v === 'Quốc Gia') openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x => load('country', COUNTRY_SLUG_MAP[x], 1));
      if (v === 'Năm') openModal('NĂM', Array.from({length:25},(_,i)=>2025-i), x => load('year', x, 1));
      if (v === 'Khác') openModal('KHÁC', Object.keys(CUTEE_MENU), x => { const c=CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); });
      if (v === 'Phim Bộ') load('type', 'phim-bo', 1);
      if (v === 'Phim Lẻ') load('type', 'phim-le', 1);
      if (v === 'Cinemax') load('cutee', 'phim-chieu-rap', 1);
    }
  );

  document.querySelectorAll('.menu-trigger').forEach(el => {
    el.onclick = e => { e.preventDefault();
      const t = el.dataset.target;
      if(t==='genre') openModal('THỂ LOẠI', Object.keys(GENRE_SLUG_MAP), x=>load('genre',GENRE_SLUG_MAP[x],1));
      if(t==='country') openModal('QUỐC GIA', Object.keys(COUNTRY_SLUG_MAP), x=>load('country',COUNTRY_SLUG_MAP[x],1));
      if(t==='year') openModal('NĂM', Array.from({length:25},(_,i)=>2025-i), x=>load('year',x,1));
      if(t==='cutee') openModal('KHÁC', Object.keys(CUTEE_MENU), x=>{const c=CUTEE_MENU[x];load(c.mode,c.slug||c.filter,1);});
    };
  });

  document.getElementById('home-link')?.addEventListener('click', e => { e.preventDefault(); clearState(); load('default'); });
  document.getElementById('phim-bo')?.addEventListener('click', e => { e.preventDefault(); load('type','phim-bo',1); });
  document.getElementById('phim-le')?.addEventListener('click', e => { e.preventDefault(); load('type','phim-le',1); });
  document.getElementById('phim-chieu-rap')?.addEventListener('click', e => { e.preventDefault(); load('cutee','phim-chieu-rap',1); });
  document.getElementById('nav-search-btn')?.addEventListener('click', () => search());
  document.getElementById('nav-search-input')?.addEventListener('keypress', e => { if(e.key==='Enter') search(); });
});
