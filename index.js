const { app, server, io } = require("./src/app");
const deashborad = require("./src/routes/Deashboard");
const game = require('./src/routes/Game');
const { port } = require("./config.json");


class Player {
    constructor(name, x, y) {
        this.name = name;
        this.surname = "null"
        this.grounp = 'default';
        this.x = x;
        this.y = y;
        this.size = 5
        this.a = 0;//angle
        this.speed = 1;
        this.coliders = [];
    }
}
class PointControl {
    constructor(id, x, y) {
        this.id = id;

        this.x = x;
        this.y = y;

        this.influenceBlue = 0;
        this.influenceRed = 0;

    }
}

let positionSpaw = [{ x: 179, y: 42 }, { x: 220, y: 381 }]
let pontos = { p1: 0, p2: 0 };
let players = [];
let surnames = ["Kaiser", "Noa", "christian", "Alex", "Jordan", "Taylor"];
let pointsControl = [new PointControl("point1", 64, 100), new PointControl("point2", 110, 182), new PointControl("point3", 317, 139), new PointControl("point4", 226, 244), new PointControl("point5", 48, 291), new PointControl("point6", 327, 303)];

app.get("/", (req, res) => {
    res.render("dashboard", {
        numPlayer: players.length
    })
})

app.use("/deashboard", deashborad);
app.use("/game", game);
// app.set("socketio", io);   

io.on("connection", (socket) => {

    // Criação do jogador
    let positionId = players.length%2;
    socket.player = new Player("player" + socket.id, positionSpaw[positionId].x, positionSpaw[positionId].y);
    socket.player.group = positionId % 2 == 0 ? "blue" : "red";
    socket.player.surname = surnames[Math.floor(Math.random() * surnames.length)];
    players.push(socket.player);
    socket.emit("setMydata", {
        player: socket.player,
        pointsControl: pointsControl,
        pontos: pontos
    });
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
    socket.on("playerDied", (data) => {
        io.emit("pontoFOR", data.group)
    })
    socket.on("canIwin", (data) => {
        let quantIwinn = 0;
        for (let p of data) {
            if (socket.player.group == "blue") {
                if (p.influenceBlue > 90) {
                    quantIwinn++;
                }
            } else {
                if (p.influenceRed > 90) {
                    quantIwinn++;
                }
            }
            // console.log("pointsControl",pointsControl);
        }
        if (quantIwinn >= 5) {
            console.log("alguem ganhou");
            io.emit("finishGame", socket.player.group);
        }
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