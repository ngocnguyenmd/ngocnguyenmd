// script.js - CHẠY 100% TRÊN GITHUB + NETLIFY
const PROXY_BASE = "/.netlify/functions/proxy?url=";

const GENRE_SLUG_MAP = {'Hành Động':'hanh-dong','Phiêu Lưu':'phieu-luu','Hoạt Hình':'hoat-hinh','Hài':'hai','Hài Hước':'hai-huoc','Hình Sự':'hinh-su','Tài Liệu':'tai-lieu','Chính Kịch':'chinh-kich','Gia Đình':'gia-dinh','Giả Tưởng':'gia-tuong','Lịch Sử':'lich-su','Kinh Dị':'kinh-di','Nhạc':'nhac','Âm Nhạc':'am-nhac','Bí Ẩn':'bi-an','Lãng Mạn':'lang-man','Tình Cảm':'tinh-cam','Khoa Học Viễn Tưởng':'khoa-hoc-vien-tuong','Gây Cấn':'gay-can','Chiến Tranh':'chien-tranh','Tâm Lý':'tam-ly','Cổ Trang':'co-trang','Miền Tây':'mien-tay','Phim 18+':'phim-18','Thể Thao':'the-thao','Võ Thuật':'vo-thuat','Viễn Tưởng':'vien-tuong','Khoa Học':'khoa-hoc','Thần Thoại':'than-thoai','Học Đường':'hoc-duong','Kinh Điển':'kinh-dien'};

const COUNTRY_SLUG_MAP = {'Âu Mỹ':'au-my','Hàn Quốc':'han-quoc','Trung Quốc':'trung-quoc','Nhật Bản':'nhat-ban','Thái Lan':'thai-lan','Hồng Kông':'hong-kong','Ấn Độ':'an-do','Anh':'anh','Pháp':'phap','Canada':'canada','Đức':'duc','Tây Ban Nha':'tay-ban-nha','Úc':'uc','Ý':'y','Hà Lan':'ha-lan','Indonesia':'indonesia','Nga':'nga','Mexico':'mexico','Ba Lan':'ba-lan','Malaysia':'malaysia','Bồ Đào Nha':'bo-dao-nha','Thụy Điển':'thuy-dien','Philippines':'philippines','Đan Mạch':'dan-mach','Thụy Sĩ':'thuy-si','Ukraina':'ukraina','UAE':'uae','Ả Rập Xê Út':'a-rap-xe-ut','Thổ Nhĩ Kỳ':'tho-nhi-ky','Brazil':'brazil','Na Uy':'na-uy','Nam Phi':'nam-phi','Việt Nam':'viet-nam','Đài Loan':'dai-loan','Châu Phi':'chau-phi','Bỉ':'bi','Ireland':'ireland','Colombia':'colombia','Phần Lan':'phan-lan','Chile':'chile','Hy Lạp':'hy-lap','Nigeria':'nigeria','Argentina':'argentina','Singapore':'singapore','Quốc Gia Khác':'quoc-gia-khac'};

const API_SOURCES = {
  Phimapi: {
    defaultUrl: p => `${PROXY_BASE}https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s,p) => `${PROXY_BASE}https://phimapi.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s,p) => `${PROXY_BASE}https://phimapi.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y,p) => `${PROXY_BASE}https://phimapi.com/v1/api/nam/${y}?page=${p}`,
    typeUrl: (t,p) => `${PROXY_BASE}https://phimapi.com/v1/api/danh-sach/${t}?page=${p}`,
    searchUrl: s => `${PROXY_BASE}https://phimapi.com/phim/${s}`,
    parser: d => d?.data?.items || [],
    searchParser: d => d?.movie ? [d.movie] : [],
    getCdn: () => 'https://phimimg.com/'
  },
  Ophim: {
    defaultUrl: p => `${PROXY_BASE}https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${p}`,
    genreUrl: (s,p) => `${PROXY_BASE}https://ophim1.com/v1/api/the-loai/${s}?page=${p}`,
    countryUrl: (s,p) => `${PROXY_BASE}https://ophim1.com/v1/api/quoc-gia/${s}?page=${p}`,
    yearUrl: (y,p) => `${PROXY_BASE}https://ophim1.com/v1/api/nam-phat-hanh/${y}?page=${p}`,
    searchUrl: s => `${PROXY_BASE}https://ophim1.com/v1/api/phim/${s}`,
    parser: d => d?.data?.items || [],
    searchParser: d => d?.data?.item ? [d.data.item] : [],
    getCdn: () => 'https://img.ophim.live/uploads/movies/'
  }
};

let currentPage = 1, currentMode = 'default', currentFilter = '', currentSource = 'Phimapi', isLoading = false, hasMore = true;
const movieGrid = document.getElementById('movieGrid');
const loading = document.getElementById('loading');
const btnLoadMore = document.getElementById('btnLoadMore');
const modal = document.getElementById('movieModal');
const closeModal = document.querySelector('.close');

function initFilters() {
  const g = document.getElementById('genreFilter'), c = document.getElementById('countryFilter'), y = document.getElementById('yearFilter');
  Object.keys(GENRE_SLUG_MAP).sort().forEach(k => g.innerHTML += `<option value="${GENRE_SLUG_MAP[k]}">${k}</option>`);
  Object.keys(COUNTRY_SLUG_MAP).sort().forEach(k => c.innerHTML += `<option value="${COUNTRY_SLUG_MAP[k]}">${k}</option>`);
  for(let i=new Date().getFullYear(); i>=1990; i--) y.innerHTML += `<option value="${i}">${i}</option>`;
}

