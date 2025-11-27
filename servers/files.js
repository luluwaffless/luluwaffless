import express from 'express';
export default {
  name: "files",
  subport: 1,
  methods: [
    {
      method: "use",
      args: [express.static("files")]
    }
  ]
};