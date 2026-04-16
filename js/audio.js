// audio.js — Playlist logic

var playlists =
{
    DollHouse: ["assets/audio/doll-house/1-requiem-lacrimosa-mozart.mp3", "assets/audio/doll-house/2-lullaby-brahms.mp3", "assets/audio/doll-house/3-badinerie-bach.mp3", "assets/audio/doll-house/4-beethoven-for-elise.mp3"],
    Garden: ["assets/audio/garden/1-nocturne-chopin.mp3", "assets/audio/garden/2-clair-de-lune.mp3", "assets/audio/garden/3-moonlight-sonata.mp3", "assets/audio/garden/4-gymnopedie-erik_satie.mp3"],
    Ballroom: ["assets/audio/ballroom/1-gnossienne.mp3", "assets/audio/ballroom/2-toccata-and-fugue.mp3", "assets/audio/ballroom/3-297-winter.mp3", "assets/audio/ballroom/4-cello-suite-1-bach.mp3", "assets/audio/ballroom/5-moonlight-sonata.mp3"]
};

var names =
{
    DollHouse: ["Mozart – Requiem in D minor: Lacrimosa, K. 626", "Brahms – Lullaby / Wiegenlied, Op. 49, No. 4", "Bach – Badinerie, Suite No. 2 in B minor, BWV 1067", "Beethoven – Für Elise, WoO 59"],
    Garden: ["Chopin – Nocturne in E-flat major, Op. 9, No. 2", "Debussy – Clair de Lune, Suite bergamasque, L. 75", "Beethoven – Piano Sonata No. 14 \"Moonlight\", Op. 27, No. 2", "Satie – Gymnopédie No. 1, from Trois Gymnopédies"],
    Ballroom: ["Satie – Gymnopédie No. 1", "Bach – Toccata and Fugue in D minor, BWV 565", "Vivaldi – The Four Seasons: Winter, RV 297", "Bach – Cello Suite No. 1 in G major, BWV 1007", "Beethoven – Piano Sonata No. 14 \"Moonlight\", Op. 27, No. 2"]
};

var currentPlaylist = "DollHouse";
var currentSong = 0;
var music = new Audio(playlists[currentPlaylist][currentSong]);
var ambient = new Audio(""); // need ambient audio
ambient.loop = true;
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

displaySong();