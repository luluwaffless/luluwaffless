import express from 'express';
import axios from 'axios';
import cors from 'cors';
const port = process.env.PORT || 80;
const handleRequest = async (axiosCall, res) => {
    try {
        const response = await axiosCall();
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    };
};
express()
    .use(cors())
    .use(express.static('public'))
    .use(express.json())
    .post('/users', async (req, res) => await handleRequest(() => axios.post('https://users.roblox.com/v1/usernames/users', req.body), res))
    .get('/thumbnail', async (req, res) => await handleRequest(() => axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${req.query.id}&size=720x720&format=png`), res))
    .get('/badges/:id', async (req, res) => await handleRequest(() => axios.get(`https://badges.roblox.com/v1/badges/${req.params.id}`), res))
    .get('/dates/:id', async (req, res) => await handleRequest(() => axios.get(`https://badges.roblox.com/v1/users/${req.params.id}/badges/awarded-dates?badgeIds=${req.query.ids}`), res))
    .listen(port, () => console.log(`http://localhost${port !== 80 ? `:${port}` : ''}`));