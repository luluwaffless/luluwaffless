const currentRate = document.getElementById('currentRate');
const audioInput = document.getElementById('audioInput');
const syncButton = document.getElementById('syncButton');
const container = document.getElementById('container');
const rateInput = document.getElementById('rateInput');
const lrcInput = document.getElementById('lrcInput');
const lrcDisplay = document.getElementById('lyrics');
const synced = document.getElementById('synced');
const guide = document.getElementById('guide');
const timer = document.getElementById('timer');
const rate = document.getElementById('rate');
let inputLyrics = false;
let inputAudio = false;
let audio = new Audio();
let lyrics = [];


audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        inputAudio = true;
        audio.src = URL.createObjectURL(file);
        rateInput.style.display = 'block';
        rate.addEventListener('change', (e) => {
            audio.playbackRate = e.target.value
            currentRate.innerHTML = `${e.target.value}x`;
        });
    }
});


lrcInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        inputLyrics = true;
        const reader = new FileReader();
        reader.onload = function (event) {
            lyrics = event.target.result.split('\n');
        };
        reader.readAsText(file);
    }
});

let currentWord = 1;
let currentLyric = -1;
let playing = false;
let started = false;
let syncedLyrics = [];
const getFormattedTime = (currentTime) => `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}.${String(Math.floor((currentTime % 1) * 100)).padStart(2, '0')}`;
const showTime = () => {
    if (lyrics[currentLyric + 1]) {
        const match = lyrics[currentLyric + 1].trim().match(/\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
            const time = String(Math.floor(((parseInt(match[1], 10) * 60 + parseFloat(match[2])) - audio.currentTime) * 1000) / 1000).split('.');
            timer.innerHTML = `${time[0]}.${time[1] ? time[1].padEnd(3, '0') : '000'}`;
        };
        requestAnimationFrame(showTime);
    };
};
syncButton.addEventListener('click', () => {
    if (inputAudio && inputLyrics && !playing) {
        playing = true;
        lrcDisplay.style.display = 'block';
        container.style.display = 'none';
        document.body.requestFullscreen();
        setTimeout(() => {
            synced.innerHTML = "2";
        }, 1000);
        setTimeout(() => {
            synced.innerHTML = "1";
        }, 2000);
        setTimeout(() => {
            synced.innerHTML = "";
            guide.innerHTML = "";
            timer.innerHTML = "";
            showTime();
            audio.play();
            for (let i = 0; i < lyrics.length; i++) {
                const match = lyrics[i].trim().match(/\[(\d+):(\d+\.\d+)\](.*)/);
                if (match) {
                    setTimeout(() => {
                        started = true;
                        currentWord = 1;
                        currentLyric = i;
                        const words = match[3].trim().match(/[^\s-]+|-/g);
                        const firstWord = words[0].replace(/,$/, '');
                        syncedLyrics.push(`[${match[1]}:${match[2]}] ${firstWord}`);
                        guide.innerHTML = match[3].trim();
                        synced.innerHTML = firstWord;
                    }, ((parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000) / audio.playbackRate);
                };
            };
        }, 3000);
        document.body.addEventListener('keydown', (e) => {
            if (e.key == "Enter" && started) {
                // Split the line into words, preserving punctuation with the next word
                const line = lyrics[currentLyric].trim();
                const words = line.split(/(?<=[^,])\s+|-/).map(w => w.trim()).filter(Boolean);
                
                if (currentWord < words.length - 1) {
                    currentWord++;
                    // If we hit a hyphen, skip it and move to next word
                    if (words[currentWord] === '-') {
                        currentWord++;
                    }
                    
                    // Build the display text from all words up to current
                    const displayWords = words.slice(0, currentWord + 1);
                    synced.innerHTML = displayWords.join(' ');
                    syncedLyrics.push(`[${getFormattedTime(audio.currentTime)}] ${synced.innerHTML}`);
                };
            };
        });
        audio.addEventListener('ended', () => {
            document.exitFullscreen();
            const blob = new Blob([syncedLyrics.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `synced.lrc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("sync completed! downloaded synced.lrc file");
            window.location.reload();
        }, { once: true });
    };
});