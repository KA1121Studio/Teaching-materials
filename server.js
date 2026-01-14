import express from 'express';
import { Innertube } from 'youtubei.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules 対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Innertube 初期化
let youtube;
(async () => {
  youtube = await Innertube.create({
    lang: 'ja',
    location: 'JP',
    retrieve_player: true,
  });
})();

// index.html 配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// stream URL 返すルート
app.get('/video', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    res.status(400).json({ error: 'video id required' });
    return;
  }

  try {
    const info = await youtube.videos.get(videoId);

    // mp4 + audio付きの最高画質を選ぶ
    const format = info.streamingData.formats.find(f =>
      f.mimeType.includes('video/mp4') && f.audioQuality
    );

    if (!format) {
      res.status(500).json({ error: 'No suitable format found' });
      return;
    }

    // JSON で URL を返す
    res.json({ url: format.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get stream URL' });
  }
});

// サーバ起動
app.listen(PORT, () => {
  console.log('server started on port', PORT);
});
