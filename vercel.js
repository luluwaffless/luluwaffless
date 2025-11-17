import express from 'express';
express().use(/.*/, (req, res) => res.redirect(`https://luluwaffless.xyz${req.path}`)).listen(process.env.PORT || 80);