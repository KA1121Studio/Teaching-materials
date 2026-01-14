import express from 'express';
import fetch from 'node-fetch';
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

// 外部サーバ経由で動画 URL を返す
app.get('/video', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).json({ error: 'video id required' });

  const mainUrl = `https://siawaseok.duckdns.org/api/video2/${videoId}`;
  const fallbackUrl = `https://siatube.wjg.jp/api/video2/${videoId}`;

  try {
    let response = await fetch(mainUrl);
    if (!response.ok) throw new Error('main server error');
    let json = await response.json();
    return res.json(json);
  } catch (err) {
    console.error("video: main server failed, fallbackへ", err.message);
    try {
      let response = await fetch(fallbackUrl);
      if (!response.ok) throw new Error('fallback server error');
      let json = await response.json();
      return res.json(json);
    } catch (err2) {
      console.error("video: fallbackも失敗", err2.message);
      return res.status(500).json({ error: "video: 両方のサーバーで取得失敗" });
    }
  }
});

// サーバ起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
