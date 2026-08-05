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

// Tối ưu số cột grid tự động theo màn hình (A32, PC 1366...)
const adjustGridForScreen = () => {
  const w = window.innerWidth;
  let cols = 6;
  if (w <= 600) cols = 2;
  else if (w <= 768) cols = 4;
  else if (w <= 1366) cols = 5;
  
  document.documentElement.style.setProperty('--grid-cols', cols);
  return cols;
};

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

// Hàm kiểm tra link ảnh 404 (Async)
const checkImageValid = (url) => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
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

      if (thumb && !thumb.startsWith('http') && !thumb.startsWith('//') && cdn) {
        thumb = cdn + thumb.replace(/^\/+/, '');
      }
      
      // Sửa lỗi link Ophim bị lặp /uploads/movies/
      if (src.code === 'ax' && thumb.includes('/uploads/movies/uploads/movies/')) {
        thumb = thumb.replace('/uploads/movies/uploads/movies/', '/uploads/movies/');
      }
      
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
  grid.innerHTML = '<div class="loading-text">ĐANG TÌM KIẾM...</div>';

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
  if (bar) bar.style.width = Math.min(100, (loaded / total * 100)) + '%';
  if (loaded >= total) {
    const cont = document.getElementById(id + '-cont');
    if (cont) cont.classList.add('done');
  }
};

