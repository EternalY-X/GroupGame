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