const audio = document.getElementById('audio');
const image = document.getElementById('image');
const video = document.getElementById('video');
const timestamp = document.getElementById("timestamp");
const start = document.getElementById("start");
const selection = document.getElementById("selection");
const enableice = document.getElementById("enableice");
const customlabel = document.getElementById("customlabel");
const customaudio = document.getElementById("customaudio");
const customice = document.getElementById("customice");
const icelabel = document.getElementById("icelabel");
const darkmode = document.getElementById("darkmode");
const style = document.getElementById("style");
let clicked = false;
let playing = false;
let defrost = false;
let toplay = new Audio();
let iceaudio = new Audio("default.mp3");
let playice = true;
let isvideo = false;
const dayify = (date) => `${date}${(date >= 11 && date <= 13) || date % 10 > 3 ? 'th' : ['th', 'st', 'nd', 'rd'][date % 10]}`;
const timestampify = (timestamp) => timestamp.length === 3 ? (timestamp[0] * 3600) + (timestamp[1] * 60) + timestamp[2] : timestamp.length === 2 ? (timestamp[0] * 60) + timestamp[1] : timestamp.length === 1 ? timestamp[0] : undefined;
selection.addEventListener("change", function () {
    document.getElementById("player").innerHTML = "";
    if (this.value == "video") {
        isvideo = true;
        document.getElementById("imageaudiochoose").style = "display: none;"
        audio.value = "";
        document.getElementById("audio.name").innerHTML = "";
        image.value = "";
        document.getElementById("image.name").innerHTML = "";
        document.getElementById("videochoose").style = "display: inline;"
    } else if (this.value == "imageaudio") {
        isvideo = false;
        document.getElementById("videochoose").style = "display: none;"
        video.value = "";
        document.getElementById("video.name").innerHTML = "";
        document.getElementById("imageaudiochoose").style = "display: inline;"
    };
});
darkmode.addEventListener("change", function () {
    if (this.checked) {
        style.innerHTML = `@font-face {
    font-family: Nunito;
    src: url("https://luluwaffless.github.io/Nunito-Regular.ttf");
}
body {
    background-color: black;
    color: white;
    font-family: Nunito;
}
option {
    background-color: black;
    color: white;
    font-family: Nunito;
}
select {
    color: white;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(gray, black);
    border: 1px solid gray;
    font-family: Nunito;
}
input {
    background-color: black;
    color: white;
    padding: 1px;
    border-radius: 4px;
    border: 1px solid gray;
    font-family: Nunito;
}
input[type="file"] {
    display: none;
}
button {
    color: white;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(gray, black);
    border: 1px solid gray;
    font-family: Nunito;
}
.upload {
    color: white;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(gray, black);
    border: 1px solid gray;
    font-family: Nunito;
}`
    } else {
        style.innerHTML = `@font-face {
    font-family: Nunito;
    src: url("https://luluwaffless.github.io/Nunito-Regular.ttf");
}
body {
    background-color: white;
    color: black;
    font-family: Nunito;
}
option {
    background-color: white;
    color: black;
    font-family: Nunito;
}
select {
    color: black;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(white, lightgray);
    border: 1px solid gray;
    font-family: Nunito;
}
input {
    background-color: white;
    color: black;
    padding: 1px;
    border-radius: 4px;
    border: 1px solid gray;
    font-family: Nunito;
}
input[type="file"] {
    display: none;
}
button {
    color: black;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(white, lightgray);
    border: 1px solid gray;
    font-family: Nunito;
}
.upload {
    color: black;
    padding: 1px;
    border-radius: 4px;
    background-image: linear-gradient(white, lightgray);
    border: 1px solid gray;
    font-family: Nunito;
}`
    };
});
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    darkmode.checked = true;
    darkmode.dispatchEvent(new Event('change'));
};
enableice.addEventListener("change", function () {
    if (this.checked) {
        playice = true;
        document.getElementById("player.style").innerHTML = `#player {
    position: relative;
    width: 490px;
    height: 490px;
}

#player::before {
    content: "";
    background-image: url('ice.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 490px;
    height: 490px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
}`;
        customlabel.style = "display: inline;";
    } else {
        playice = false;
        if (customaudio.checked) {
            customaudio.checked = false;
            icelabel.style = "display: none;";
            customice.value = "";
            document.getElementById("customice.name").innerHTML = "";
            iceaudio = new Audio("default.mp3");
        };
        document.getElementById("player.style").innerHTML = `#player {
    position: relative;
    width: 490px;
    height: 490px;
}`;
        customlabel.style = "display: none;";
    };
});
customaudio.addEventListener("change", function () {
    if (this.checked) {
        icelabel.style = "display: inline;";
    } else {
        icelabel.style = "display: none;";
        customice.value = "";
        document.getElementById("customice.name").innerHTML = "";
        iceaudio = new Audio("default.mp3");
    };
});
customice.addEventListener('change', function () {
    iceaudio = new Audio(URL.createObjectURL(customice.files[0]));
    document.getElementById("customice.name").innerHTML = customice.files[0].name;
});
audio.addEventListener('change', function () {
    toplay = new Audio(URL.createObjectURL(audio.files[0]));
    document.getElementById("audio.name").innerHTML = audio.files[0].name;
});
video.addEventListener('change', function () {
    document.getElementById("player").innerHTML = `<video width="490" height="490" id="player.video" style="object-fit: contain; width: 100%; height: 100%;"><source src="${URL.createObjectURL(video.files[0])}" type="video/mp4"></video>`
    document.getElementById("video.name").innerHTML = video.files[0].name;
});
image.addEventListener('change', function () {
    document.getElementById("player").innerHTML = `<img src="${URL.createObjectURL(image.files[0])}" style="object-fit: contain; width: 100%; height: 100%;">`
    document.getElementById("image.name").innerHTML = image.files[0].name;
});
timestamp.addEventListener("keypress", function (e) {
    const key = e.which || e.keyCode;
    if (!(key >= 48 && key <= 58) || timestamp.value.length >= 8) {
        e.preventDefault();
    };
});
start.addEventListener("click", function () {
    if (!clicked) {
        clicked = true;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const datetime = `${document.getElementById("date").value}, ${document.getElementById("time").value}`;
        const countdate = `${months[parseInt(datetime.substring(5, 7)) - 1]} ${datetime.substring(8, 10)} ${datetime.substring(0, 4)}, ${datetime.substring(12, 17)}:00`;
        const audiotimestamp = timestampify(timestamp.value.split(":").map(Number).filter(number => number > 0)) * 1000;
        const finaltimestamp = new Date(countdate).getTime();
        document.getElementById("menu").style = "display: none;";
        document.getElementById("main").style = "top: 50%; left: 50%; position: absolute; transform: translate(-50%, -50%); text-align: center;";
        setInterval(function () {
            const date = new Date();
            const distance = finaltimestamp - date.getTime();
            const timeleft = { h: Math.floor(distance / 3600000), m: Math.floor((distance % 360000) / 60000), s: Math.floor((distance % 60000) / 1000) };
            const returntimeleft = () => timeleft.h <= 0 ? (timeleft.m <= 0 ? (timeleft.s <= 0 ? '' : `${timeleft.s.toString()}`) : `${timeleft.m.toString().padStart(2, "0")}:${timeleft.s.toString().padStart(2, "0")}`) : `${timeleft.h.toString().padStart(2, "0")}:${timeleft.m.toString().padStart(2, "0")}:${timeleft.s.toString().padStart(2, "0")}`;
            document.getElementById("countdown").innerHTML = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}<span style="font-size: small; font-weight: normal;"><br>${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()]} ${dayify(date.getDate())}, ${date.getFullYear()}</span></span>`;
            document.getElementById("timeleft").innerHTML = returntimeleft()
            if (date.getTime() >= finaltimestamp - audiotimestamp && !playing) {
                playing = true;
                if (isvideo == false) {
                    toplay.play();
                } else {
                    document.getElementById("player.video").play();
                };
            };
            if (date.getTime() >= finaltimestamp && !defrost) {
                defrost = true;
                if (playice) iceaudio.play();
                document.getElementById("player.style").innerHTML = `#player {
    position: relative;
    width: 490px;
    height: 490px;
}`;
            };
        }, -33.33333333);
    };
});