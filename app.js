const GENRE_SLUG_MAP = { 'Hành Động': 'hanh-dong','Phiêu Lưu': 'phieu-luu','Hoạt Hình': 'hoat-hinh','Hài': 'phim-hai','Hài Hước': 'hai-huoc','Hình Sự': 'hinh-su','Tài Liệu': 'tai-lieu','Chính Kịch': 'chinh-kich','Gia Đình': 'gia-dinh','Giả Tưởng': 'gia-tuong','Lịch Sử': 'lich-su','Kinh Dị': 'kinh-di','Nhạc': 'am-nhac','Âm Nhạc': 'am-nhac','Bí Ẩn': 'bi-an','Lãng Mạn': 'lang-man','Tình Cảm': 'tinh-cam','Khoa Học Viễn Tưởng': 'khoa-hoc-vien-tuong','Gây Cấn': 'gay-can','Chiến Tranh': 'chien-tranh','Tâm Lý': 'tam-ly','Cổ Trang': 'co-trang','Miền Tây': 'mien-tay','Phim 18': 'phim-18','Thể Thao': 'the-thao','Võ Thuật': 'vo-thuat','Viễn Tưởng': 'vien-tuong','Khoa Học': 'khoa-hoc','Thần Thoại': 'than-thoai','Học Đường': 'hoc-duong','Kinh Điển': 'kinh-dien' };
const COUNTRY_SLUG_MAP = { 'Âu Mỹ': 'au-my','Hàn Quốc': 'han-quoc','Trung Quốc': 'trung-quoc','Nhật Bản': 'nhat-ban','Thái Lan': 'thai-lan','Hồng Kông': 'hong-kong','Ấn Độ': 'an-do','Anh': 'anh','Pháp': 'phap','Canada': 'canada','Đức': 'duc','Tây Ban Nha': 'tay-ban-nha','Úc': 'uc','Ý': 'y','Hà Lan': 'ha-lan','Indonesia': 'indonesia','Nga': 'nga','Mexico': 'mexico','Ba Lan': 'ba-lan','Malaysia': 'malaysia','Bồ Đào Nha': 'bo-dao-nha','Thụy Điển': 'thuy-dien','Philippines': 'philippines','Đan Mạch': 'dan-mach','Thụy Sĩ': 'thuy-si','Ukraina': 'ukraina','UAE': 'uae','Ả Rập Xê Út': 'a-rap-xe-ut','Thổ Nhĩ Kỳ': 'tho-nhi-ky','Brazil': 'brazil','Na Uy': 'na-uy','Nam Phi': 'nam-phi','Việt Nam': 'viet-nam','Đài Loan': 'dai-loan','Châu Phi': 'chau-phi','Bỉ': 'bi','Ireland': 'ireland','Colombia': 'colombia','Phần Lan': 'phan-lan','Chile': 'chile','Hy Lạp': 'hy-lap','Nigeria': 'nigeria','Argentina': 'argentina','Singapore': 'singapore','Quốc Gia Khác': 'quoc-gia-khac' };
const CUTEE_MENU = { 'Phim mới': { mode: 'default' },'Phim bộ': { mode: 'type', filter: 'phim-bo' },'Phim lẻ': { mode: 'type', filter: 'phim-le' },'Shows': { mode: 'cutee', slug: 'tv-shows' },'Hoạt hình': { mode: 'cutee', slug: 'hoat-hinh' },'Phim vietsub': { mode: 'cutee', slug: 'vietsub' },'Phim thuyết minh': { mode: 'cutee', slug: 'thuyet-minh' },'Phim lồng tiếng': { mode: 'cutee', slug: 'long-tieng' },'Phim bộ đang chiếu': { mode: 'cutee', slug: 'phim-dang-chieu' },'Phim bộ đã hoàn thành': { mode: 'cutee', slug: 'hoan-tat' },'Phim sắp chiếu': { mode: 'cutee', slug: 'phim-sap-chieu' },'Subteam': { mode: 'cutee', slug: 'subteam' },'Phim chiếu rạp': { mode: 'cutee', slug: 'phim-chieu-rap' } };

