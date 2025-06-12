from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app, origins=["*"]) #on production to put a real source.

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
CACHE_FILE = "youtube_cache.json"

# load cache or create new one
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r") as f:
        cache = json.load(f)
else:
    cache = {}

@app.route("/api/youtube-link")
def get_youtube_link():
    track = request.args.get("track")
    artist = request.args.get("artist")
    if not track or not artist:
        return jsonify({"error": "Missing track or artist"}), 400

    key = f"{track.strip()}__{artist.strip()}"
    if key in cache:
        return jsonify(cache[key])

    query = f"{track} {artist}"
    url = (
        "https://www.googleapis.com/youtube/v3/search"
        "?part=snippet&type=video&maxResults=1"
        f"&q={requests.utils.quote(query)}"
        f"&key={YOUTUBE_API_KEY}"
    )

    try:
        response = requests.get(url)
        data = response.json()

        if "error" in data:
            return jsonify({"error": data["error"]["message"]}), 500

        item = data.get("items", [None])[0]
        if not item:
            return jsonify({"url": None, "thumbnail": None})

        video_id = item["id"]["videoId"]
        thumbnail = item["snippet"]["thumbnails"]["default"]["url"]

        result = {
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": thumbnail
        }

        cache[key] = result
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#run on production
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)