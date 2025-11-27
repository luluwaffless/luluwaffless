import { readdirSync, appendFileSync } from "node:fs";
import { normalize } from "node:path";
import stripAnsi from "strip-ansi";
import express from "express";
import chalk from "chalk";
import cors from 'cors';
const port = Number(process.env.PORT) || 80;
const file = (name) => normalize(`${import.meta.dirname}/${name}`);
const log = async (data) => {
    const str = `${chalk.green(`[${new Date().toISOString()}]`)} ${data}`;
    console.log(str);
    appendFileSync(`logs.log`, `${stripAnsi(str)}\n`);
};
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
            log(logs.join("\n"));
        });
        next();
    });
    // basic bot protection
    server.use((req, res, next) => {
        if (req.headers["user-agent"]?.includes("Mozilla/5.0")) next();
        else res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
    // universal config
    server.use(cors());
    methods.forEach(({ method, args }) => server[method](...args));
    // universal static files
    server.get("/favicon.ico", (_, r) => r.sendFile(file(`favicon.ico`))); // favicon
    server.use((_, r) => r.status(404).sendFile(file(`404.html`))); // 404 page
    server.listen(port + subport, () => log(`${name} running at http://localhost${port + subport !== 80 ? `:${port + subport}` : ""}`));
});