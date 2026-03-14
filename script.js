const API_KEY = "AIzaSyBMnCmuH_jGzdSlzDihXxMJOHeDgEv7uxc";

let songQueue = []; 
let currentIndex = 0; 
let ytPlayer;

// --- 1. LOAD THE YOUTUBE IFRAME API ---
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// --- 2. INITIALIZE THE PLAYER ---
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    height: '280',
    width: '500',
    videoId: '', // Starts empty
    playerVars: {
      'autoplay': 1,
      'controls': 1,
      'origin': window.location.origin
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// --- 3. AUTOPLAY NEXT SONG WHEN FINISHED ---
function onPlayerStateChange(event) {
  // YT.PlayerState.ENDED means the video finished playing
  if (event.data === YT.PlayerState.ENDED) {
    playNext(); 
  }
}

// --- 4. SEARCH AND BUILD THE QUEUE ---
async function searchSongs(){
  let query = document.getElementById("searchInput").value;
  let results = document.getElementById("results");
  results.innerHTML = "<p>Searching...</p>";

  // Fetch only embeddable videos to save quota
  let searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+song&type=video&maxResults=10&videoEmbeddable=true&key=${API_KEY}`;

  try {
    let res = await fetch(searchURL);
    let data = await res.json();
    results.innerHTML = ""; 

    if (data.items && data.items.length > 0) {
      songQueue = data.items; // Save to queue
      
      songQueue.forEach((video, index) => {
        let div = document.createElement("div");
        div.className = "song";

        div.innerHTML = `
          <img src="${video.snippet.thumbnails.medium.url}" alt="Thumbnail">
          <span>${video.snippet.title}</span>
          <button onclick="playSong(${index})">Play</button> 
        `;
        results.appendChild(div);
      });
    } else {
      results.innerHTML = "<p>No results found.</p>";
    }
  } catch (error) {
    console.error("API Error:", error);
    results.innerHTML = "<p>An error occurred. Check console.</p>";
  }
}

// --- 5. PLAYER CONTROLS & MEDIA SESSION (LOCK SCREEN) ---
function playSong(index){
  // Prevent out of bounds errors
  if (index < 0 || index >= songQueue.length) return; 
  
  currentIndex = index; 
  let video = songQueue[currentIndex];
  let videoId = video.id.videoId;
  
  // Tell the YouTube API to play the specific video ID
  ytPlayer.loadVideoById(videoId);

  // Hook into the device's Lock Screen / Notification Center
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      artwork: [
        { src: video.snippet.thumbnails.medium.url, sizes: '320x180', type: 'image/jpeg' }
      ]
    });

    // Link physical hardware buttons to our JavaScript functions
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
  }
}

function playNext(){
  if(currentIndex < songQueue.length - 1){
    playSong(currentIndex + 1);
  }
}

function playPrevious(){
  if(currentIndex > 0){
    playSong(currentIndex - 1);
  }
}
