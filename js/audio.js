// audio.js — Playlist logic

var playlists =
{
    DollHouse: ["assets/audio/doll-house/1-requiem-lacrimosa-mozart.mp3", "assets/audio/doll-house/2-lullaby-brahms.mp3", "assets/audio/doll-house/3-badinerie-bach.mp3", "assets/audio/doll-house/4-beethoven-for-elise.mp3"],
    Garden: [],
    Ballroom: []
}; // need more songs

var names =
{
    DollHouse: ["ph1", "ph2", "ph3", "ph4"],
    Garden: [],
    Ballroom: []
};

var currentPlaylist = "DollHouse";
var currentSong = 0;
var music = new Audio(playlists[currentPlaylist][currentSong]);
var ambient = new Audio("") // need ambient audio
ambient.loop = true
var isPlaying = false;

function displaySong()
{
    document.getElementsByClassName("track-title")[0].textContent = names[currentPlaylist][currentSong];
}

function togglePlay()
{
    var icon = document.getElementById("toggle-play-icon");
    if(isPlaying == false)
    {
        music.play();
        isPlaying = true
        icon.innerHTML = `pause`; //insert pause svg
    }

    else
    {
        music.pause();
        isPlaying = false
        icon.innerHTML =
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="6 3 20 12 6 21"/>
        </svg>`;
    }

    displaySong();
}

function nextSong()
{
    music.pause();

    currentSong = currentSong + 1;

    if (currentSong >= playlists[currentPlaylist].length)
    {
        currentSong = 0;
    }

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.volume = document.getElementById("volume").value / 100;
    music.play();
    isPlaying = true;

    document.getElementById("toggle-play-icon").innerHTML = `pause`; // insert svg
    displaySong();
}

function prevSong()
{
    music.pause();

    currentSong = currentSong - 1;

    if (currentSong < 0)
    {
        currentSong = playlists[currentPlaylist].length - 1;
    }

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.volume = document.getElementById("volume").value / 100;
    music.play();
    isPlaying = true;

    document.getElementById("toggle-play-icon").innerHTML = `pause`; // insert svg
    displaySong();
}

function changePlaylist(chosenPlaylist)
{
    music.pause();

    currentPlaylist = chosenPlaylist;
    currentSong = 0;

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.volume = document.getElementById("volume").value / 100;

    isPlaying = false;

    document.getElementById("toggle-play-icon").innerHTML = 
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21"></polygon>
    </svg>`;

    displaySong();
}

function changeVolume()
{
    music.volume = document.getElementById("volume").value / 100;
}

displaySong();
// ── Ambient Sounds ──
// Each play button creates/reuses an Audio object, loops it, toggled on/off.
// Each slider controls that sound's individual volume.

var ambientSounds = {};  // key: file path, value: Audio object

document.querySelectorAll('.sfx-play-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var src = btn.dataset.ambient;
    if (!src) return;

    // Create audio if first time
    if (!ambientSounds[src]) {
      ambientSounds[src] = new Audio(src);
      ambientSounds[src].loop = true;
      // Read the slider value next to this button
      var slider = btn.parentElement.querySelector('.sfx-slider');
      if (slider) ambientSounds[src].volume = slider.value / 100;
    }

    var audio = ambientSounds[src];

    if (btn.classList.contains('playing')) {
      // Stop
      audio.pause();
      audio.currentTime = 0;
      btn.classList.remove('playing');
      btn.innerHTML = '&#9654;';  // play triangle
    } else {
      // Play
      audio.play();
      btn.classList.add('playing');
      btn.innerHTML = '&#10074;&#10074;';  // pause bars
    }
  });
});

// Wire individual volume sliders
document.querySelectorAll('.sfx-item').forEach(function (item) {
  var btn = item.querySelector('.sfx-play-btn');
  var slider = item.querySelector('.sfx-slider');
  if (!btn || !slider) return;

  slider.addEventListener('input', function () {
    var src = btn.dataset.ambient;
    if (src && ambientSounds[src]) {
      ambientSounds[src].volume = slider.value / 100;
    }
  });
});