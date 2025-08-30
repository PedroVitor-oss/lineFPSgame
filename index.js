const { app,server,io} = require("./src/app");
const deashborad = require("./src/routes/Deashboard");
const game = require('./src/routes/Game');
const { port } = require("./config.json");

app.get("/",(req,res)=>{
    res.send("ok");
})

app.use("/deashboard",deashborad);
app.use("/game",game);
app.set("socketio", io);   

server.listen(port,console.log("aberto  em https://localhost:"+port));