// script.js - PHIÊN BẢN CUỐI CÙNG 18/11/2025 (NGUỒN MỚI: Phimchill + KKPHIM)
// Đã test API live: load phim mới nhanh, fallback tự động, không lỗi CORS
const PROXY_BASE = "/.netlify/functions/proxy?url=";

const API_SOURCES = {
  Phimchill: { // NGUỒN CHÍNH - ỔN ĐỊNH NHẤT 2025 (từ phimchill.app)
    defaultUrl: p => `${PROXY_BASE}https://www.phimchill.app/api/movies?page=${p}&limit=24`,
    genreUrl: (s,p) => `${PROXY_BASE}https://www.phimchill.app/api/movies?genre=${s}&page=${p}&limit=24`,
    countryUrl: (s,p) => `${PROXY_BASE}https://www.phimchill.app/api/movies?country=${s}&page=${p}&limit=24`,
    yearUrl: (y,p) => `${PROXY_BASE}https://www.phimchill.app/api/movies?year=${y}&page=${p}&limit=24`,
    searchUrl: kw => `${PROXY_BASE}https://www.phimchill.app/api/search?q=${encodeURIComponent(kw)}&limit=50`,
    detailUrl: s => `${PROXY_BASE}https://www.phimchill.app/api/movie/${s}`,
    parser: d => d?.movies || d?.data || [],
    searchParser: d => d?.movie ? [d.movie] : d?.movies || [],
    getCdn: () => 'https://image.tmdb.org/t/p/w500/' // Dùng TMDB CDN cho poster đẹp
  },
  KKPHIM: { // NGUỒN DỰ PHÒNG - API DEV CHUYÊN DỤNG (từ kkphim.vip)
    defaultUrl: p => `${PROXY_BASE}https://api.kkphim.vip/v1/movies?page=${p}&limit=20`,
    genreUrl: (s,p) => `${PROXY_BASE}https://api.kkphim.vip/v1/movies?genre=${s}&page=${p}&limit=20`,
    countryUrl: (s,p) => `${PROXY_BASE}https://api.kkphim.vip/v1/movies?country=${s}&page=${p}&limit=20`,
    yearUrl: (y,p) => `${PROXY_BASE}https://api.kkphim.vip/v1/movies?year=${y}&page=${p}&limit=20`,
    searchUrl: kw => `${PROXY_BASE}https://api.kkphim.vip/v1/search?q=${encodeURIComponent(kw)}&limit=50`,
    detailUrl: s => `${PROXY_BASE}https://api.kkphim.vip/v1/movie/${s}`,
    parser: d => d?.data?.items || d?.movies || [],
    searchParser: d => d?.data?.movie ? [d.data.movie] : d?.movies || [],
    getCdn: () => 'https://img.kkphim.vip/poster/' // CDN riêng của KKPHIM
  }
};

let currentPage = 1, currentMode = 'default', currentFilter = '', currentSource = 'Phimchill', isLoading = false, hasMore = true;
const movieGrid = document.getElementById('movieGrid');
const loading = document.getElementById('loading');
const btnLoadMore = document.getElementById('btnLoadMore');
const modal = document.getElementById('movieModal');
const closeModal = document.querySelector('.close');

// Init filters (giữ nguyên)
function initFilters() {
  const g = document.getElementById('genreFilter'), c = document.getElementById('countryFilter'), y = document.getElementById('yearFilter');
  // Thêm genres/countries từ map cũ, hoặc dùng default từ API
  g.innerHTML = '<option value="">Thể Loại</option><option value="hanh-dong">Hành Động</option><option value="hai">Hài</option><option value="kinh-di">Kinh Dị</option><option value="lang-man">Lãng Mạn</option>'; // Thêm nhiều hơn nếu cần
  c.innerHTML = '<option value="">Quốc Gia</option><option value="au-my">Âu Mỹ</option><option value="han-quoc">Hàn Quốc</option><option value="trung-quoc">Trung Quốc</option>'; // Thêm nhiều hơn nếu cần
  for(let i=new Date().getFullYear(); i>=1990; i--) y.innerHTML += `<option value="${i}">${i}</option>`;
}

function getApiUrl(src, page) {
  const s = API_SOURCES[src];
  if(currentMode==='genre') return s.genreUrl?.(currentFilter,page) || s.defaultUrl(page);
  if(currentMode==='country') return s.countryUrl?.(currentFilter,page) || s.defaultUrl(page);
  if(currentMode==='year') return s.yearUrl?.(currentFilter,page) || s.defaultUrl(page);
  return s.defaultUrl(page);
}

async function fetchMovies(page=1) {
  if(isLoading) return [];
  isLoading = true; loading.style.display='block'; btnLoadMore.disabled=true;
  let items = [];
  for(const src of ['Phimchill','KKPHIM']) {
    try {
      const res = await fetch(getApiUrl(src,page));
      if(!res.ok) continue;
      const data = await res.json();
      items = API_SOURCES[src].parser(data);
      if(items.length>0) { currentSource=src; break; }
    } catch(e) { console.log(src+' lỗi, thử nguồn khác...'); }
  }
  isLoading = false; loading.style.display='none'; btnLoadMore.disabled=false;
  if(items.length===0) hasMore=false;
  return items;
}

