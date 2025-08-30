const express = require('express');
const router = express.Router();
const { app, io } = require("../app");





router.get('/', (req, res, next) => {
    res.render("game");
    // res.send("Dashboard funcionando")
    // io.on("connection", (socket) => {
    //     console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    // });
   
});



module.exports = router;