const week = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta"];
const time = document.getElementById("time");
const date = document.getElementById("date");
const play = document.getElementById("play");
const type = document.getElementById("type");
var audio = new Audio(`${type.value}.mp3`);
var playing = false;

play.addEventListener("click", () => {
    playing = !playing;
    play.innerHTML = (playing) ? "⏸" : "⏵";
    if (playing) {
        audio.loop = true;
        audio.play();
    } else {
        audio.pause();
    };
});

type.addEventListener("change", () => {
    audio.pause();
    audio.currentTime = 0;
    audio = new Audio(`${type.value}.mp3`);
    if (playing) {
        audio.loop = true;
        audio.play();
    };
});

const clock = () => {
    var currentDate = new Date();
    time.innerHTML = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    date.innerHTML = `${week[currentDate.getDay()]}, ${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    requestAnimationFrame(clock);
};
clock();