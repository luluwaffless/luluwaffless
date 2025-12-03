import axios from "axios";
const handleRequest = async (axiosCall, res) => {
  try {
    const response = await axiosCall();
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  };
};
export default {
  name: "pages",
  subport: 0,
  methods: [
    {
      method: "use",
      args: ['express.json()']
    },
    {
      method: "use",
      args: ['express.static("pages")']
    },
    {
      method: "post",
      args: ["/users", async (req, res) => await handleRequest(() => axios.post("https://users.roblox.com/v1/usernames/users", req.body), res)]
    },
    {
      method: "get",
      args: ["/thumbnail", async (req, res) => await handleRequest(() => axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${req.query.id}&size=720x720&format=png`), res)]
    },
    {
      method: "get",
      args: ["/badges/:id", async (req, res) => await handleRequest(() => axios.get(`https://badges.roblox.com/v1/badges/${req.params.id}`), res)]
    },
    {
      method: "get",
      args: ["/dates/:id", async (req, res) => await handleRequest(() => axios.get(`https://badges.roblox.com/v1/users/${req.params.id}/badges/awarded-dates?badgeIds=${req.query.ids}`), res)]
    },
    {
      method: "use",
      args: ["/r", (req, res, next) => {
        if (req.query.url) res.redirect(req.query.url);
        else next();
      }]
    }
  ]
};