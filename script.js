const songMetadata = [
    { file: "DayLight.mp3", title: "Daylight", artist: "David Kushner", img: "img/daylight.jpeg" },
    { file: "Perfect.mp3", title: "Perfect", artist: "Ed Sheeran", img: "img/perfect.jpeg" },
    { file: "SummertimeSadness.mp3", title: "Summertime Sadness", artist: "Lana Del Rey", img: "img/summertimesadness.jpeg" },
    { file: "TheNightWeMet.mp3", title: "The Night We Met", artist: "Lord Huron", img: "img/thenightwemet.jpeg" },
    { file: "Starboy.mp3", title: "Starboy", artist: "The Weeknd", img: "img/starboy.jpeg" },
];


import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);


let songs = []

async function loadsongs() {
    songs = songMetadata.map(meta => ({
        title: meta.title,
        artist: meta.artist,
        img: meta.img,
        url: supabase.storage.from("songs").getPublicUrl(meta.file).data.publicUrl
    }))
    return songs
}

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    secs = secs < 10 ? "0" + secs : secs;
    return minutes + ":" + secs;
}


let audio = new Audio();
let currentBtn = null;
let bottomPlayBtn = document.querySelector(".playBtn")

async function playsong(song, btn) {
    if (currentBtn === btn && audio) {
        if (audio.paused) {
            audio.play()
            currentBtn.querySelector("img").src = "icons/pause.svg"
            bottomPlayBtn.querySelector("img").src = "icons/pause.svg"
        } else {
            audio.pause()
            currentBtn.querySelector("img").src = "icons/play.svg"
            bottomPlayBtn.querySelector("img").src = "icons/play.svg"
        }
        return
    }

    if (!audio.paused && currentBtn) {
        currentBtn.querySelector("img").src = "icons/play.svg";
    }


    audio.src = song.url
    audio.play();

    document.querySelector(".player-card .leftSongCard img").src = song.img
    document.querySelector(".player-card .leftSongCard .songName").textContent = song.title
    document.querySelector(".player-card .leftSongCard .ArtistName").textContent = "Artist • " + song.artist
    btn.querySelector('img').src = "icons/pause.svg"
    bottomPlayBtn.querySelector("img").src = "icons/pause.svg"

    document.querySelector(".playBtn").style.backgroundColor = "white"
    document.querySelector(".previous").style.filter = "invert(1)"
    document.querySelector(".next").style.filter = "invert(1)"

    currentBtn = btn
}


async function cards() {
    await loadsongs();
    let Lcards = document.querySelector(".left-cards")
    let Rcards = document.querySelector(".cards")

    for (const song of songs) {
        let LeftCard = document.createElement("div")
        LeftCard.className = "leftSongCard"

        let RightCard = document.createElement("div")
        RightCard.className = "card"

        LeftCard.innerHTML = `<img src="${song.img}" alt="perfect">
                            <div class="songDetails">
                                <span class="songName">${song.title}</span>
                                <span class="ArtistName">Artist • ${song.artist}</span>
                            </div>
                            <div class="card-playBtn">
                                <img src="icons/play.svg" alt="play">
                            </div>`;

        RightCard.innerHTML = `<img src="${song.img}" alt="dayLight">
                            <span class="songName">${song.title}</span>
                            <span class="ArtistName">${song.artist}</span>
                            <div class="card-playBtn">
                                <img src="icons/play.svg"  alt="play">
                            </div>
                            `

        LeftCard.querySelector(".card-playBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            playsong(song, LeftCard.querySelector(".card-playBtn"));
        });

        RightCard.querySelector(".card-playBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            playsong(song, RightCard.querySelector(".card-playBtn"));
        })

        document.getElementById("menu").addEventListener("click", () => {
            LeftCard.addEventListener("click", (e) => {
                e.stopPropagation();
                playsong(song, LeftCard.querySelector(".card-playBtn"));
            });
        })



        Lcards.appendChild(LeftCard);
        Rcards.appendChild(RightCard);
    }


}
cards()

async function PlayPause() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play();
        bottomPlayBtn.querySelector("img").src = "icons/pause.svg";
        currentBtn.querySelector("img").src = "icons/pause.svg";
    } else {
        audio.pause();
        bottomPlayBtn.querySelector("img").src = "icons/play.svg";
        currentBtn.querySelector("img").src = "icons/play.svg";
    }
}

async function main() {

    await loadsongs()

    bottomPlayBtn.addEventListener("click", PlayPause)
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault()
            PlayPause()
        }
    })


    audio.addEventListener("timeupdate", () => {
        if (!audio.src) { return }
        document.querySelector(".CurrentSec").innerHTML = formatTime(audio.currentTime)
        document.querySelector(".Duration").innerHTML = formatTime(audio.duration)
        document.querySelector(".Circle").style.left = (audio.currentTime / audio.duration) * 98 + "%"
        document.querySelector(".seekbarProgress").style.width = (audio.currentTime / audio.duration) * 100 + "%"
    })


    document.querySelector(".seekbar").addEventListener("click", (e) => {
        if (!audio.src) { return }
        let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".Circle").style.left = per + "%"
        audio.currentTime = (audio.duration * per) / 100
    })

    audio.addEventListener("ended", () => {
        if (!audio.src) { return }
        if (currentBtn) currentBtn.querySelector("img").src = "icons/play.svg";
        bottomPlayBtn.querySelector("img").src = "icons/play.svg";
        document.querySelector(".Circle").style.left = 0 + "%"
        document.querySelector(".seekbarProgress").style.width = 0 + "%"
        document.querySelector(".CurrentSec").innerHTML = "00:00"
    })

    let volumeBtn = document.querySelector(".volumeBtn")
    volumeBtn.addEventListener("click", () => {
        if (!audio.src) { return }
        if (audio.muted) {
            volumeBtn.src = "icons/volume.svg"
            audio.muted = false
            document.getElementById("volume").value = (audio.volume * 100)
            console.log("Volume changed - CurrVolume = ", (audio.volume * 100))
        }
        else {
            volumeBtn.src = "icons/mute.svg"
            audio.muted = true
            document.getElementById("volume").value = 0
            console.log("Volume changed - CurrVolume = ", (audio.volume * 100))
        }
    })

    document.getElementById("volume").addEventListener("change", (e) => {

        audio.volume = (e.target.value) / 100
        if (e.target.value == 0) {
            volumeBtn.src = "icons/mute.svg"
        }
        else {
            volumeBtn.src = "icons/volume.svg"
        }
    })
    document.querySelector(".previous").addEventListener("click", () => {
        if (!audio.src) { return }
        let songindex = (songs.findIndex(song => song.url === audio.src)) - 1
        if (songindex < 0) { songindex = songs.length - 1 }
        let cards = document.querySelectorAll(".card")
        let cardIndex = Array.from(cards).findIndex(c =>
            songs[songindex].title === c.querySelector(".songName").textContent
        )
        playsong(songs[songindex], cards[cardIndex].querySelector(".card-playBtn"))

    })


    document.querySelector(".next").addEventListener("click", () => {
        if (!audio.src) { return }
        let songindex = (songs.findIndex(song => song.url === audio.src)) + 1
        if (songindex > songs.length - 1) { songindex = 0 }
        let cards = document.querySelectorAll(".card")
        let cardIndex = Array.from(cards).findIndex(c =>
            songs[songindex].title === c.querySelector(".songName").textContent
        )
        playsong(songs[songindex], cards[cardIndex].querySelector(".card-playBtn"))
    })

    document.getElementById("menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

}

main()