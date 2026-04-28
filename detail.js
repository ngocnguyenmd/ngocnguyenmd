// ================= URL PARAMS =================
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");
let source = urlParams.get("source") || "ax";

const sourceMap = { ax: "Ophim", bx: "Phimapi", cx: "Nguonc" };
source = sourceMap[source] || "Ophim";

const apis = {
  Ophim: `https://ophim1.com/v1/api/phim/${slug}`,
  Phimapi: `https://phimapi.com/phim/${slug}`,
  Nguonc: `https://phim.nguonc.com/api/film/${slug}`,
};

// ================= POSTER =================
function getPoster(movie, cdn = "") {
  let url = "";
  if (source === "Phimapi") url = movie.poster_url || movie.thumb_url;
  else if (source === "Ophim") {
    url = movie.poster_url || movie.thumb_url;
    if (url && !url.includes("/uploads/movies/")) {
      const name = url.split("/").pop().replace(/-(poster|thumb)\.jpg/, "");
      url = `${cdn || "https://img.ophim.live"}/uploads/movies/${name}-thumb.jpg`;
    }
  } else if (source === "Nguonc") url = movie.thumb_url;

  if (url && cdn && !url.startsWith("http"))
    url = cdn + "/" + url.replace(/^\//, "");

  // ✅ Bỏ placeholder.com (chậm/bị chặn) → dùng data URI inline
  return url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='330'%3E%3Crect fill='%23111'/%3E%3Ctext x='50%25' y='50%25' fill='%23555' font-size='14' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
}

// ================= LOAD DETAIL =================
async function loadDetail() {
  const skeleton = document.getElementById("skeleton");
  const content = document.getElementById("detail-content");
  const bg = document.getElementById("bg-poster");

  if (!slug) {
    content.innerHTML = `<p style="color:#f66;text-align:center;">Không có phim!</p>`;
    skeleton.style.display = "none";
    content.style.display = "block";
    return;
  }

  try {
    const res = await fetch(apis[source]);
    if (!res.ok) throw new Error("Không tải được phim");
    const data = await res.json();

    let movie = {}, cdn = "";
    if (source === "Nguonc") movie = data.movie;
    else if (source === "Phimapi") movie = data.movie;
    else {
      movie = data.data.item;
      cdn = data.data.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live";
    }

    const poster = getPoster(movie, cdn);

    // ===== SET DATA =====
    const posterEl = document.getElementById("poster");
    posterEl.loading = "lazy"; // ✅ lazy load ảnh
    posterEl.decoding = "async"; // ✅ không block render
    posterEl.src = poster;

    // ✅ Dùng CSS background thay vì JS style để tránh reflow
    bg.style.cssText += `background-image:url(${poster})`;

    document.getElementById("title").textContent = movie.name || "Không rõ";
    document.getElementById("original-title").textContent = movie.origin_name || "";

    // ✅ Bỏ hoàn toàn phần desc/toggle-desc

    // ===== WATCH BUTTON =====
    const encodedSource = Object.keys(sourceMap).find((k) => sourceMap[k] === source);
    document.getElementById("watch-btn").href =
      `watch.html?slug=${slug}&source=${encodedSource}&e=1`;

    // ===== SEO =====
    document.title = `${movie.name} - Phim Nhà Bánh Mì`;
    document.getElementById("og-title").content = movie.name;
    document.getElementById("og-desc").content = (movie.content || movie.description || "")
      .replace(/<[^>]+>/g, "").trim().substring(0, 160);
    document.getElementById("og-image").content = poster;
    document.getElementById("og-url").content = location.href;

    skeleton.style.display = "none";
    content.style.display = "block";
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p style="color:#f66;text-align:center;">Lỗi: ${err.message}</p>`;
    skeleton.style.display = "none";
    content.style.display = "block";
  }
}

// ✅ Bỏ hoàn toàn tiltCard mouseenter/mouseleave

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadDetail);
