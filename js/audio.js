// audio.js — Playlist logic

var playlists =
{
    DollHouse: ["assets/audio/doll-house/1-requiem-lacrimosa-mozart.mp3", "assets/audio/doll-house/2-lullaby-brahms.mp3", "assets/audio/doll-house/3-badinerie-bach.mp3", "assets/audio/doll-house/4-beethoven-for-elise.mp3"],
    Garden: ["assets/audio/garden/1-nocturne-chopin.mp3", "assets/audio/garden/2-clair-de-lune.mp3", "assets/audio/garden/3-moonlight-sonata.mp3", "assets/audio/garden/4-gymnopedie-erik_satie.mp3"],
    Ballroom: ["assets/audio/ballroom/1-gnossienne.mp3", "assets/audio/ballroom/2-toccata-and-fugue.mp3", "assets/audio/ballroom/3-297-winter.mp3", "assets/audio/ballroom/4-cello-suite-1-bach.mp3", "assets/audio/ballroom/5-moonlight-sonata.mp3"]
};

var songs =
{
    DollHouse: ["Requiem in D minor: Lacrimosa, K. 626", "Lullaby / Wiegenlied, Op. 49, No. 4", "Badinerie, Suite No. 2 in B minor, BWV 1067", "Für Elise, WoO 59"],
    Garden: ["Nocturne in E-flat major, Op. 9, No. 2", "Clair de Lune, Suite bergamasque, L. 75", "Piano Sonata No. 14 \"Moonlight\", Op. 27, No. 2", "Gymnopédie No. 1, from Trois Gymnopédies"],
    Ballroom: ["Gymnopédie No. 1", "Toccata and Fugue in D minor, BWV 565", "The Four Seasons: Winter, RV 297", "Cello Suite No. 1 in G major, BWV 1007", "Piano Sonata No. 14 \"Moonlight\", Op. 27, No. 2"]
};

var artists =
{
    DollHouse: ["Mozart", "Brahms", "Bach", "Beethoven"],
    Garden: ["Chopin", "Debussy", "Beethoven", "Satie"],
    Ballroom: ["Satie", "Bach", "Vivaldi", "Bach", "Beethoven"]
}

var playlistSubtitles =
{
    DollHouse: "Musicbox · haunted",
    Garden: "Whimsical · melancholy",
    Ballroom: "Waltz · enchanted"
};

var currentPlaylist = "DollHouse";
var currentSong = 0;
var music = new Audio(playlists[currentPlaylist][currentSong]);
music.onended = function() {
    if (isRepeat) { music.currentTime = 0; music.play(); }
    else { nextSong(); }
};
var ambient = new Audio(""); // need ambient audio
ambient.loop = true;
var isPlaying = false;
var isShuffle = false;
var isRepeat = false;

function displaySong()
{
    document.getElementsByClassName("track-title")[0].textContent = songs[currentPlaylist][currentSong];
    document.getElementsByClassName("track-artist")[0].textContent = artists[currentPlaylist][currentSong];
}

function togglePlay()
{
    var icon = document.getElementById("toggle-play-icon");
    if(isPlaying == false)
    {
        music.play();
        isPlaying = true
        document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    }

    else
    {
        music.pause();
        isPlaying = false
        document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21"></polygon></svg>';
    }

    displaySong();
    selectedSong();
}

function nextSong()
{
    music.pause();

    if(isShuffle == true)
    {
        var randomSong = currentSong;

        while (randomSong == currentSong && playlists[currentPlaylist].length > 1)
        {
            randomSong = Math.floor(Math.random() * playlists[currentPlaylist].length);
        }

        currentSong = randomSong;
    }

    else
    {
        currentSong = currentSong + 1;

        if (currentSong >= playlists[currentPlaylist].length)
        {
            currentSong = 0;
        }
    }

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.onended = function()
    {
        if(isRepeat == true)
        {
            music.currentTime = 0;
            music.play();
        }

        else
        {
            nextSong();
        }
    }
    music.volume = document.getElementById("volume").value / 100;
    music.play();
    isPlaying = true;

    document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    displaySong();
    selectedSong();

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
    music.onended = function()
    {
        if(isRepeat == true)
        {
            music.currentTime = 0;
            music.play();
        }
        else
        {
            nextSong();
        }
    }
    music.volume = document.getElementById("volume").value / 100;
    music.play();
    isPlaying = true;

    document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    displaySong();
    selectedSong();
}

function toggleShuffle()
{
    isShuffle = !isShuffle;
    document.getElementById('btn-shuffle').classList.toggle('ctrl-active', isShuffle);
}

function toggleRepeat()
{
    isRepeat = !isRepeat;
    document.getElementById('btn-repeat').classList.toggle('ctrl-active', isRepeat);
}

function changePlaylist(chosenPlaylist)
{
    var wasPlaying = isPlaying;
    music.pause();

    currentPlaylist = chosenPlaylist;
    currentSong = 0;

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.onended = function()
    {
        if(isRepeat == true)
        {
            music.currentTime = 0;
            music.play();
        }
        else
        {
            nextSong();
        }
    }
    music.volume = document.getElementById("volume").value / 100;

    // If music was playing before the switch, keep playing
    if (wasPlaying) {
        music.play();
        isPlaying = true;
        document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    } else {
        isPlaying = false;
        document.getElementById("toggle-play-icon").innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21"></polygon></svg>';
    }

    displaySong();
    var subtitle = document.querySelector('.playlist-subtitle');
    if (subtitle) subtitle.textContent = playlistSubtitles[currentPlaylist] || '';
    updateTrackList();
    selectedSong();
}

