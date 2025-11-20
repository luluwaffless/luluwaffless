var distance = 0;
var CountDate = "";
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startCountdown(arg1) {
    CountDate = `${months[parseInt(arg1.substring(5, 7)) - 1]} ${arg1.substring(8, 10)} ${arg1.substring(0, 4)}, ${arg1.substring(12, 17)}:00`;
    document.getElementById("head.title").innerHTML = "Contagem regressiva para: " + CountDate;
    document.getElementById("time.title").innerHTML = "Contagem regressiva para: " + CountDate;
    document.getElementById("select").style = "display: none;";
    document.getElementById("counter").style = "";

    var countDownDate = new Date(CountDate).getTime();
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