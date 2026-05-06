
let currentSong = new Audio()
let play = document.querySelector("#play")
let previous = document.querySelector("#previous")
let next = document.querySelector("#next")
let songs
let currFolder
let cardContainer = document.querySelector(".cardContainer")


function secondstoMinutesSeconds(seconds) {
    if(isNaN(seconds)||seconds<0){
        return "00:00/00:00";
    }
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // add leading zero if needed
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;

    return `${mins}:${secs}`;
}



async function getSongs(folder){
    currFolder = folder;
    let a  = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".m4a")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }
    // return songs

    
}


const playMusic = (track, pause = false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    
}

async function displayAlbums(){
    let a  = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response    
    let anchors = div.getElementsByTagName("a")
    
    Array.from(anchors).forEach(async e => {
    if (e.href.includes("/songs/")) {

        let folder = e.href.split("/songs/")[1]?.split("/")[0];

        if (!folder) return; // skip invalid

        console.log("Folder:", folder);

        try {
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);

            if (!a.ok) return; // skip if file not found

            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
                        <div  class="play">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill = #000 stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        } catch (err) {
            console.log("Error loading:", folder);
        }
        //Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
        // let folder = item.currentTarget.dataset.folder;

        await getSongs(`songs/${item.currentTarget.dataset.folder}`);

        let songUl = document.querySelector(".songList ul");
        songUl.innerHTML = "";   // ✅ clear old list

        // ✅ render new songs
        for (const song of songs) {
            songUl.innerHTML += `<li data-song="${song}">
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song)}</div>
                    <div>Kamran</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        }

        // ✅ reattach click events
        document.querySelectorAll(".songList li").forEach(li => {
            li.addEventListener("click", () => {
                playMusic(li.dataset.song);
            });
        });

        // ✅ optional: auto play first song
            playMusic(songs[0]);
     });
    });
    }
});
    
    
    
}
async function main(){
    
    //get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)


    // Display oll the albums on the page
    displayAlbums()



    //Show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        
        
        
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Kamran</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`
    }
    
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
        
    });
    //Attach an event listener next and previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    //listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondstoMinutesSeconds(currentSong.currentTime)}/${secondstoMinutesSeconds(currentSong.duration)}`

        //setting the seekbar circle
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    })

    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left =   percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent)/100
    })

    //Add an event listener to previous and next
    previous.addEventListener("click",()=>{
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index);
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
        
        
    })
    next.addEventListener("click",()=>{
        // console.log(currentSong.src.split("/").slice(-1));
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index);
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
        
    })
    //Add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        // console.log(e);
        currentSong.volume = parseInt(e.target.value)/100
        
    })

    
    
}


//Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "0"
})
main()
//Add an event listener for hamclose 
document.querySelector(".cross").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "-120%"
})




// Add event listener to mute the app
document.querySelector(".volume>img").addEventListener("click",(e)=>{
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
        currentSong.volume = 0
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
        currentSong.volume = .1
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
})