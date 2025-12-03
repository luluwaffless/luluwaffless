import { normalize } from "node:path";
export default {
  name: "admin",
  subport: 80,
  methods: [
    {
      method: "use",
      args: ['express.static("admin")']
    },
    {
      method: "get",
      args: ["/logs", (_, res) => res.sendFile(normalize(`${import.meta.dirname}/../logs.log`))]
    },
    {
      method: "get",
      args: ["/flaggedIps", '(_, res) => res.json(flaggedIps)']
    },
    {
      method: "get",
      args: ["/blockedPaths", '(_, res) => res.json(blockedPaths)']
    }
  ]
};