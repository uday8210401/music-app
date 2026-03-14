const API_KEY = "AIzaSyBMnCmuH_jGzdSlzDihXxMJOHeDgEv7uxc";

async function searchSongs(){
  let query = document.getElementById("searchInput").value;
  let results = document.getElementById("results");
  
  // Show a loading message while waiting for the API
  results.innerHTML = "<p>Searching...</p>";

  // OPTIMIZATION: Added &videoEmbeddable=true so we only fetch playable videos
  let searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+song&type=video&maxResults=10&videoEmbeddable=true&key=${API_KEY}`;

  try {
    let res = await fetch(searchURL);
    let data = await res.json();

    results.innerHTML = ""; // Clear loading message

    if (data.items && data.items.length > 0) {
      for(let video of data.items){
        let videoId = video.id.videoId;
        let div = document.createElement("div");
        div.className = "song";

        div.innerHTML = `
          <img src="${video.snippet.thumbnails.medium.url}" alt="Thumbnail">
          <span>${video.snippet.title}</span>
          <button onclick="playSong('${videoId}')">Play</button>
        `;

        results.appendChild(div);
      }
    } else {
      results.innerHTML = "<p>No results found. (Or check your API key/quota)</p>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    results.innerHTML = "<p>An error occurred while searching.</p>";
  }
}

function playSong(id){
  // Get the current origin (e.g., http://127.0.0.1:5500)
  let currentOrigin = window.location.origin; 
  
  // Fallback if running directly from file:// protocol
  if (!currentOrigin || currentOrigin === "null") {
      currentOrigin = "http://localhost"; 
  }

  // Pass the origin to the YouTube iframe to bypass some playback restrictions
  document.getElementById("player").src = `https://www.youtube.com/embed/${id}?autoplay=1&origin=${currentOrigin}`;
}