function changeSong(chosenSong)
{
    music.pause();

    currentSong = chosenSong;

    music = new Audio(playlists[currentPlaylist][currentSong]);
    music.onended = function()
    {
        if(isRepeat == true)
        {
            music.currentTime = 0;
            music.play();
        }
        else
        {
            nextSong();
        }
    }
    music.volume = document.getElementById("volume").value / 100;
    music.play();

    isPlaying = true;

    document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    displaySong();
    selectedSong();
}

function selectedSong()
{
    var allSongs = document.getElementsByClassName("playlist-track-item");

    for (var i = 0; i < allSongs.length; i++)
    {
        allSongs[i].classList.remove("active");
    }

    if (allSongs[currentSong])
    {
        allSongs[currentSong].classList.add("active");
    }
}

function changeVolume()
{
    music.volume = document.getElementById("volume").value / 100;
}

// ── Ambient Sounds ──
// Each play button creates/reuses an Audio object, loops it, toggled on/off.
// Each slider controls that sound's individual volume.

var ambientSounds = {};  // key: file path, value: Audio object
window.ambientSounds = ambientSounds;

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
      updateAmbientBtnState();
    } else {
      // Play
      audio.play();
      btn.classList.add('playing');
      btn.innerHTML = '&#10074;&#10074;';  // pause bars
      updateAmbientBtnState();
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

function updateAmbientBtnState() {
  var anyPlaying = document.querySelector('.sfx-play-btn.playing');
  var toggleBtn = document.getElementById('btn-sfx-toggle');
  if (anyPlaying) {
    toggleBtn.classList.add('sfx-active');
  } else {
    toggleBtn.classList.remove('sfx-active');
  }
}

function updateTrackList()
{
    var trackList = document.getElementsByClassName("playlist-track-list")[0]; 
    document.getElementsByClassName("playlist-subtitle")[0].textContent =
    playlistSubtitles[currentPlaylist];

    trackList.innerHTML = "";

    var titles = songs[currentPlaylist];
    var currentArtists = artists[currentPlaylist];

    for (var i = 0; i < titles.length; i++)
    {
        var item = document.createElement("div");
        item.className = "playlist-track-item";

        item.onclick = (function(index)
        {
            return function()
            {
                changeSong(index);
            };
        })(i);

        item.innerHTML =
        '<span class="p-track-num">' + (i + 1).toString().padStart(2, '0') + '</span>' +
        '<div>' +
            '<div class="p-track-title">' + titles[i] + '</div>' +
            '<div class="p-track-artist">' + currentArtists[i] + '</div>' +
        '</div>';

        trackList.appendChild(item);
    }
}

// Audio unlocked by welcome overlay click
var audioUnlocked = false;

document.getElementById('welcome-overlay').addEventListener('click', function () {
    audioUnlocked = true;
    
    // Fade out overlay
    this.classList.add('hidden');
    setTimeout(function () {
        document.getElementById('welcome-overlay').style.display = 'none';
    }, 1000);
    
    // Start music
    music.volume = document.getElementById("volume").value / 100;
    music.play().catch(function(){});
    isPlaying = true;
    document.getElementById("toggle-play-icon").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>';
    displaySong();
    
    // Start default SFX
    var defaults = sceneSFX['dollhouse'];
    if (defaults) {
        defaults.forEach(function (src) {
            if (!ambientSounds[src]) {
                ambientSounds[src] = new Audio(src);
                ambientSounds[src].loop = true;
                var btn = document.querySelector('.sfx-play-btn[data-ambient="' + src + '"]');
                var slider = btn ? btn.parentElement.querySelector('.sfx-slider') : null;
                if (slider) ambientSounds[src].volume = slider.value / 100;
            }
            ambientSounds[src].play().catch(function(){});
            var btn = document.querySelector('.sfx-play-btn[data-ambient="' + src + '"]');
            if (btn) {
                btn.classList.add('playing');
                btn.innerHTML = '&#10074;&#10074;';
            }
        });
        updateAmbientBtnState();
    }
});

var sceneSFX = {
    dollhouse: ['assets/audio/ambient/cry.mp3', 'assets/audio/ambient/laugh.mp3'],
    garden: ['assets/audio/ambient/thunder.mp3', 'assets/audio/ambient/atmosphere.mp3'],
    ballroom: ['assets/audio/ambient/fire.mp3', 'assets/audio/ambient/whispers.mp3'],
};

function switchSceneSFX(sceneKey) {
  // Hard-stop ALL ambient audio — playing, paused, or saved
  Object.keys(ambientSounds).forEach(function (src) {
    ambientSounds[src].pause();
    ambientSounds[src].currentTime = 0;
  });
  document.querySelectorAll('.sfx-play-btn').forEach(function (btn) {
    btn.classList.remove('playing');
    btn.classList.remove('muted');
    btn.innerHTML = '&#9654;';
  });

  // Start the defaults for this scene
  var defaults = sceneSFX[sceneKey];
  if (!defaults || !audioUnlocked) {
    updateAmbientBtnState();
    return;
  }

  defaults.forEach(function (src) {
    if (!ambientSounds[src]) {
      ambientSounds[src] = new Audio(src);
      ambientSounds[src].loop = true;
      var btn = document.querySelector('.sfx-play-btn[data-ambient="' + src + '"]');
      var slider = btn ? btn.parentElement.querySelector('.sfx-slider') : null;
      if (slider) ambientSounds[src].volume = slider.value / 100;
    }
    ambientSounds[src].play().catch(function(){});
    var btn = document.querySelector('.sfx-play-btn[data-ambient="' + src + '"]');
    if (btn) {
      btn.classList.add('playing');
      btn.innerHTML = '&#10074;&#10074;';
    }
  });
  updateAmbientBtnState();
}
window.changePlaylist = changePlaylist;
window.switchSceneSFX = switchSceneSFX;
displaySong();
updateTrackList();
selectedSong();