const API_SOURCES = { 
  Ophim: { 
    name: 'Ophim', code: 'ax',
    defaultUrl: p => 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=' + p,
    genreUrl: (s,p) => 'https://ophim1.com/v1/api/the-loai/' + s + '?page=' + p,
    countryUrl: (s,p) => 'https://ophim1.com/v1/api/quoc-gia/' + s + '?page=' + p,
    yearUrl: (y,p) => 'https://ophim1.com/v1/api/nam-phat-hanh/' + y + '?page=' + p,
    typeUrl: (t,p) => 'https://ophim1.com/v1/api/danh-sach/' + t + '?page=' + p,
    cuteeUrl: (s,p) => 'https://ophim1.com/v1/api/danh-sach/' + s + '?page=' + p,
    searchUrl: s => 'https://ophim1.com/v1/api/phim/' + s,
    keywordSearchUrl: (k,p) => 'https://ophim1.com/v1/api/tim-kiem?keyword=' + encodeURIComponent(k) + '&page=' + (p || 1),
    parser: d => d?.data?.items || [],
    searchParser: d => d?.data?.item ? [d.data.item] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: () => "https://img.ophim.live/uploads/movies/"
  }, 
  Phimapi: { 
    name: 'Phimapi', code: 'bx',
    defaultUrl: p => 'https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=' + p,
    genreUrl: (s,p) => 'https://phimapi.com/v1/api/the-loai/' + s + '?page=' + p,
    countryUrl: (s,p) => 'https://phimapi.com/v1/api/quoc-gia/' + s + '?page=' + p,
    yearUrl: (y,p) => 'https://phimapi.com/v1/api/nam/' + y + '?page=' + p,
    typeUrl: (t,p) => 'https://phimapi.com/v1/api/danh-sach/' + t + '?page=' + p,
    cuteeUrl: (s,p) => 'https://phimapi.com/v1/api/danh-sach/' + s + '?page=' + p,
    searchUrl: s => 'https://phimapi.com/phim/' + s,
    keywordSearchUrl: (k,p) => 'https://phimapi.com/v1/api/tim-kiem?keyword=' + encodeURIComponent(k) + '&page=' + (p || 1),
    parser: d => d?.data?.items || d?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    keywordParser: d => d?.data?.items || [],
    getCdn: d => (d?.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/').replace(/\/+$/, '') + '/'
  }, 
  Nguonc: { 
    name: 'Nguonc', code: 'cx',
    defaultUrl: p => 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=' + p,
    genreUrl: (s,p) => 'https://phim.nguonc.com/api/films/danh-sach/' + s + '?page=' + p,
    countryUrl: (s,p) => 'https://phim.nguonc.com/api/films/quoc-gia/' + s + '?page=' + p,
    yearUrl: (y,p) => 'https://phim.nguonc.com/api/films/nam-phat-hanh/' + y + '?page=' + p,
    typeUrl: (t,p) => 'https://phim.nguonc.com/api/films/danh-sach/' + t + '?page=' + p,
    cuteeUrl: (s,p) => 'https://phim.nguonc.com/api/films/danh-sach/' + s + '?page=' + p,
    searchUrl: s => 'https://phim.nguonc.com/api/film/' + s,
    keywordSearchUrl: (k,p) => 'https://phim.nguonc.com/api/films/search?keyword=' + encodeURIComponent(k) + '&page=' + (p || 1),
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
const loadState = () => { try { var s = JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); if(s.mode){ currentMode=s.mode; currentFilter=s.filter; currentPage=s.page||1; currentSearchQuery=s.search||''; currentGenre=s.genre||null; currentCountry=s.country||null; currentYear=s.year||null; combinedFilterMode=s.combined===true; } } catch(e){} };
const clearState = () => localStorage.removeItem(STATE_KEY);

const getEpisodeDisplay = i => {
  if (!i) return '';
  var m = i.movie || i;
  var e = i.episodes || m.episodes || [];
  if (!m.episode_current && !m.current_episode && !m.episode_total && !m.total_episodes && !Array.isArray(e)) return (m.type || (m.tmdb && m.tmdb.type)) === 'tv' ? 'Phim bộ' : 'Phim lẻ';
  var c = '', t = '', l = 0;
  var cur = m.episode_current || m.current_episode || '';
  var tot = m.episode_total || m.total_episodes || '';
  var cm = cur.match(/Tập (\d+)/i) || cur.match(/(\d+)/);
  if (cm) c = cm[1];
  if (tot) t = tot;
  if (Array.isArray(e)) e.forEach(function(s){ var d = s.server_data || s.items || []; if (Array.isArray(d)) l += d.length; });
  var disp = c && t ? 'Tập ' + c + '/' + t : c ? 'Tập ' + c : /full|hoàn tất|hoàn thành/i.test(cur) ? 'Hoàn tất' : 'Đang phát';
  if (l > 0) disp += ' (' + l + ' link)';
  return disp;
};

const fetchFromSource = async (src, p, m, f, genre, country, year, isS, isK) => {
  var cacheKey = src.code + '-' + m + '-' + f + '-' + p + '-' + genre + '-' + country + '-' + year + '-' + isS + '-' + isK;
  if (API_CACHE[cacheKey]) return API_CACHE[cacheKey];
  var url = '';
  if (isK) url = src.keywordSearchUrl(f, p);
  else if (isS) url = src.searchUrl(f);
  else if (m === 'combined') {
    var base = '';
    if (src.code === 'ax') {
      if (genre) base = 'https://ophim1.com/v1/api/the-loai/' + genre;
      else if (country) base = 'https://ophim1.com/v1/api/quoc-gia/' + country;
      else if (year) base = 'https://ophim1.com/v1/api/nam-phat-hanh/' + year;
      else base = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat';
      var params = new URLSearchParams({ page: p });
      if (genre && base.indexOf('/the-loai/') === -1) params.append('genre', genre);
      if (country && base.indexOf('/quoc-gia/') === -1) params.append('country', country);
      if (year && base.indexOf('/nam-phat-hanh/') === -1) params.append('year', year);
      url = base + (base.indexOf('?') > -1 ? '&' : '?') + params.toString();
    } else if (src.code === 'bx') {
      base = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat-v1';
      if (genre) base = 'https://phimapi.com/v1/api/the-loai/' + genre;
      var params2 = new URLSearchParams({ page: p });
      if (country) params2.append('country', country);
      if (year) params2.append('year', year);
      url = base + (base.indexOf('?') > -1 ? '&' : '?') + params2.toString();
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
    var r = await fetch(url);
    if (!r.ok) return [];
    var d = await r.json();
    var parser = isK ? src.keywordParser : isS ? src.searchParser : src.parser;
    var items = parser(d) || [];
    var cdn = typeof src.getCdn === 'function' ? src.getCdn(d) : src.getCdn();
    var result = items.map(function(it) {
      var thumb = it.thumb_url || it.poster_url || it.poster || it.thumb || '';
      if (thumb && thumb.indexOf('http') !== 0 && thumb.indexOf('//') !== 0 && cdn) thumb = cdn + thumb.replace(/^\/+/, '');
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
    }).filter(function(x){ return x.slug; });
    API_CACHE[cacheKey] = result;
    return result;
  } catch (e) { return []; }
};

const interleaveFull = async (mode, filter, page, genre, country, year, isSearch, isKeyword) => {
  var sources = Object.values(API_SOURCES);
  if (combinedFilterMode && (mode === 'combined' || mode === 'genre' || mode === 'country' || mode === 'year')) sources = sources.filter(function(s){ return s.code !== 'cx'; });
  var results = await Promise.all(sources.map(function(src){ return fetchFromSource(src, page, mode, filter, genre, country, year, isSearch, isKeyword); }));
  var all = [], seen = {}, idx = new Array(sources.length).fill(0);
  while (all.length < ITEMS_PER_PAGE) {
    var added = false;
    for (var i = 0; i < sources.length; i++) {
      if (idx[i] < results[i].length) {
        var m = results[i][idx[i]];
        var k = m.slug + '-' + m.sourceCode;
        if (!seen[k]) { seen[k] = 1; all.push(m); added = true; }
        idx[i]++;
      }
    }
    if (!added) break;
  }
  return all.slice(0, ITEMS_PER_PAGE);
};

const search = async (q, p) => {
  var raw = (q || (document.getElementById('nav-search-input') || {}).value || '').trim();
  if (!raw) return load('default');
  currentSearchQuery = raw; currentPage = p || 1; currentGenre = null; currentCountry = null; currentYear = null;
  var sid = 'search-sec';
  var sec = document.getElementById(sid);
  if (!sec) sec = createSec(sid, 'TÌM: "' + raw + '"');
  else sec.querySelector('.section-header').textContent = 'TÌM: "' + raw + '"';
  showSec(sec);
  var grid = document.getElementById(sid + '-grid'); grid.innerHTML = '';
  var res1 = await interleaveFull(null, raw, currentPage, null, null, null, true, false);
  var res2 = await interleaveFull(null, raw, currentPage, null, null, null, false, true);
  var all = res1.concat(res2), seen = {}, fin = [];
  for (var i = 0; i < all.length; i++) { var k = all[i].slug + '-' + all[i].sourceCode; if (!seen[k]) { seen[k] = 1; fin.push(all[i]); } }
  await renderFinal(fin, grid, sid + '-progress');
  renderPag(currentPage, sid, fin.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({behavior:'smooth'});
  saveState();
};

var loaded = 0, total = 0;
const updateProg = function(id) {
  loaded++;
  var bar = document.getElementById(id);
  if (bar) bar.style.width = (loaded / total * 100) + '%';
  if (loaded === total) { var pc = document.getElementById(id + '-cont'); if (pc) pc.classList.add('done'); }
};

const createCard = function(m) {
  var c = document.createElement('div'); c.className = 'movie-item'; c.dataset.slug = m.slug; c.dataset.source = m.sourceCode;
  c.onclick = function() { saveState(); location.href = 'detail.html?slug=' + m.slug + '&source=' + m.sourceCode; };
  var epTag = document.createElement('div'); epTag.className = 'movie-ep-tag'; epTag.textContent = m.episodeDisplay || ''; if (!epTag.textContent) epTag.style.display = 'none';
  var topRight = document.createElement('div'); topRight.className = 'movie-top-right';
  var qualityTag = document.createElement('div'); qualityTag.className = 'movie-quality-tag'; qualityTag.textContent = m.quality || ''; if (!qualityTag.textContent) qualityTag.style.display = 'none';
  var sourceTag = document.createElement('div'); sourceTag.className = 'movie-source-tag'; sourceTag.textContent = m.sourceCode || '';
  topRight.appendChild(qualityTag); topRight.appendChild(sourceTag);
  var langTag = document.createElement('div'); langTag.className = 'movie-lang-tag'; langTag.textContent = m.lang || "Vietsub";
  var yearTag = document.createElement('div'); yearTag.className = 'movie-year-tag'; yearTag.textContent = m.year || ''; if (!yearTag.textContent) yearTag.style.display = 'none';
  var titleTag = document.createElement('div'); titleTag.className = 'movie-title'; titleTag.textContent = m.name;
  var imgReal = document.createElement('img'); imgReal.className = 'movie-img-real'; imgReal.loading = 'lazy';
  imgReal.onload = function() { this.style.opacity = '1'; this.parentElement.classList.add('loaded'); };
  imgReal.onerror = function() { updateProg(this.dataset.prog); }; imgReal.dataset.prog = '';
  var imgPlaceholder = document.createElement('div'); imgPlaceholder.className = 'movie-img-placeholder';
  var imgContainer = document.createElement('div'); imgContainer.className = 'movie-img-container';
  imgContainer.appendChild(imgReal); imgContainer.appendChild(imgPlaceholder); imgContainer.appendChild(epTag); imgContainer.appendChild(topRight); imgContainer.appendChild(langTag); imgContainer.appendChild(yearTag); imgContainer.appendChild(titleTag);
  c.appendChild(imgContainer);
  return { card: c, imgReal: imgReal, url: m.thumb_url };
};

const renderFinal = async function(movies, container, id) {
  container.innerHTML = '';
  var disp = movies.slice(0, ITEMS_PER_PAGE); total = disp.length; loaded = 0;
  var frag = document.createDocumentFragment();
  var cards = [];
  for (var i = 0; i < disp.length; i++) cards.push(createCard(disp[i]));
  for (var j = 0; j < cards.length; j++) { cards[j].imgReal.dataset.prog = id; frag.appendChild(cards[j].card); }
  container.appendChild(frag);
  for (var k = 0; k < cards.length; k++) { if (!cards[k].url) { updateProg(id); continue; } cards[k].imgReal.src = cards[k].url; }
  if (total === 0) container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:100px;color:#aaa;">Khong tim thay ket qua.</div>';
};

const createSec = function(id, title) {
  var s = document.createElement('div'); s.className = 'section'; s.id = id;
  s.innerHTML = '<div class="progress-container" id="' + id + '-progress-cont"><div class="progress-bar" id="' + id + '-progress"></div></div><div class="container"><div class="section-header">' + title + '</div><div class="movie-grid" id="' + id + '-grid"></div><div class="pagination" id="' + id + '-pagination"></div></div>';
  return s;
};

const showSec = function(sec) {
  var all = document.querySelectorAll('#main-content > .section');
  for (var i = 0; i < all.length; i++) all[i].style.display = 'none';
  var c = document.getElementById('main-content');
  var ex = document.getElementById(sec.id);
  if (ex) { ex.style.display = 'block'; c.insertBefore(ex, c.firstChild); }
  else { c.insertBefore(sec, c.firstChild); sec.style.display = 'block'; }
};

const renderPag = function(p, sid, more) {
  var el = document.getElementById(sid + '-pagination'); if (!el) return; el.innerHTML = '';
  var prev = document.createElement('button'); prev.className = 'page-btn'; prev.textContent = '\u2039'; prev.disabled = p === 1;
  prev.onclick = function() { currentPage = p - 1; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); };
  el.appendChild(prev);
  for (var i = Math.max(1, p - 3); i <= p + 4; i++) {
    var b = document.createElement('button'); b.className = 'page-btn'; if (i === p) b.classList.add('active'); b.textContent = i;
    b.onclick = function(n) { return function() { currentPage = n; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); }; }(i);
    el.appendChild(b);
  }
  var next = document.createElement('button'); next.className = 'page-btn'; next.textContent = '\u203a'; next.disabled = !more;
  next.onclick = function() { currentPage = p + 1; if (currentSearchQuery) search(currentSearchQuery, currentPage); else load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); };
  el.appendChild(next);
};

const getTitle = function(m, f, g, c, y) {
  if (m === 'default') return 'PHIM MỚI CẬP NHẬT';
  if (m === 'combined') { var parts = []; if (g) parts.push('THỂ LOẠI: ' + (Object.keys(GENRE_SLUG_MAP).find(function(k){ return GENRE_SLUG_MAP[k] === g; }) || g).toUpperCase()); if (c) parts.push('QUỐC GIA: ' + (Object.keys(COUNTRY_SLUG_MAP).find(function(k){ return COUNTRY_SLUG_MAP[k] === c; }) || c).toUpperCase()); if (y) parts.push('NĂM: ' + y); return parts.length ? parts.join(' \u2022 ') : 'PHIM'; }
  if (m === 'genre') return 'THỂ LOẠI: ' + (Object.keys(GENRE_SLUG_MAP).find(function(k){ return GENRE_SLUG_MAP[k] === f; }) || f).toUpperCase();
  if (m === 'country') return 'QUỐC GIA: ' + (Object.keys(COUNTRY_SLUG_MAP).find(function(k){ return COUNTRY_SLUG_MAP[k] === f; }) || f).toUpperCase();
  if (m === 'year') return 'NĂM: ' + f;
  if (m === 'type') return ({ 'phim-bo': 'PHIM BỘ', 'phim-le': 'PHIM LẺ' })[f] || f.toUpperCase();
  if (m === 'cutee') { var l = Object.keys(CUTEE_MENU).find(function(k){ return CUTEE_MENU[k].slug === f || CUTEE_MENU[k].filter === f; }); return l ? l.toUpperCase() : f.toUpperCase().replace(/-/g, ' '); }
  return f ? f.toUpperCase() : 'PHIM';
};

const load = async function(m, f, p, g, c, y) {
  f = f || null; p = p || 1; g = g || null; c = c || null; y = y || null;
  currentSearchQuery = '';
  var inp = document.getElementById('nav-search-input'); if (inp) inp.value = '';
  currentMode = m; currentFilter = f; currentPage = p;
  if (m === 'genre') { currentGenre = f; currentCountry = c; currentYear = y; }
  else if (m === 'country') { currentGenre = null; currentCountry = f; currentYear = y; }
  else if (m === 'year') { currentGenre = null; currentCountry = null; currentYear = f; }
  else if (m === 'combined') { currentGenre = g; currentCountry = c; currentYear = y; }
  else { currentGenre = null; currentCountry = null; currentYear = null; }
  if (m === 'default') { var all = document.querySelectorAll('#main-content > .section'); for (var i = 0; i < all.length; i++) all[i].remove(); loadTxt(); saveState(); return; }
  var title = getTitle(m, f, currentGenre, currentCountry, currentYear);
  var sid = (m + '-' + (f || '') + '-' + (currentGenre || '') + '-' + (currentCountry || '') + '-' + (currentYear || '') + '-sec').replace(/--+/g, '-');
  var sec = document.getElementById(sid); if (!sec) sec = createSec(sid, title);
  showSec(sec);
  var grid = document.getElementById(sid + '-grid'); grid.innerHTML = '';
  var movies = await interleaveFull(m, f, p, currentGenre, currentCountry, currentYear);
  await renderFinal(movies, grid, sid + '-progress');
  renderPag(p, sid, movies.length >= ITEMS_PER_PAGE);
  sec.scrollIntoView({ behavior: 'smooth' });
  saveState();
};

const removeDiacritics = function(str) {
  var map = {'\u00C0':'A','\u00C1':'A','\u1EA2':'A','\u00C3':'A','\u1EA0':'A','\u0102':'A','\u1EB0':'A','\u1EB2':'A','\u1EB4':'A','\u1EB6':'A','\u00C2':'A','\u1EA4':'A','\u1EA6':'A','\u1EA8':'A','\u1EAA':'A','\u1EAC':'A','\u00E0':'a','\u00E1':'a','\u1EA3':'a','\u00E3':'a','\u1EA1':'a','\u0103':'a','\u1EB1':'a','\u1EB3':'a','\u1EB5':'a','\u1EB7':'a','\u00E2':'a','\u1EA7':'a','\u1EA9':'a','\u1EBB':'a','\u1EBD':'a','\u1EBF':'a','\u0110':'D','\u0111':'d','\u00C8':'E','\u00C9':'E','\u1EBA':'E','\u1EBC':'E','\u1EB8':'E','\u00CA':'E','\u1EC0':'E','\u1EC2':'E','\u1EC4':'E','\u1EC6':'E','\u00E8':'e','\u00E9':'e','\u1EBB':'e','\u1EBD':'e','\u1EB9':'e','\u00EA':'e','\u1EC1':'e','\u1EC3':'e','\u1EC5':'e','\u1EC7':'e','\u00CC':'I','\u00CD':'I','\u1EC8':'I','\u0128':'I','\u1ECA':'I','\u00EC':'i','\u00ED':'i','\u1EC9':'i','\u0129':'i','\u1ECB':'i','\u00D2':'O','\u00D3':'O','\u1ED2':'O','\u00D5':'O','\u1ED0':'O','\u00D4':'O','\u1ED4':'O','\u1ED6':'O','\u1ED8':'O','\u1EDA':'O','\u01A0':'O','\u1EDC':'O','\u1EDE':'O','\u1EE0':'O','\u1EE2':'O','\u00F2':'o','\u00F3':'o','\u1ED3':'o','\u00F5':'o','\u1ED1':'o','\u00F4':'o','\u1ED5':'o','\u1ED7':'o','\u1ED9':'o','\u1EDB':'o','\u01A1':'o','\u1EDD':'o','\u1EDF':'o','\u1EE1':'o','\u1EE3':'o','\u00D9':'U','\u00DA':'U','\u1EE6':'U','\u0168':'U','\u1EE4':'U','\u01AF':'U','\u1EE8':'U','\u1EEA':'U','\u1EEC':'U','\u1EEE':'U','\u00F9':'u','\u00FA':'u','\u1EE7':'u','\u0169':'u','\u1EE5':'u','\u01B0':'u','\u1EE9':'u','\u1EEB':'u','\u1EED':'u','\u1EEF':'u','\u1EF2':'Y','\u00DD':'Y','\u1EF6':'Y','\u1EF8':'Y','\u1EF4':'Y','\u1EF3':'y','\u00FD':'y','\u1EF7':'y','\u1EF9':'y','\u1EF5':'y'};
  return str.split('').map(function(c){ return map[c] || c; }).join('');
};

const loadTxt = async function() {
  try {
    var r = await fetch('./trangchu.txt?t=' + Date.now());
    if (!r.ok) throw 1;
    var txt = await r.text(); if (!txt.trim()) throw 1;
    var groups = parseTxt(txt);
    var keys = Object.keys(groups);
    var promises = [];
    for (var i = 0; i < keys.length; i++) { if (groups[keys[i]].length) promises.push(loadGroup(keys[i], groups[keys[i]])); }
    await Promise.all(promises);
  } catch(e) {
    document.getElementById('main-content').innerHTML = '<div class="container"><h2 style="text-align:center;padding:100px;color:#aaa;">Chua co du lieu trangchu.txt</h2></div>';
  }
  saveState();
};

const parseTxt = function(txt) {
  var lines = txt.split('\n'), g = {}, cur = null;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim(); if (!l) continue;
    if (l.indexOf('#') === 0) { cur = l.substring(1).trim(); if (!g[cur]) g[cur] = []; continue; }
    if (!cur) continue;
    var p = l.split('|'); if (p.length < 2) continue;
    var tenPhim = p[0].trim(), maNguon = p[1].trim().toLowerCase(), linkAnh = (p[2] || '').trim();
    var slug = removeDiacritics(tenPhim).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    g[cur].push({ slug: slug, source: maNguon, image: linkAnh, displayName: tenPhim });
  }
  return g;
};

