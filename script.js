const fetch = require('node-fetch');
const fs = require('fs');

async function fetchSeriesData() {
    const response = await fetch('https://ophim1.com/phim/rang-buoc-toi-loi');
    const data = await response.json();

    if (!data.status || !data.movie) {
        console.error('API trả về lỗi hoặc không có dữ liệu');
        return;
    }

    const movie = data.movie;
    const title = movie.name;
    const poster = movie.poster_url;
    const episodes = movie.episodes;

    // Tạo nội dung cho series.txt
    let txtContent = `# ${title} (index.html)\n`;
    txtContent += `${title}||${poster}\n`;
    episodes.forEach(episode => {
        txtContent += `${title}|${episode.name}|${episode.link_m3u8}\n`;
    });

    // Ghi vào file series.txt
    fs.writeFileSync('series.txt', txtContent, 'utf8');
    console.log('Đã tạo series.txt thành công');
}

fetchSeriesData().catch(err => console.error('Lỗi:', err));