var distance = 0;
var CountDate = "";

function startCountdown(t) {
    const url = new URL(window.location.href);
    url.searchParams.set('t', t);
    window.history.pushState(null, '', url.toString());

    const date = new Date(t);
    CountDate = date.toLocaleString();
    document.getElementById("head.title").innerHTML = "Contagem regressiva para: " + CountDate;
    document.getElementById("time.title").innerHTML = "Contagem regressiva para: " + CountDate;
    document.getElementById("select").style = "display: none;";
    document.getElementById("counter").style = "";

    var countDownDate = date.getTime();
    var x = setInterval(function () {
        var now = new Date().getTime();
        distance = countDownDate - now;
        var time = { dias: Math.floor(distance / (1000 * 60 * 60 * 24)), horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), segundos: Math.floor((distance % (1000 * 60)) / 1000) };
        for (var i in time) {
            var v = time[i];
            document.getElementById(i).innerHTML = `${v} ${i}`;
        };
        if (distance < 1000) {
            var done = new Audio("audios/done.mp3")
            done.play()
            document.getElementById("head.title").innerHTML = "Countdown";
            document.getElementById("time.title").innerHTML = "";
            document.getElementById("select").style = "";
            document.getElementById("counter").style = "display: none;";
            clearInterval(x);
        };
    }, 1);
};