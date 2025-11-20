import express from 'express';
export const name = "files";
export const subport = 1;
export const server = express()
    .use(express.static("files"));