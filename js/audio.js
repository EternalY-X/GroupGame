// audio.js — Playlist logic

var playlists = 
{
    DollHouse: ["1-requiem-lacrimosa-mozart.mp3", "2-lullaby-brahms.mp3", "3-badinerie-bach.mp3", "4-beethoven-for-elise.mp3"],
    Garden: [],
    Ballroom: []
}; // need more songs

var names = 
{
    DollHouse: ["placeholderName1", "placeholderName2", "placeholderName3", "placeholderName4"],
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
    document.getElementsByClassName("track-title").textContent = names[currentSong];
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
}