const loadGroup = async function(name, items) {
  var sid = 'txt-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  var sec = document.getElementById(sid); if (!sec) sec = createSec(sid, name);
  var cont = document.getElementById('main-content');
  if (!document.getElementById(sid)) cont.appendChild(sec);
  sec.style.display = 'block';
  var grid = document.getElementById(sid + '-grid'); grid.innerHTML = '';
  var promises = [];
  for (var i = 0; i < items.length; i++) {
    (function(item) {
      promises.push((async function() {
        var src = null;
        var srcKeys = Object.keys(API_SOURCES);
        for (var j = 0; j < srcKeys.length; j++) { if (API_SOURCES[srcKeys[j]].code === item.source) { src = API_SOURCES[srcKeys[j]]; break; } }
        if (!src) return null;
        try {
          var results = await fetchFromSource(src, null, null, item.slug, null, null, null, true, false);
          if (results && results.length > 0) { var movie = results[0]; movie.thumb_url = item.image || ''; return movie; }
        } catch(e) { return null; }
        return null;
      })());
    })(items[i]);
  }
  var results = await Promise.all(promises);
  var fin = [];
  for (var k = 0; k < results.length; k++) { if (results[k] !== null) fin.push(results[k]); }
  await renderFinal(fin, grid, sid + '-progress');
  var pag = document.getElementById(sid + '-pagination'); if (pag) pag.style.display = 'none';
};

