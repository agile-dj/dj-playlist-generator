const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000/api/spotify/callback";
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
].join(" ");

const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

window.location.href = spotifyAuthUrl;
