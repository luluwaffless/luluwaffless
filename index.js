import { readdirSync, appendFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { normalize } from "node:path";
import stripAnsi from "strip-ansi";
import express from "express";
import chalk from "chalk";
import axios from "axios";
import cors from "cors";

const file = (name) => normalize(`${import.meta.dirname}/${name}`);
const log = (data, file = `logs`, logInConsole = true, error) => {
    const date = new Date();
    if (!error) {
        const str = `${chalk.green(`[${date.toISOString()}]`)} ${data}`;
        if (logInConsole) console.log(str);
        appendFileSync(`${file}.log`, `${stripAnsi(str)}\n`);
    } else {
        const str = `${chalk.green(`[${date.toISOString()}]`)} ${chalk.red(`${data}: ${error.message}, ${error.stack || "no stack trace available"}`)}`;
        if (logInConsole) console.error(`${chalk.green(`[${date.toISOString()}]`)} ${chalk.red(`${data}: `)}${error}\n`);
        appendFileSync(`${file}.log`, `[${date.toISOString()}] ${data}: ${error.message}, ${error.stack || "no stack trace available"}\n`);
    };
};
const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    };
    return arr;
};
const report = async (ip, date, requests) => {
    try {
        const paths = shuffle(Object.keys(requests));
        const params = new URLSearchParams({
            ip,
            categories: "19",
            comment: `Malicious crawler. Attempted to fetch multiple blocked paths (${paths.slice(0, 5).join(", ")}${paths.length > 5 ? ", etc." : ""}).`,
            timestamp: date.toISOString()
        });
        const r = await axios.post("https://api.abuseipdb.com/api/v2/report", params, { headers: { Key: process.env.ABUSEIPDB, Accept: "application/json" } });
        log(`Reported ${ip} successfully. ACS: ${r.data.data?.abuseConfidenceScore}%\n`);
        return true;
    } catch (e) {
        log(`Couldn't report ${ip}`, "errors", true, e);
        return false;
    };
};

const port = Number(process.env.PORT) || 80;
const blockedPaths = readFileSync("blockedPaths.txt", "utf8").replace(/\r/g, "").split("\n");
const flaggedIps = existsSync("flaggedIps.json") ? JSON.parse(readFileSync("flaggedIps.json", "utf8")) : {};
const saveFlaggedIps = () => writeFileSync("flaggedIps.json", JSON.stringify(flaggedIps, null, 2));

readdirSync("servers").forEach(async f => {
    const serverModule = await import(`./servers/${f}`);
    const { name, subport, methods } = serverModule.default;
    const server = express();

    // logger
    server.use((req, res, next) => {
        res.on("finish", () => {
            const logs = [`${chalk.yellow(`(${name})`)} ${req.socket.remoteAddress}:${req.socket.remotePort}`, `${chalk.blue(req.method)} ${req.originalUrl} ${chalk.blue(`HTTP/${req.httpVersion}`)}`, chalk.magenta(`Status: ${res.statusCode}`), chalk.magenta(`Length: ${res.getHeader("Content-Length") || 0}`), chalk.yellow("---- Request Headers ----")];
            if (req.rawHeaders && req.rawHeaders.length) for (let i = 0; i < req.rawHeaders.length; i += 2) logs.push(`${chalk.blue(`${req.rawHeaders[i]}:`)} ${req.rawHeaders[i + 1]}`);
            else for (const [k, v] of Object.entries(req.headers)) logs.push(`${chalk.blue(`${k}:`)} ${v}`);
            logs.push("");
            if (req.rawBody && req.rawBody.length) {
                const text = req.rawBody.toString("utf8");
                const looksBinary = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
                logs.push(looksBinary ? req.rawBody.toString("base64") + " (base64)" : text);
            } else logs.push("-");
            logs.push("");
            log(logs.join("\n"), "logs", !req.headers["cf-worker"]);
        });
        next();
    });

    // security middleware
    server.use(async (req, res, next) => {
        const date = new Date();
        const time = date.getTime();
        const isBlockedPath = (blockedPaths.some(p => req.path.toLowerCase().startsWith(p.toLowerCase())));
        const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        if (flaggedIps[ip]) {
            flaggedIps[ip].hits = flaggedIps[ip].hits.filter(t => (time - t) < 900000);
            saveFlaggedIps();
        };

        const isBlockedIp = (flaggedIps[ip] && flaggedIps[ip].hits.length >= 5);
        if (!isBlockedPath && !isBlockedIp) return next();

        if (!flaggedIps[ip]) flaggedIps[ip] = { lastReported: 0, hits: [], requests: {} };
        if (isBlockedPath) flaggedIps[ip].hits.push(time);
        if (!flaggedIps[ip].requests[req.path]) flaggedIps[ip].requests[req.path] = 0;
        flaggedIps[ip].requests[req.path]++;
        if (flaggedIps[ip].hits.length >= 5) {
            res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            if ((time - flaggedIps[ip].lastReported > 900000)) {
                const s = await report(ip, date, flaggedIps[ip].requests);
                if (s) flaggedIps[ip].lastReported = time;
            };
        } else next();
        saveFlaggedIps();
    });

    // health check
    server.get("/health", (_, r) => r.status(200).json({ hello: "world", time: Date.now() }));

    // universal config
    server.use(cors());
    methods.forEach(({ method, args }) => {
        const mapped = args.map(a => typeof a === "string" && !a.startsWith("/") ? eval(a) : a);
        server[method](...mapped);
    });

    // universal static files
    server.get("/favicon.ico", (_, r) => r.sendFile(file(`favicon.ico`))); // favicon
    server.use((_, r) => r.status(404).sendFile(file(`404.html`))); // 404 page
    server.listen(port + subport, () => log(`${name} running at http://localhost${port + subport !== 80 ? `:${port + subport}` : ""}`));
});