// ==================== AI SELECTION ====================

async function aiCallGroq(prompt, maxTokens) {
  var key = localStorage.getItem('groq_key') || '';
  if (!key || key.length < 5) throw new Error('Chua co Groq API Key');
  if (aiAbortCtrl) { try { aiAbortCtrl.abort(); } catch(e){} }
  aiAbortCtrl = new AbortController();
  var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens || 2000, temperature: 0.7 }),
    signal: aiAbortCtrl.signal
  });
  if (!r.ok) { var err = await r.json().catch(function(){ return {}; }); throw new Error((err.error && err.error.message) || 'API loi ' + r.status); }
  var d = await r.json();
  return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
}

async function aiGenerateSelection() {
  var key = localStorage.getItem('groq_key') || '';
  if (!key || key.length < 5) {
    key = prompt('Nhap Groq API Key (lan sau se tu nho):');
    if (!key || !key.trim()) return;
    key = key.trim();
    localStorage.setItem('groq_key', key);
  }

  // Xoa section AI cu (danh dau data-ai)
  var oldAi = document.querySelectorAll('.section[data-ai="1"]');
  for (var i = 0; i < oldAi.length; i++) oldAi[i].remove();

  var loadSec = createSec('ai-loading-sec', 'AI DANG PHAN TICH...');
  showSec(loadSec);
  var grid = document.getElementById('ai-loading-sec-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:#e87ba5;font-size:13px;">AI dang chon phim phu hop cho ban...<br><br><span style="color:#555;font-size:11px;">Dung dong trang, qua trinh mat khoang 20-40 giay</span></div>';
  var pagEl = document.getElementById('ai-loading-sec-pagination'); if (pagEl) pagEl.style.display = 'none';

  try {
    // BUOC 1: AI tao ten nhom + slug the loai
    var step1 = await aiCallGroq(
      'Ban la chuyen gia phim. Tao 6 nhom phim HAY va BAT MAT.\n\nQUY TAC:\n- Ten nhom ngan gon, hap dan, KHONG trung the loai thong thuong\n- Moi nhom co 1 slug the loai hop le tu danh sach: hanh-dong, phieu-luu, hoat-hinh, phim-hai, hai-huoc, hinh-su, tai-lieu, chinh-kich, gia-dinh, gia-tuong, lich-su, kinh-di, am-nhac, bi-an, lang-man, tinh-cam, khoa-hoc-vien-tuong, gay-can, chien-tranh, tam-ly, co-trang, mien-tay, phim-18, the-thao, vo-thuat, vien-tuong, khoa-hoc, than-thoai, hoc-duong, kinh-dien\n- Vi du: "Dan Xuyen Khung Hinh" -> hanh-dong\n\nCHI viet 6 dong, dinh dang CHINH XAC:\n# Ten Nhom Hien Thi|slug-the-loai\n\nKHONG giai thich gi them:',
      300
    );

    // Parse: # Ten Nhom|slug
    var groupData = [];
    var lines1 = step1.split('\n');
    for (var i = 0; i < lines1.length; i++) {
      var l = lines1[i].trim();
      if (l.indexOf('#') !== 0) continue;
      var parts = l.substring(1).trim().split('|');
      if (parts.length < 2) continue;
      var gName = parts[0].trim();
      var gSlug = parts[1].trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      if (gName && gSlug) groupData.push({ name: gName, slug: gSlug });
    }
    if (groupData.length < 3) throw new Error('AI khong tao du nhom');

    // An loading
    loadSec.style.display = 'none';

    // BUOC 2: Goi API ca 3 nguon cho TUNG slug -> hien thi
    for (var j = 0; j < groupData.length; j++) {
      var gd = groupData[j];
      var sid = 'ai-' + gd.slug;
      var sec = document.getElementById(sid);
      if (!sec) sec = createSec(sid, gd.name.toUpperCase());
      sec.setAttribute('data-ai', '1');
      showSec(sec);
      var gGrid = document.getElementById(sid + '-grid');
      if (!gGrid) continue;
      gGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#555;font-size:11px;">Dang tai phim...</div>';

      // Goi API CA 3 NGUON bang interleaveFull voi mode='genre'
      var movies = await interleaveFull('genre', null, 1, gd.slug, null, null, false, false);
      await renderFinal(movies, gGrid, sid + '-progress');
      renderPag(1, sid, movies.length >= ITEMS_PER_PAGE);

      // Luu state de phan trang dung
      (function(slug, name) {
        var pagEl2 = document.getElementById(sid + '-pagination');
        if (pagEl2) {
          // Gan lai onclick cho phan trang cua section AI
          var btns = pagEl2.querySelectorAll('.page-btn');
          for (var b = 0; b < btns.length; b++) {
            (function(btn) {
              var oldClick = btn.onclick;
              btn.onclick = function() {
                if (btn.disabled) return;
                var txt = btn.textContent;
                if (txt === '\u2039') {
                  var curBtn = pagEl2.querySelector('.page-btn.active');
                  var curPage = curBtn ? parseInt(curBtn.textContent) : 2;
                  if (curPage > 1) aiLoadPage(slug, name, curPage - 1);
                } else if (txt === '\u203a') {
                  var curBtn2 = pagEl2.querySelector('.page-btn.active');
                  var curPage2 = curBtn2 ? parseInt(curBtn2.textContent) : 0;
                  aiLoadPage(slug, name, curPage2 + 1);
                } else {
                  aiLoadPage(slug, name, parseInt(txt));
                }
              };
            })(btns[b]);
          }
        }
      })(gd.slug, gd.name);
    }

    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });

  } catch (e) {
    if (e.name === 'AbortError') return;
    if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;"><span style="color:#f87171;font-size:13px;">Loi: ' + e.message + '</span><br><br><span style="color:#555;font-size:11px;">Nhan "AI" de thu lai</span></div>';
  }
}

