const { app, server, io } = require("./src/app");
const deashborad = require("./src/routes/Deashboard");
const game = require('./src/routes/Game');
const { port } = require("./config.json");

let positionSpaw = [{ x: 179, y: 42 }, { x: 220, y: 381 }]
let pontos = {p1:0,p2:0};
let players = [
];
class Player {
    constructor(name, x, y) {
        this.name = name;
        this.grounp = 'default';
        this.x = x;
        this.y = y;
        this.size = 5
        this.a = 0;//angle
        this.speed = 1;
        this.coliders = [];
    }
}
app.get("/", (req, res) => {
    res.send("ok");
})

app.use("/deashboard", deashborad);
app.use("/game", game);
// app.set("socketio", io);   

io.on("connection", (socket) => {

    // Criação do jogador
    let positionId = Math.floor(players.length+1 / positionSpaw.length)
    socket.player = new Player("player" + socket.id, positionSpaw[positionId].x, positionSpaw[positionId].y);
    socket.player.group = positionId%2==0?"blue":"red";
    players.push(socket.player);
    socket.emit("setMydata", socket.player);
    io.emit("newPlayer", players);
    console.log("Novo cliente conectado:", socket.id);

    //player se movel
    socket.on("playerMovement", (data) => {
        if (socket.player) {
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.player.a = data.a;
            io.emit("newPlayer", players);
        }
    });

    socket.on("playerShot", (data) => {
        let nameplayer = data.target;

        io.emit("playerHit", { name: nameplayer, damage: 10 });
    })
    socket.on("playerDied",(data)=>{
        io.emit("pontoFOR",data.group)
    })

    //desconectar
    socket.on("disconnect", () => {
        players = players.filter(p => p !== socket.player);
        console.log("Cliente desconectado:", socket.id);
        io.emit("newPlayer", players);
        // io.emit aqui não faz sentido, pois o socket já está desconectado
    });
});



server.listen(port, console.log("aberto  em https://localhost:" + port));