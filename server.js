import express from "express";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ★ 音声＋動画統合済みMP4を返すエンドポイント ★
app.get("/video", async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).json({ error: "video id required" });

  try {
    const url = execSync(
      `yt-dlp -f best[ext=mp4] --cookies youtube-cookies.txt --get-url https://youtu.be/${videoId}`
    )
      .toString()
      .trim()
      .split("\n")[0];

    res.json({ url, source: "yt-dlp-with-cookies" });

  } catch (e) {
    console.error("yt-dlp error:", e);
    res.status(500).json({
      error: "failed_to_fetch_video",
      message: e.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