// Phan trang cho section AI
async function aiLoadPage(slug, name, page) {
  var sid = 'ai-' + slug;
  var sec = document.getElementById(sid); if (!sec) return;
  var grid = document.getElementById(sid + '-grid'); if (!grid) return;
  grid.innerHTML = '';
  var movies = await interleaveFull('genre', null, page, slug, null, null, false, false);
  await renderFinal(movies, grid, sid + '-progress');
  renderPag(page, sid, movies.length >= ITEMS_PER_PAGE);

  // Gan lai onclick cho phan trang
  var pagEl = document.getElementById(sid + '-pagination');
  if (pagEl) {
    var btns = pagEl.querySelectorAll('.page-btn');
    for (var b = 0; b < btns.length; b++) {
      (function(btn) {
        btn.onclick = function() {
          if (btn.disabled) return;
          var txt = btn.textContent;
          if (txt === '\u2039') { var curBtn = pagEl.querySelector('.page-btn.active'); var cp = curBtn ? parseInt(curBtn.textContent) : 2; if (cp > 1) aiLoadPage(slug, name, cp - 1); }
          else if (txt === '\u203a') { var curBtn2 = pagEl.querySelector('.page-btn.active'); var cp2 = curBtn2 ? parseInt(curBtn2.textContent) : 0; aiLoadPage(slug, name, cp2 + 1); }
          else { aiLoadPage(slug, name, parseInt(txt)); }
        };
      })(btns[b]);
    }
  }
  sec.scrollIntoView({ behavior: 'smooth' });
}

