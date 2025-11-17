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

// small helper to escape text for HTML
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// parse eLRC: returns { lineTime: ms, words: [{time: ms, word: '...'}, ...], hasTaggedWord: bool } or null
function parseELRC(line) {
    const lineMatch = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!lineMatch) return null;
    const lineTime = (parseInt(lineMatch[1], 10) * 60 + parseFloat(lineMatch[2])) * 1000;
    const content = lineMatch[3].trim();
    const words = [];
    let hasTagged = false;
    // Match an optional <MM:SS.ms> tag before each word; words without a tag will get the line time
    const wordRegex = /(?:<(\d+):(\d+\.\d+)>\s*)?(\S+)/g;
    let match;
    while ((match = wordRegex.exec(content)) !== null) {
        let timeMs = lineTime;
        if (match[1] !== undefined) {
            timeMs = (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000;
            hasTagged = true;
        }
        const word = match[3];
        words.push({ time: timeMs, word });
    }
    return words.length > 0 ? { lineTime, words, hasTaggedWord: hasTagged } : null;
}

let playing = false;
playButton.addEventListener('click', () => {
    if (inputAudio && inputLyrics && !playing) {
        playing = true;
        lrcDisplay.style.display = 'block';
        container.style.display = 'none';
        document.documentElement.requestFullscreen();
        audio.play();

        // schedule display & per-word cumulative updates
        for (let i = 0; i < lyrics.length; i++) {
            // always clear at the bracket timestamp (handles pure-instrumental lines like: "[MM:SS.mm] ")
            const bracketOnly = lyrics[i].match(/\[(\d+):(\d+\.\d+)\]/);
            if (bracketOnly) {
                const clearAt = (parseInt(bracketOnly[1], 10) * 60 + parseFloat(bracketOnly[2])) * 1000;
                setTimeout(() => { lrcDisplay.innerHTML = ''; }, Math.max(0, Math.floor(clearAt)));
            }
            const elrc = parseELRC(lyrics[i]);
            if (elrc) {
                const rawWords = elrc.words.map(w => w.word);
                // prepare display words (apply undercase if requested)
                const displayWordsBase = rawWords.map(w => undercase ? escapeHtml(w.toLowerCase()) : escapeHtml(w));

                if (!elrc.hasTaggedWord) {
                    // No per-word tags -> plain LRC line: show full line at lineTime
                    setTimeout(() => {
                        lrcDisplay.innerHTML = displayWordsBase.join(' ');
                    }, Math.max(0, Math.floor(elrc.lineTime)));
                } else {
                    // eLRC per-word timed line:
                    // 1) clear display at the line timestamp to avoid previous lyric lingering during instrumental parts
                    setTimeout(() => {
                        lrcDisplay.innerHTML = '';
                    }, Math.max(0, Math.floor(elrc.lineTime)));

                    // 2) progressively append words as their timestamps occur
                    elrc.words.forEach((w, idx) => {
                        setTimeout(() => {
                            // Build cumulative line up to current word
                            const html = displayWordsBase.slice(0, idx + 1).join(' ');
                            lrcDisplay.innerHTML = html;
                        }, Math.max(0, Math.floor(w.time)));
                    });
                }
            } else {
                // fallback: plain LRC line (no eLRC words)
                const match = lyrics[i].trim().match(/\[(\d+):(\d+\.\d+)\](.*)/);
                if (match) {
                    const lineTime = (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000;
                    const lrc = match[3].trim();
                    setTimeout(() => {
                        lrcDisplay.innerHTML = undercase ? escapeHtml(lrc.toLowerCase()) : escapeHtml(lrc);
                    }, Math.max(0, Math.floor(lineTime)));
                }
            }
        }

        audio.addEventListener('ended', () => {
            document.exitFullscreen();
            window.location.reload();
        }, { once: true });
    }
});