const createCardHTML = (m, progId) => {
  const epDisplay = m.episodeDisplay ? `<div class="movie-ep-tag">${m.episodeDisplay}</div>` : '';
  const qualityTag = m.quality ? `<div class="movie-quality-tag">${m.quality}</div>` : '';
  const sourceTag = `<div class="movie-source-tag">${m.sourceCode || ''}</div>`;
  const topRight = `<div class="movie-top-right">${qualityTag}${sourceTag}</div>`;
  const langTag = `<div class="movie-lang-tag">${m.lang || "Vietsub"}</div>`;
  const yearTag = m.year ? `<div class="movie-year-tag">${m.year}</div>` : '';
  const titleTag = `<div class="movie-title">${m.name}</div>`;
  
  const safeName = m.name.replace(/'/g, "\\'");
  
  // Luôn dùng thẻ img thật, vì ta đã lọc 404 từ trước
  const imgReal = `<img class="movie-img-real" data-src="${m.thumb_url}" alt="${safeName}" data-prog="${progId}">`;
  const imgPlaceholder = `<div class="movie-img-placeholder"></div>`;
  
  return `
    <div class="movie-item" data-slug="${m.slug}" data-source="${m.sourceCode}">
      <div class="movie-img-container">
        ${imgPlaceholder}
        ${imgReal}
        ${epDisplay}
        ${topRight}
        ${langTag}
        ${yearTag}
        ${titleTag}
      </div>
    </div>
  `;
};

const renderFinal = async (movies, container, id) => {
  container.innerHTML = '';
  
  // Lấy danh sách phim có link ảnh
  let disp = movies.filter(m => {
      const url = m.thumb_url || '';
      return url.trim() !== '' && (url.startsWith('http') || url.startsWith('//'));
  }).slice(0, ITEMS_PER_PAGE);

  // KIỂM TRA 404: Nếu ảnh hỏng -> LOẠI BỎ PHIM ĐÓ KHỎI MÀN HÌNH
  disp = await Promise.all(disp.map(async m => {
      const isValid = await checkImageValid(m.thumb_url);
      return isValid ? m : null;
  }));
  disp = disp.filter(m => m !== null);

  total = disp.length;
  loaded = 0;
  
  const bar = document.getElementById(id);
  if (bar) bar.style.width = '0%';
  
  if (total === 0) {
    if (bar) bar.style.width = '100%';
    document.getElementById(id + '-cont')?.classList.add('done');
    container.innerHTML = '<div class="no-results">Không có phim hợp lệ (Ảnh lỗi hoặc không có dữ liệu).</div>';
    return;
  }

  // Dùng DocumentFragment để đẩy toàn bộ HTML 1 lần
  const fragment = document.createDocumentFragment();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = disp.map(m => createCardHTML(m, id)).join('');
  
  while (wrapper.firstChild) {
    fragment.appendChild(wrapper.firstChild);
  }
  container.appendChild(fragment);

  // IntersectionObserver: Chỉ load ảnh khi cuộn tới
  const imgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        
        img.onload = function() { 
          this.style.opacity = '1'; 
          this.parentElement.classList.add('loaded');
          updateProg(this.dataset.prog);
        };
        
        img.onerror = function() { 
          updateProg(this.dataset.prog); 
        };
        
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  container.querySelectorAll('.movie-item').forEach(item => {
    item.onclick = () => { 
      saveState(); 
      location.href = `detail.html?slug=${item.dataset.slug}&source=${item.dataset.source}`; 
    };
  });

  container.querySelectorAll('.movie-img-real').forEach(img => imgObserver.observe(img));
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
  grid.innerHTML = '<div class="loading-text">ĐANG TẢI...</div>';

  const movies = await interleaveFull(m, f, p, currentGenre, currentCountry, currentYear);
  await renderFinal(movies, grid, `${sid}-progress`);
  renderPag(p, sid, movies.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

const removeDiacritics = str => {
  const map = {
    'A':'A','À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A','Ă':'A','Ằ':'A','Ắ':'A','Ẳ':'A','Ẵ':'A','Ặ':'A','Â':'A','Ầ':'A','Ấ':'A','Ẩ':'A','Ẫ':'A','Ậ':'A',
    'a':'a','à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'D':'D','Đ':'D','d':'d','đ':'d',
    'E':'E','È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E','Ê':'E','Ề':'E','Ế':'E','Ể':'E','Ễ':'E','Ệ':'E',
    'e':'e','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
    'I':'I','Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I','i':'i','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'O':'O','Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O','Ô':'O','Ồ':'O','Ố':'O','Ổ':'O','Ỗ':'O','Ộ':'O','Ơ':'O','Ờ':'O','Ớ':'O','Ở':'O','Ỡ':'O','Ợ':'O',
    'o':'o','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
    'U':'U','Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U','Ư':'U','Ừ':'U','Ứ':'U','Ử':'U','Ữ':'U','Ự':'U',
    'u':'u','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
    'Y':'Y','Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y','y':'y','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'
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
    document.getElementById('main-content').innerHTML = '<div class="container"><h2 class="loading-text">Chưa có dữ liệu trangchu.txt</h2></div>';
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
    
    const tenPhim = p[0].trim();
    const maNguon = p[1].trim().toLowerCase();
    const linkAnh = (p[2] || '').trim();

    const slug = removeDiacritics(tenPhim)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    g[cur].push({ slug, source: maNguon, image: linkAnh, displayName: tenPhim });
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
  grid.innerHTML = '<div class="loading-text">ĐANG TẢI PHIM...</div>';

  const fetchPromises = items.map(async (item) => {
    const src = Object.values(API_SOURCES).find(s => s.code === item.source);
    if (!src) return null;

    try {
      const results = await fetchFromSource(src, null, null, item.slug, null, null, null, true, false);
      if (results && results.length > 0) {
        const movie = results[0];
        if (item.image) movie.thumb_url = item.image;
        return movie;
      }
    } catch (e) { console.error("Lỗi:", e); }
    return null;
  });

  const results = await Promise.all(fetchPromises);
  const fin = results.filter(m => m !== null);
  
  await renderFinal(fin, grid, `${sid}-progress`);
  document.getElementById(`${sid}-pagination`).style.display = 'none';
};

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', () => {
  adjustGridForScreen();
  window.addEventListener('resize', () => {
      const cols = adjustGridForScreen();
      document.querySelectorAll('.movie-grid').forEach(g => g.style.gridTemplateColumns = `repeat(${cols}, 1fr)`);
  });

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