// ==================== KHOI TAO ====================
document.addEventListener('DOMContentLoaded', function() {
  loadState();
  if (currentSearchQuery) { var inp = document.getElementById('nav-search-input'); if (inp) inp.value = currentSearchQuery; search(currentSearchQuery, currentPage); }
  else if (currentMode !== 'default') { load(currentMode, currentFilter, currentPage, currentGenre, currentCountry, currentYear); }
  else { loadTxt(); }

  var hamburger = document.getElementById('hamburger');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');

  var openModal = function(t, items, cb) {
    modalTitle.textContent = t; modalBody.innerHTML = '';
    var actives = document.querySelectorAll('.modal-item.active'); for (var i = 0; i < actives.length; i++) actives[i].classList.remove('active');
    for (var j = 0; j < items.length; j++) {
      (function(it) {
        var d = document.createElement('div'); d.className = 'modal-item'; d.textContent = it;
        d.onclick = function() { var a = document.querySelectorAll('.modal-item.active'); for (var x = 0; x < a.length; x++) a[x].classList.remove('active'); d.classList.add('active'); cb(it); };
        modalBody.appendChild(d);
      })(items[j]);
    }
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
          openModal('THE LOAI', Object.keys(GENRE_SLUG_MAP), function(gn) {
            var gs = GENRE_SLUG_MAP[gn];
            openModal('LOC KET HOP', ['Bat (Toc do cao)', 'Tat (Nhieu ket qua)', 'Chi loc the loai'], function(ch) {
              if (ch === 'Chi loc the loai') { combinedFilterMode = false; load('genre', gs, 1); closeModal(); }
              else { combinedFilterMode = ch === 'Bat (Toc do cao)'; openModal('QUOC GIA', ['Tat ca'].concat(Object.keys(COUNTRY_SLUG_MAP)), function(cn) { var cs = cn === 'Tat ca' ? null : COUNTRY_SLUG_MAP[cn]; openModal('NAM', ['Tat ca'].concat(Array.from({length:25},function(_,i){return 2026-i;})), function(ys) { var y = ys === 'Tat ca' ? null : ys; load('combined', null, 1, gs, cs, y); closeModal(); }); }); }
            });
          });
          return;
        }
        if (v === 'Quoc Gia') { openModal('QUOC GIA', Object.keys(COUNTRY_SLUG_MAP), function(x) { load('country', COUNTRY_SLUG_MAP[x], 1); }); return; }
        if (v === 'Nam') { openModal('NAM', Array.from({length:25},function(_,i){return 2026-i;}), function(x) { load('year', x, 1); }); return; }
        if (v === 'Khac') { openModal('KHAC', Object.keys(CUTEE_MENU), function(x) { var c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); }); return; }
        if (v === 'Phim Bo') { load('type', 'phim-bo', 1); closeModal(); return; }
        if (v === 'Phim Le') { load('type', 'phim-le', 1); closeModal(); return; }
        if (v === 'Cinemax') { load('cutee', 'phim-chieu-rap', 1); closeModal(); return; }
        if (v === 'AI De Xuat') { aiGenerateSelection(); closeModal(); return; }
      });
    };
  }

  var triggers = document.querySelectorAll('.menu-trigger');
  for (var i = 0; i < triggers.length; i++) {
    (function(el) {
      el.onclick = function(e) {
        e.preventDefault();
        var t = el.dataset.target;
        if (t === 'genre') {
          openModal('THE LOAI', Object.keys(GENRE_SLUG_MAP), function(gn) {
            var gs = GENRE_SLUG_MAP[gn];
            openModal('LOC KET HOP', ['Bat (Toc do cao)', 'Tat (Nhieu ket qua)', 'Chi loc the loai'], function(ch) {
              if (ch === 'Chi loc the loai') { combinedFilterMode = false; load('genre', gs, 1); closeModal(); }
              else { combinedFilterMode = ch === 'Bat (Toc do cao)'; openModal('QUOC GIA', ['Tat ca'].concat(Object.keys(COUNTRY_SLUG_MAP)), function(cn) { var cs = cn === 'Tat ca' ? null : COUNTRY_SLUG_MAP[cn]; openModal('NAM', ['Tat ca'].concat(Array.from({length:25},function(_,i){return 2026-i;})), function(ys) { var y = ys === 'Tat ca' ? null : ys; load('combined', null, 1, gs, cs, y); closeModal(); }); }); }
            });
          });
        }
        if (t === 'country') openModal('QUOC GIA', Object.keys(COUNTRY_SLUG_MAP), function(x) { load('country', COUNTRY_SLUG_MAP[x], 1); });
        if (t === 'year') openModal('NAM', Array.from({length:25},function(_,i){return 2026-i;}), function(x) { load('year', x, 1); });
        if (t === 'cutee') openModal('KHAC', Object.keys(CUTEE_MENU), function(x) { var c = CUTEE_MENU[x]; load(c.mode, c.slug || c.filter, 1); });
        if (t === 'ai') { aiGenerateSelection(); closeModal(); }
      };
    })(triggers[i]);
  }

  var homeLink = document.getElementById('home-link'); if (homeLink) homeLink.onclick = function(e) { e.preventDefault(); clearState(); location.reload(); };
  var homeNav = document.getElementById('home-link-nav'); if (homeNav) homeNav.onclick = function(e) { e.preventDefault(); clearState(); location.reload(); };
  var phimBo = document.getElementById('phim-bo'); if (phimBo) phimBo.onclick = function(e) { e.preventDefault(); load('type', 'phim-bo', 1); };
  var phimLe = document.getElementById('phim-le'); if (phimLe) phimLe.onclick = function(e) { e.preventDefault(); load('type', 'phim-le', 1); };
  var phimRap = document.getElementById('phim-chieu-rap'); if (phimRap) phimRap.onclick = function(e) { e.preventDefault(); load('cutee', 'phim-chieu-rap', 1); };
  var searchBtn = document.getElementById('nav-search-btn'); if (searchBtn) searchBtn.onclick = function() { search(); };
  var searchInp = document.getElementById('nav-search-input'); if (searchInp) searchInp.onkeypress = function(e) { if (e.key === 'Enter') search(); };
});
