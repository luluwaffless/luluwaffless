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
          if (file.isDirectory()) return `<a class="e" href="${file.name}/">${file.name}/</a>`;
          const mime = lookup(filepath) || "";
          if (mime.startsWith("audio/")) return `<a class="e" href="${file.name}"><audio src="${file.name}" controls></audio><div>${file.name}</div></a>`;
          if (mime.startsWith("image/")) return `<a class="e" href="${file.name}"><img src="${file.name}" loading="lazy"><div>${file.name}</div></a>`;
          if (mime.startsWith("video/")) return `<a class="e" href="${file.name}"><video src="${file.name}" controls></video><div>${file.name}</div></a>`;
          return `<a class="e" href="${file.name}"><div>${file.name}</div></a>`;
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