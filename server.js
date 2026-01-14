import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'youtubei.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules 対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// index.html 配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// YouTube 直接再生 URL を返す
app.get('/video', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).json({ error: 'video id required' });

  try {
    const youtube = new Client();
    const video = await youtube.getVideo(videoId);

    // MP4 形式で再生可能なストリームを選択
    const formats = video.streamingData.formats;
    // 720p以上、audio+videoあるやつを優先
    const stream = formats.find(f => f.hasVideo && f.hasAudio && f.qualityLabel?.includes('720'));

    if (!stream) {
      return res.status(500).json({ error: '再生可能なストリームが見つかりません' });
    }

    // JSONで返す
    res.json({
      id: video.id,
      title: video.title,
      streamUrl: stream.url,
      thumbnail: video.thumbnail?.url,
      views: video.views?.toLocaleString(),
      author: video.channel?.name
    });

  } catch (err) {
    console.error('YouTube fetch error:', err);
    res.status(500).json({ error: '動画取得に失敗しました' });
  }
});

// サーバ起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