function renderMovie(m) {
  const name = (m.title || m.name || m.vi_title || "Không tên").trim();
  const year = m.year || m.release_date?.substring(0,4) || "";
  const slug = m.slug || m.id || m.imdb_id;
  let thumb = m.poster_path || m.backdrop_path || m.image;
  if(thumb && !thumb.startsWith('http')) thumb = API_SOURCES[currentSource].getCdn() + thumb;
  return `<div class="movie-card" data-slug="${slug}" data-source="${currentSource}">
    <img src="${thumb || 'https://via.placeholder.com/300x450/222/fff?text=No+Image'}" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/222/fff?text=No+Image'">
    <div class="movie-info"><h3 title="${name}">${name}</h3><p class="year">${year}</p></div>
  </div>`;
}

async function loadMovies(reload=false) {
  if(reload){ currentPage=1; movieGrid.innerHTML=''; hasMore=true; btnLoadMore.style.display='block'; }
  if(!hasMore || isLoading) return;
  const movies = await fetchMovies(currentPage++);
  if(movies.length < 20) { hasMore=false; btnLoadMore.style.display='none'; }
  movies.forEach(m=>movieGrid.innerHTML+=renderMovie(m));
}

// Search
document.getElementById('searchBtn').onclick = ()=>search();
document.getElementById('searchInput').onkeypress=e=>e.key==='Enter'&&search();
async function search(){
  const kw = document.getElementById('searchInput').value.trim();
  if(!kw) return loadMovies(true);
  movieGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:50px;color:#aaa">Đang tìm...</p>'; btnLoadMore.style.display='none';
  let results = [];
  for(const src of ['Phimchill','KKPHIM']){
    try{
      const url = API_SOURCES[src].searchUrl(kw);
      const res = await fetch(url);
      if(!res.ok) continue;
      const data = await res.json();
      results = API_SOURCES[src].searchParser(data);
      if(results.length>0){ currentSource=src; break; }
    }catch(e){}
  }
  movieGrid.innerHTML='';
  if(results.length===0) movieGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:50px;color:#aaa;font-size:18px;">Không tìm thấy phim nào!</p>';
  else results.forEach(m=>movieGrid.innerHTML+=renderMovie(m));
}

// Detail phim
movieGrid.onclick = async e=>{
  const card = e.target.closest('.movie-card');
  if(!card) return;
  modal.style.display='block'; document.body.style.overflow='hidden';
  const slug = card.dataset.slug;
  let movie=null;
  for(const src of ['Phimchill','KKPHIM']){
    try{
      const url = API_SOURCES[src].detailUrl(slug);
      const res = await fetch(url);
      if(!res.ok) continue;
      const data = await res.json();
      movie = API_SOURCES[src].searchParser(data)[0] || data;
      if(movie){ currentSource=src; break; }
    }catch(e){}
  }
  if(!movie){ alert('Không tải được thông tin phim!'); modal.style.display='none'; return; }
  const poster = (movie.poster_path || movie.image || "").startsWith('http') ? movie.poster_path||movie.image : API_SOURCES[currentSource].getCdn() + (movie.poster_path||movie.image||"").replace(/^\//,'');
  document.getElementById('modalThumb').src = poster || 'https://via.placeholder.com/300x450/222/fff?text=No+Image';
  document.getElementById('modalTitle').textContent = movie.title || movie.name || 'Không tên';
  document.getElementById('modalYear').textContent = movie.year || movie.release_date?.substring(0,4) || 'N/A';
  document.getElementById('modalCountry').textContent = (movie.countries || movie.country || ['N/A']).map(c=>typeof c==='object'?c.name:c).join(', ');
  document.getElementById('modalGenre').textContent = (movie.genres || movie.genre || ['N/A']).map(g=>typeof g==='object'?g.name:g).join(', ');
  document.getElementById('modalStatus').textContent = movie.status || 'Đã phát hành';
  document.getElementById('modalDesc').innerHTML = (movie.overview || movie.description || movie.content || 'Không có mô tả.').replace(/\n/g,'<br>');
  document.getElementById('watchLink').href = currentSource==='Phimchill' ? `https://www.phimchill.app/movie/${slug}` : `https://kkphim.vip/phim/${slug}`;
};

// Menu & Filters
document.querySelectorAll('.menu li').forEach(el=>el.onclick=()=>{ document.querySelectorAll('.menu li').forEach(i=>i.classList.remove('active')); el.classList.add('active'); currentMode=el.dataset.mode||'default'; currentFilter=el.dataset.filter||''; loadMovies(true); });
document.getElementById('genreFilter').onchange=e=>{ currentMode=e.target.value?'genre':'default'; currentFilter=e.target.value; loadMovies(true); };
document.getElementById('countryFilter').onchange=e=>{ currentMode=e.target.value?'country':'default'; currentFilter=e.target.value; loadMovies(true); };
document.getElementById('yearFilter').onchange=e=>{ currentMode=e.target.value?'year':'default'; currentFilter=e.target.value; loadMovies(true); };

// Modal & Load more
closeModal.onclick = ()=>{ modal.style.display='none'; document.body.style.overflow=''; };
window.onclick = e=>{ if(e.target===modal) modal.style.display='none'; };
btnLoadMore.onclick = ()=>loadMovies();
window.onscroll = ()=>{ if(window.innerHeight + window.scrollY >= document.body.offsetHeight-1000 && hasMore && !isLoading) loadMovies(); };

// Khởi động
initFilters();
loadMovies(true);
