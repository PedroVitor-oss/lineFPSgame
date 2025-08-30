const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
     res.render("game");
    // res.send("Dashboard funcionando")
});

module.exports = router;