function getApiUrl(src, page) {
  const s = API_SOURCES[src];
  if(currentMode==='genre') return s.genreUrl(currentFilter,page);
  if(currentMode==='country') return s.countryUrl(currentFilter,page);
  if(currentMode==='year') return s.yearUrl(currentFilter,page);
  return s.defaultUrl(page);
}

async function fetchMovies(page=1) {
  if(isLoading) return [];
  isLoading = true; loading.style.display='block'; btnLoadMore.disabled=true;
  let items = [];
  for(const src of ['Phimapi','Ophim']) {
    try {
      const res = await fetch(getApiUrl(src,page));
      if(!res.ok) continue;
      const data = await res.json();
      items = API_SOURCES[src].parser(data);
      if(items.length>0) { currentSource=src; break; }
    } catch(e) {}
  }
  isLoading = false; loading.style.display='none'; btnLoadMore.disabled=false;
  if(items.length===0) hasMore=false;
  return items;
}

function renderMovie(m) {
  const name = (m.name||m.title||"").trim();
  const thumb = (m.thumb_url||m.poster_url||"").startsWith('http') ? m.thumb_url||m.poster_url : API_SOURCES[currentSource].getCdn()+ (m.thumb_url||m.poster_url||"").replace(/^\//,'');
  return `<div class="movie-card" data-slug="${m.slug}">
    <img src="${thumb}" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/222/fff?text=No+Image'">
    <div class="movie-info"><h3>${name}</h3><p class="year">${m.year||""}</p></div>
  </div>`;
}

async function loadMovies(reload=false) {
  if(reload){ currentPage=1; movieGrid.innerHTML=''; hasMore=true; btnLoadMore.style.display='block'; }
  if(!hasMore || isLoading) return;
  const movies = await fetchMovies(currentPage++);
  movies.forEach(m=>movieGrid.innerHTML+=renderMovie(m));
  if(movies.length<20) { hasMore=false; btnLoadMore.style.display='none'; }
}

// Events
document.querySelectorAll('.menu li').forEach(el=>el.onclick=()=>{ document.querySelector('.menu .active')?.classList.remove('active'); el.classList.add('active'); currentMode=el.dataset.mode||'default'; currentFilter=el.dataset.filter||''; loadMovies(true); });
document.getElementById('genreFilter').onchange=e=>{ currentMode=e.target.value?'genre':'default'; currentFilter=e.target.value; loadMovies(true); };
document.getElementById('countryFilter').onchange=e=>{ currentMode=e.target.value?'country':'default'; currentFilter=e.target.value; loadMovies(true); };
document.getElementById('yearFilter').onchange=e=>{ currentMode=e.target.value?'year':'default'; currentFilter=e.target.value; loadMovies(true); };

document.getElementById('searchBtn').onclick = ()=>search();
document.getElementById('searchInput').onkeypress=e=>e.key==='Enter'&&search();
async function search(){
  const kw = document.getElementById('searchInput').value.trim();
  if(!kw) return loadMovies(true);
  movieGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:50px;color:#aaa">Đang tìm...</p>';
  const res = await fetch(`${PROXY_BASE}https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(kw)}&limit=50`);
  const data = res.ok ? await res.json() : {};
  const results = data?.data?.items || [];
  movieGrid.innerHTML=''; currentSource='Phimapi';
  if(results.length===0) movieGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:50px;color:#aaa">Không tìm thấy phim nào!</p>';
  else results.forEach(m=>movieGrid.innerHTML+=renderMovie(m));
}

movieGrid.onclick = async e=>{
  const card = e.target.closest('.movie-card');
  if(!card) return;
  modal.style.display='block'; document.body.style.overflow='hidden';
  const slug = card.dataset.slug;
  let movie=null;
  for(const src of ['Phimapi','Ophim']){
    try{
      const res = await fetch(API_SOURCES[src].searchUrl(slug));
      if(!res.ok) continue;
      const data = await res.json();
      movie = API_SOURCES[src].searchParser(data)[0];
      if(movie){ currentSource=src; break; }
    }catch(e){}
  }
  if(!movie){ alert('Không tải được thông tin!'); modal.style.display='none'; return; }
  const poster = (movie.poster_url||movie.thumb_url||"").startsWith('http') ? movie.poster_url||movie.thumb_url : API_SOURCES[currentSource].getCdn()+(movie.poster_url||movie.thumb_url||"").replace(/^\//,'');
  document.getElementById('modalThumb').src = poster;
  document.getElementById('modalTitle').textContent = movie.name||movie.title;
  document.getElementById('modalYear').textContent = movie.year||'N/A';
  document.getElementById('modalCountry').textContent = (movie.country||[]).map(c=>c.name).join(', ')||'N/A';
  document.getElementById('modalGenre').textContent = (movie.category||[]).map(c=>c.name).join(', ')||'N/A';
  document.getElementById('modalStatus').textContent = movie.status||movie.episode_current||'N/A';
  document.getElementById('modalDesc').innerHTML = (movie.content||movie.description||'Không có mô tả').replace(/\n/g,'<br>');
  document.getElementById('watchLink').href = `https://phimapi.com/phim/${slug}`;
};

closeModal.onclick = ()=>{ modal.style.display='none'; document.body.style.overflow=''; };
window.onclick = e=>{ if(e.target===modal) modal.style.display='none'; };
btnLoadMore.onclick = ()=>loadMovies();
window.onscroll = ()=>{ if(window.innerHeight + window.scrollY >= document.body.offsetHeight-1000 && hasMore && !isLoading) loadMovies(); };

initFilters();
loadMovies(true);