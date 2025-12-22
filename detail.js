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

  return url || "https://via.placeholder.com/220x330/111/fff?text=No+Image";
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
    document.getElementById("poster").src = poster;
    bg.style.backgroundImage = `url(${poster})`;

    document.getElementById("title").textContent = movie.name || "Không rõ";
    document.getElementById("original-title").textContent =
      movie.origin_name || "";

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
        toggleBtn.textContent = descEl.classList.contains("expanded")
          ? "Thu gọn"
          : "Xem thêm";
      };
    } else toggleBtn.style.display = "none";

    // ===== WATCH BUTTON =====
    const encodedSource = Object.keys(sourceMap).find(
      (k) => sourceMap[k] === source
    );
    document.getElementById(
      "watch-btn"
    ).href = `watch.html?slug=${slug}&source=${encodedSource}&e=1`;

    // ===== SEO =====
    document.title = `${movie.name} - Phim Nhà Bánh Mì`;
    document.getElementById("og-title").content = movie.name;
    document.getElementById("og-desc").content =
      fullDesc.substring(0, 160) + "...";
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

// ================= LIGHT HOVER (KHÔNG NẶNG) =================
const tiltCard = document.getElementById("tiltCard");
if (tiltCard && !("ontouchstart" in window)) {
  tiltCard.addEventListener("mouseenter", () => {
    tiltCard.style.transform = "scale(1.03)";
  });
  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "scale(1)";
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadDetail);
