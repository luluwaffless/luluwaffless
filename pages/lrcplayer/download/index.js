const trackName = document.getElementById('trackName');
const albumName = document.getElementById('albumName');
const artistName = document.getElementById('artistName');
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', async () => {
    if (trackName.value && albumName.value && artistName.value) {
        const search = new URLSearchParams({
            "track_name": trackName.value,
            "album_name": albumName.value,
            "artist_name": artistName.value
        });
        try {
            const response = await fetch("https://lrclib.net/api/get?" + search.toString());
            const json = await response.json();
            if (json.syncedLyrics) {
                const blob = new Blob([json.syncedLyrics], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${trackName.value}.lrc`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert("no synced lyrics found for this track.");
            };
        } catch (err) {
            alert("error fetching lyrics, please try again later.");
            console.error(err);
        };
    };
});