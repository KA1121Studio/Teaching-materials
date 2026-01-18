#!/usr/bin/env bash
set -e

echo "==== Installing yt-dlp ===="
pip install yt-dlp

echo "==== Running npm install ===="
npm install
