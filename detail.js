// ================= URL PARAMS =================
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

const rawSource = (urlParams.get("source") || "ax").toLowerCase();

const sourceMap = { 
  ax: "Ophim", bx: "Phimapi", cx: "Nguonc", 
  ophim: "Ophim", phimapi: "Phimapi", nguonc: "Nguonc" 
};
let source = sourceMap[rawSource] || "Ophim";

const shortCode = Object.keys(sourceMap).slice(0, 3).find(k => sourceMap[k] === source) || "ax";

const apis = {
  Ophim: `https://ophim1.com/v1/api/phim/${slug}`,
  Phimapi: `https://phimapi.com/phim/${slug}`,
  Nguonc: `https://phim.nguonc.com/api/film/${slug}`,
};

// ================= POSTER =================
function getPoster(movie, cdn = "") {
  let url = "";
  if (source === "Phimapi") {
    url = movie.poster_url || movie.thumb_url;
    if (url && !url.startsWith("http") && cdn) {
      url = cdn + "/" + url.replace(/^\//, "");
    }
  } else if (source === "Ophim") {
    url = movie.poster_url || movie.thumb_url;
    if (url && !url.startsWith("http")) {
      const baseCdn = cdn || "https://img.ophim.live";
      if (!url.includes("/uploads/movies/")) {
        const name = url.split("/").pop().replace(/-(poster|thumb)\.jpg/, "");
        url = `${baseCdn}/uploads/movies/${name}-thumb.jpg`;
      } else {
        url = `${baseCdn}/${url.replace(/^\//, "")}`;
      }
    }
  } else if (source === "Nguonc") {
    url = movie.thumb_url || movie.poster_url;
    if (url && !url.startsWith("http") && cdn) {
      url = cdn + "/" + url.replace(/^\//, "");
    }
  }
  
  return url || "https://via.placeholder.com/220x330/111/fff?text=No+Image";
}

// ================= LOAD DETAIL =================
async function loadDetail() {
  const skeleton = document.getElementById("skeleton");
  const content = document.getElementById("detail-content");

  if (!slug) {
    content.innerHTML = `<p style="color:#f66;text-align:center;">Không có phim!</p>`;
    if(skeleton) skeleton.style.display = "none";
    content.style.display = "block";
    return;
  }

  try {
    const res = await fetch(apis[source]);
    if (!res.ok) throw new Error("Không tải được phim");
    const data = await res.json();

    let movie = {}, cdn = "";
    if (source === "Nguonc" || source === "Phimapi") {
      movie = data.movie;
      if (source === "Phimapi") cdn = (data.data?.APP_DOMAIN_CDN_IMAGE || "https://phimimg.com").replace(/\/+$/, "");
    } else {
      movie = data.data.item;
      cdn = data.data.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live";
    }

    const poster = getPoster(movie, cdn);

    // ===== SET DATA =====
    const posterImg = document.getElementById("poster");
    if (posterImg) posterImg.src = poster;

    document.getElementById("title").textContent = movie.name || "Không rõ";
    document.getElementById("original-title").textContent = movie.origin_name || "";

    const descEl = document.getElementById("desc");
    const toggleBtn = document.getElementById("toggle-desc");

    const fullDesc = (movie.content || movie.description || "Không có mô tả")
      .replace(/<[^>]+>/g, "")
      .trim();

    descEl.textContent = fullDesc;

    if (fullDesc.length > 200) {
      toggleBtn.style.display = "inline-block";
      toggleBtn.onclick = () => {
        descEl.classList.toggle("expanded");
        toggleBtn.textContent = descEl.classList.contains("expanded") ? "Thu gọn" : "Xem thêm";
      };
    } else toggleBtn.style.display = "none";

    // ===== WATCH BUTTON =====
    const watchBtn = document.getElementById("watch-btn");
    if (watchBtn) watchBtn.href = `watch.html?slug=${slug}&source=${shortCode}&e=1`;

    // ===== SEO =====
    document.title = `${movie.name} - Xem Phim Vui Vẻ`;
    document.getElementById("og-title").content = movie.name;
    document.getElementById("og-desc").content = fullDesc.substring(0, 160) + "...";
    document.getElementById("og-image").content = poster;
    document.getElementById("og-url").content = location.href;

    if(skeleton) skeleton.style.display = "none";
    content.style.display = "block";
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p style="color:#f66;text-align:center;">Lỗi: ${err.message}</p>`;
    if(skeleton) skeleton.style.display = "none";
    content.style.display = "block";
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadDetail);