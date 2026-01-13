import express from 'express';
import ytdl from '@distube/ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules 対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// index.html 配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 動画ストリーム
app.get('/video', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    res.status(400).send('video id required');
    return;
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    res.setHeader('Content-Type', 'video/mp4');

    ytdl(url, {
      quality: 'highest',
      filter: 'audioandvideo',
      highWaterMark: 1 << 25
    }).pipe(res);

  } catch (e) {
    console.error(e);
    res.status(500).send('stream error');
  }
});

app.listen(PORT, () => {
  console.log('server started on port', PORT);
});
