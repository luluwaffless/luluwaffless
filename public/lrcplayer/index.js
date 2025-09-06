const undercaseInput = document.getElementById('undercase');
const audioInput = document.getElementById('audioInput');
const playButton = document.getElementById('playButton');
const container = document.getElementById('container');
const audioName = document.getElementById('audioName');
const lrcInput = document.getElementById('lrcInput');
const lrcDisplay = document.getElementById('lyrics');
const lrcName = document.getElementById('lrcName');
const text = document.getElementById('text');
const bg = document.getElementById('bg');
let inputLyrics = false;
let inputAudio = false;
let undercase = true;
let lyrics = [];
let audio = new Audio();

text.addEventListener('change', () => document.documentElement.style.setProperty('--text-color', text.value));
bg.addEventListener('change', () => document.documentElement.style.setProperty('--bg-color', bg.value));

undercaseInput.addEventListener('change', (e) => {
    undercase = e.target.checked;
});

audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        inputAudio = true;
        audioName.innerHTML = file.name;
        audio.src = URL.createObjectURL(file);
    }
});

lrcInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        inputLyrics = true;
        lrcName.innerHTML = file.name;
        const reader = new FileReader();
        reader.onload = function (event) {
            lyrics = event.target.result.split('\n');
        };
        reader.readAsText(file);
    }
});

let playing = false;
playButton.addEventListener('click', () => {
    if (inputAudio && inputLyrics && !playing) {
        playing = true;
        lrcDisplay.style.display = 'block';
        container.style.display = 'none';
        // document.body.requestFullscreen();
        audio.play();
        for (let i = 0; i < lyrics.length; i++) {
            const match = lyrics[i].trim().match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) {
                setTimeout(() => {
                    const lrc = match[3].trim()
                    lrcDisplay.innerHTML = undercase ? lrc.toLowerCase() : lrc;
                }, (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000);
            };
        };
        audio.addEventListener('ended', () => {
            document.exitFullscreen();
            window.location.reload();
        }, { once: true });
    };
});