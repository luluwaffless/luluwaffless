let logs = [];
const $ = (i) => document.getElementById(i);
const parseLogs = t => t.split("\n").reduce((a, l) => (/^\[.*\]/.test(l) ? a.push([l]) : a[a.length - 1].push(l), a), []).map(b => b.join("\n"));
const displayLogs = l => {
    $("list").innerHTML = "";
    for (let i = 0; i < l.length; i++) {
        const button = document.createElement("button");
        button.className = "log";
        button.id = i;
        button.textContent = l[i].split('\n')[0];
        button.addEventListener("click", () => $("text").textContent = l[i]);
        $("list").appendChild(button);
    };
};
const loadLogs = () => {
    $("text").textContent = "Loading...";
    fetch("/logs").then(response => response.text()).then(text => {
        logs = parseLogs(text);
        $("text").textContent = "";
        displayLogs(logs);
    });
};
const filterLogs = m => m ? logs.filter(l => l.toLowerCase().includes(m.trim().toLowerCase())) : logs;
$("search").addEventListener("change", e => displayLogs(filterLogs(e.target.value)));
$("dump").addEventListener("click", () => {
    const q = $("search").value || "";
    const f = filterLogs(q).join('\n');
    const a = document.createElement("a");
    a.download = `${q}.log`;
    a.href = URL.createObjectURL(new Blob([f], { type: 'text/plain;charset=utf-8' }));
    a.click();
    a.remove();
    URL.revokeObjectURL(link.href);
});
loadLogs();