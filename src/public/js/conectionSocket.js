const socket = io();
let finishGame = false;
let positionStarted;
const player = new Player("you", 176, 43);
let pontosp1 = 0;
let pontosp2 = 0;
let playersInGame = [];
let pointsControl = [];
socket.on("connect", () => {
    console.log("Conectado ao servidor com ID:", socket);
});

socket.on("setMydata", (data) => {
    //player
    player.x = data.player.x;
    player.y = data.player.y;
    player.name = data.player.name;
    player.surname = data.player.surname;
    player.group = data.player.group;
    //pontos
    pontosp1 = data.pontos.p1;
    pontosp2 = data.pontos.p2;
    //pointsCOntorler
    for (point of data.pointsControl) {
        pointsControl.push(new PointControl(point.id, point.x, point.y, point.borderColor, point.influenceBlue, point.influenceRed));
    }
    $(".placar .me h1").html(pontosp1)
    $(".placar .other h1").html(pontosp2);
    $(".info h2").text(`Player: ${player.name} - Group: ${player.group}`);

    positionStarted = { x: player.x, y: player.y };


})
socket.on("updatePointControl", (data) => {
    pointsControl = []
    for (point of data) {
        pointsControl.push(new PointControl(point.id, point.x, point.y, point.borderColor + 0.01, point.influenceBlue, point.influenceRed));
    }

})

socket.on("finishGame",(group)=>{
    finishGame = true;
    alert(`time ${group} ganhou`);
})

socket.on("newPlayer", (players) => {
    $("#player-list").html(`${players.length}`)
    //console.log("Jogadores atuais:", players);
    let updatelist = players.length != playersInGame.length;
    playersInGame = []
    for (p of players) {
        if (p.name != player.name) {
            let np = new Player(p.name, p.x, p.y);
            np.group = p.group;
            np.surname = p.surname;
            playersInGame.push(np);
        }
    }
    // let groupBlue = playersInGame.filter(p => p.group == 'blue');
    // let groupRed = playersInGame.filter(p => p.group == 'red');

    if (!updatelist) return;
    let groupBlue = [];
    let groupRed = [];
    if (player.group == "blue") {
        groupBlue.push(player);
    } else {
        groupRed.push(player);
    }
    for (let p of playersInGame) {
        if (p.group == 'blue') {
            groupBlue.push(p);
        } else {
            groupRed.push(p);
        }
    }

    $(".playes-list table tbody").html('')
    for (let i = 0; i < groupBlue.length; i++) {
        // console.log("add nome in list", playersInGame, groupBlue.length, groupRed.length)
        $(".playes-list table tbody").append(`
            <tr>
                <td>${groupBlue[i].surname ? groupBlue[i].surname : groupBlue[i].name}</td>
                <td>${groupRed[i] ? groupRed[i].surname ? groupRed[i].surname : groupRed[i].name : ''}</td>
            </tr>
        `);
    }

    // otherPlayers = players.filter(p => p.name !== "you");
});

socket.on("playerHit", (data) => {
    if (data.name === player.name) {
        // Aplica dano ao jogador
        player.health -= data.damage;

        $("span.hp").width(`${player.health}px`);
        $("body").append("<div class='damage-indicator'></div>");
        if (player.health <= 0) {
            // O jogador morreu
            socket.emit("playerDied", { group: player.group == 'blue' ? "red" : "blue" });
            player.health = 200;
            player.x = positionStarted.x;
            player.y = positionStarted.y;
        }
    }
})

socket.on("pontoFOR", (group) => {
    if (group == 'blue') {
        pontosp1++;
        $(".placar .me h1").html(pontosp1)
    } else {
        pontosp2++;
        $(".placar .other h1").html(pontosp2)
    }
})