import express from 'express';
import { Innertube } from 'youtubei.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Innertube 初期化
let youtube;
let youtubeReady = false;

(async () => {
  try {
    youtube = await Innertube.create({
      lang: 'ja',
      location: 'JP',
      retrieve_player: true,
    });
    youtubeReady = true;
    console.log("✅ Innertube initialized");
  } catch (err) {
    console.error("❌ Innertube initialization failed:", err.message);
  }
})();

// index.html 配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// stream URL 返すルート
app.get('/video', async (req, res) => {
  if (!youtubeReady) {
    return res.status(503).json({ error: "YouTube API 初期化中。少し待ってください" });
  }

  const videoId = req.query.id;
  if (!videoId) return res.status(400).json({ error: 'video id required' });

  try {
    const info = await youtube.videos.get(videoId);

    // mp4 + audio付きの最高画質を選ぶ
    const format = info.streamingData.formats.find(f =>
      f.mimeType.includes('video/mp4') && f.audioQuality
    );

    if (!format) {
      return res.status(500).json({ error: "No suitable format found" });
    }

    // JSONで URL を返すだけ
    res.json({ url: format.url });
  } catch (err) {
    console.error("Failed to get stream URL:", err.message);
    res.status(500).json({ error: "Failed to get stream URL" });
  }
});

// サーバ起動
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
