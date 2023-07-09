/** @format */

let halt = false;

let player = {
    resources: {
        dollars: {
            amount: 1,
            generators: {
                amount: 0,
            },
        },
    },
    collectors: {},
    physics: {
        gravity: 50,
        friction: 0.5,
        lastWholeDollars: 1,
    },
    timers: {
        lastUpdate: Date.now(),
        lastPhysicsUpdate: performance.now(),
        lastSave: Date.now(),
        saveInterval: 5, // 5 seconds
        autoSave: false,
    },
    upgrades: {
        dollars: [
            {
                bought: false,
                effect: (generatedDollars) => generatedDollars ** 2,
                cost: 1000,
                description: "Gained dollars ^ 2, Cost: 1000 dollars",
            },
        ],
    },
};

// check if savefile exists
let data = localStorage.getItem("saveData");
if (data !== null) {
    try {
        let parsed = JSON.parse(atob(data));
        player = parsed;
    } catch {
        try {
            let backupData = JSON.parse(localStorage.getItem("saveDataOld"));
            let parsed = atob(backupData);
            player = parsed;
        } catch {
            console.error("COULD NOT PARSE EXISTING SAVE DATA, ABORTING!");
            halt = true;
        }
    }
}

let onScreenObjects = [];

let html = {
    display: document.getElementById("dollars_display"),
    buy: document.getElementById("dollars_buy"),
    canvas: document.querySelector("canvas"),
    upgrades: document.getElementById("upgrades"),
};

let costFunctions = {
    dollars: {
        generators: () => (player.resources.dollars.generators.amount * 2) ** (1 + player.resources.dollars.generators.amount / 1000) + 1,
    },
};

let saveButtons = {
    save: document.getElementById("save"),
    import: document.getElementById("import"),
    export: document.getElementById("export"),
    hardreset: document.getElementById("hardreset"),
};

saveButtons.save.onclick = () => saveGame(Date.now());
saveButtons.import.onclick = () => createObject();
saveButtons.export.onclick = () => saveGame(Date.now());
saveButtons.hardreset.onclick = () => {
    localStorage.clear();
    location.reload();
    console.log("HARD RESETTED THE GAME");
};

html.buy.onclick = () => handleBuy(0);

for (let index in player.upgrades.dollars) {
    let upgrade = player.upgrades.dollars[index];
    if (upgrade.bought) continue;
    let element = document.createElement("div");
    element.classList.add("upgrade");
    element.innerHTML = upgrade.description;
    element.onclick = () => handleUpgradeBuy(index, upgrade, element);
    html.upgrades.appendChild(element);
}

const ctx = html.canvas.getContext("2d");

function updateCanvasSize() {
    let heightRatio = innerHeight / html.canvas.height;
    let widthRatio = innerWidth / html.canvas.width;

    html.canvas.height = innerHeight;
    html.canvas.width = innerWidth;
    for (let object of onScreenObjects) {
        object.x *= widthRatio;
        object.y *= heightRatio;
        object.velx *= widthRatio;
        object.vely *= heightRatio;
    }
}

function draw() {
    // update displays
    updateDisplays();

    // update physics before drawing canvas content
    updatePhysics();

    // draw canvas content
    drawCanvas();
    requestAnimationFrame(draw);
}

function handleUpgradeBuy(index, upgradeInfo, element) {
    if (player.resources.dollars.amount >= upgradeInfo.cost) {
        player.resources.dollars.amount -= upgradeInfo.cost;
        player.upgrades.dollars[index].bought = true;
        html.upgrades.removeChild(element);
    }
}

function drawCanvas() {
    ctx.clearRect(0, 0, html.canvas.width, html.canvas.height);
    for (object of onScreenObjects) {
        ctx.fillStyle = "#00ff00";
        let boxsize = object.size;
        ctx.fillRect(object.x - boxsize / 2, object.y - boxsize / 2, boxsize, boxsize);
    }
}

function updatePhysics() {
    let now = performance.now();
    let deltaTime = (now - player.timers.lastPhysicsUpdate) / 1000;
    player.timers.lastPhysicsUpdate = now;

    onScreenObjects = onScreenObjects.filter((obj) => {
        if (obj.y > html.canvas.height) return false;
        return true;
    });

    for (let object of onScreenObjects) {
        object.velx = object.velx * player.physics.friction ** (deltaTime / 2);
        object.vely = (object.vely + (player.physics.gravity * deltaTime) / 2) * player.physics.friction ** (deltaTime / 2);
        object.x += object.velx;
        object.y += object.vely;
        object.velx = object.velx * player.physics.friction ** (deltaTime / 2);
        object.vely = (object.vely + (player.physics.gravity * deltaTime) / 2) * player.physics.friction ** (deltaTime / 2);
    }
}

function rand(domain) {
    return Math.random() * domain;
}

function randInt(domain) {
    return Math.floor(Math.random() * (domain + 1));
}

function createObject() {
    let newObj = {
        x: html.canvas.width / 2 + rand(100) - 50,
        y: html.canvas.height / 2 + rand(100) - 50,
        velx: rand(20) - 10, //TODO select random
        vely: -rand(20), //TODO select random,
        size: rand(14) + 2,
    };
    onScreenObjects.push(newObj);
}

function updateDisplays() {
    html.display.innerHTML = player.resources.dollars.amount.toFixed(2);
    html.buy.innerHTML = `purchase 1<br>cost: ${costFunctions.dollars.generators().toFixed(2)}`;
}

function updateGame() {
    // find deltaTime
    let now = Date.now();
    let deltaTime = (now - player.timers.lastUpdate) / 1000; // division by 1000 to convert into seconds from milliseconds

    player.timers.lastUpdate = now;

    // update resources
    let newResources = player.resources.dollars.generators.amount * deltaTime;

    player.upgrades.dollars.forEach((upg) => {
        if (upg.bought) {
            newResources = upg.effect(newResources);
        }
    });

    player.resources.dollars.amount += newResources;

    // make physic thing work
    let newDollars = Math.floor(player.resources.dollars.amount) - player.physics.lastWholeDollars;

    if (newDollars < 0) {
        player.physics.lastWholeDollars = Math.floor(player.resources.dollars.amount);
        newDollars = 1;
    }

    if (newDollars > 0) {
        if (newDollars > 50) newDollars = 50;
        for (let inc = 0; inc < newDollars; inc++) {
            createObject();
        }

        player.physics.lastWholeDollars = Math.floor(player.resources.dollars.amount);
    }

    // save game if long time has passed
    if (now > player.timers.lastSave + player.timers.saveInterval * 1000 && player.timers.autoSave) {
        saveGame(now);
    }
    // debug
    //console.log(costFunctions.dollars.generators());
}

function saveGame(now) {
    let oldSave = localStorage.getItem("saveData");
    localStorage.setItem("saveData", btoa(JSON.stringify(player)));
    localStorage.setItem("saveDataOld", oldSave);
    player.timers.lastSave = now;
    console.log("saved game at " + new Date());
}

function handleBuy(type) {
    switch (type) {
        case 0:
            // type: dollars generator
            let nextCost = costFunctions.dollars.generators();
            if (player.resources.dollars.amount >= nextCost) {
                player.resources.dollars.generators.amount += 1;
                player.resources.dollars.amount -= nextCost;
            }
            break;
        default:
            break;
    }
}

updateCanvasSize();
draw();

window.addEventListener("resize", updateCanvasSize);

// start game if everything went well

if (!halt) {
    let gameIntervalId = setInterval(updateGame, 25);
}
