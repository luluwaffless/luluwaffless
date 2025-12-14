import { readdirSync, existsSync } from "node:fs";
import { lookup } from "mime-types";
import path from "node:path";
export default {
  name: "files",
  subport: 1,
  methods: [
    {
      method: "get",
      args: [/.*/, (req, res, next) => {
        if (req.path === '/' || !req.path.endsWith('/')) return next();
        const root = path.resolve("files");
        const requestedPath = path.resolve(root, "." + req.path);
        if (!requestedPath.startsWith(root)) return next();
        const folder = path.join(root, req.path);
        if (!existsSync(folder)) return next();
        const files = readdirSync(folder, { withFileTypes: true });
        if (files.length === 0 || files.some(file => file.name === 'index.html')) return next();
        const e = files.map(file => {
          const filepath = path.join(folder, file.name);
          if (file.isDirectory()) return `<div class="e"><img class="icon" src="/.icons/folder.svg"><a href="${file.name}/">${file.name}/</a></div>`;
          const mime = lookup(filepath) || "";
          if (mime.startsWith("audio/")) return `<div class="e"><audio src="${file.name}" controls></audio><div><a href="${file.name}" download>${file.name}</a></div></div>`;
          if (mime.startsWith("image/")) return `<div class="e"><img src="${file.name}" loading="lazy" class="display"><div><a href="${file.name}" download>${file.name}</a></div></div>`;
          if (mime.startsWith("video/")) return `<div class="e"><video src="${file.name}" controls></video><div><a href="${file.name}" download>${file.name}</a></div></div>`;
          return `<div class="e"><img class="icon" src="/.icons/${file.name.split(".").at(-1)}.svg"><a href="${file.name}" download>${file.name}</a></div>`;
        });
        res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${req.path}</title><link rel="stylesheet" href="/index.css"></head><body><div class="m">${e.join('')}</div></body></html>`);
      }]
    },
    {
      method: "use",
      args: ['express.static("files")']
    }
  ]
};