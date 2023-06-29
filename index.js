let player = {
    pos: [0, 0],
    moneys: {
        paper: 0,
    },
    shop: {
        paper: [10],
    },
    paperLimit: 100,
};

let playfield = { papers: [], circles: [] };

let shopDetails = {
    paper: {
        upgrades: [
            {
                index: 0,
                name: "better this",
                description: "does this does that",
                costFunction: (amount) => 30 * amount + 30,
            },
        ],
    },
};

let sprites = [];
let playerSprites = [];
function loadSprites() {
    //let spritePaths = ["./sprites/player.png", "./sprites/sprite1.png", "./sprites/sprite2.png", "./sprites/sprite3.png", "./sprites/sprite4.png", "./sprites/sprite5.png", "./sprites/sprite6.png", "./sprites/sprite7.png", "./sprites/sprite8.png", "./sprites/sprite9.png", "./sprites/sprite10.png"];
    let spritePaths = ["./sprites/player.png"]

    for (let i = 1; i < 11; i++) {
        let element = "./sprites/sprite"
        element = element.concat(i).concat(".png")
        spritePaths.push(element)
    }

    let loadedSprites = 0;

    // Load each sprite image
    for (let i = 0; i < spritePaths.length; i++) {

        let sprite = new Image();

        sprite.onload = () => {
            loadedSprites++;
            //check if all sprites have been loaded
            if (loadedSprites === spritePaths.length) loadGame();

        };

        sprite.src = spritePaths[i];

        if (spritePaths[i] === "./sprites/player.png") {
            playerSprites.push(sprite);
        } else {
            sprites.push(sprite);
        }
    }
}

function handlePaperRemoval(type) {
    switch (type) {
        case 0:
            console.log("debug paper removed.");
            break;
        case 1:
            player.moneys.paper += 1;
            break;
        default:
            console.log("invalid type: " + type);
            break;
    }
}

function random(domain) {
    return Math.random() * domain
}

function roundRand(domain) {
    return Math.round(random(domain));
}

function floorRand(domain) {
    return Math.floor(random(domain));
}

function spawnPapers(amount, type, dev = false) {

    if (!dev) {
        // check paper limit amount
        const currentPapers = playfield.papers.length;
        const freeSpace = player.paperLimit - currentPapers;

        if (freeSpace <= 0) return;
        if (currentPapers + amount > player.paperLimit) {
            amount = freeSpace;
        }
    }

    const newPapers = {
        pos: [30 + roundRand(1220), 30 + roundRand(660)],
        type: type,
        vel: [0, 0],
        sprite: sprites[floorRand(sprites.length)],
    }

    for (let i = 0; i < amount; i++) playfield.papers.push(newPapers);

}

function draw(canvas, ctx, updateGame) {

    const drawPapers = () => {
        for (let paper of playfield.papers) {
            let pos = paper.pos;
            ctx.drawImage(paper.sprite, 0, 0, 16, 16, pos[0] - 8, pos[1] - 8, 32, 32);
        }
    }

    const drawCircles = () => {

        for (let circle of playfield.circles) {
            let [x, y] = circle.pos;
            let time = (Date.now() - circle.start) / 1000 / circle.interval;
            let radians = (time % 1) * (2 * Math.PI);

            let offsetX = Math.sin(radians) * circle.radius;
            let offsetY = Math.cos(radians) * circle.radius;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 3, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, circle.radius, 0, 2 * Math.PI, true);
            ctx.stroke();
        }
    }

    const drawPlayer = () => ctx.drawImage(playerSprites[0], 0, 0, 64, 64, player.pos[0] - 32, player.pos[1] - 32, 64, 64);
    

    // update logic
    updateGame();
    // clear old shit
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // redraw
    drawPapers()
    drawCircles()
    drawPlayer()

    let display = document.getElementById("primaryDisplay");
    display.innerHTML = "Money: " + player.moneys.paper;
    requestAnimationFrame(draw);
}

function loadGame() {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1280;
    canvas.height = 720;

    let held = false;

    draw(canvas, ctx, updateGame);

    function updateGame() {
        let repelFactor = 1;
        let repelRad = document.getElementById("repelRadRange").value;
        let frictionFactor = 0.93;
        let frictionThreshold = 0.025;
        let roundingFactor = 10;
        //frictionRoundingFactorFactor
        let frff = 100;

        // spawn continuous stream of papers while held
        if (held) {
            spawnPapers(10 ** (document.getElementById("devPaperSpawnRange").value / 100), 1, true);
        }

        // remove papers offscreen
        playfield.papers = playfield.papers.filter((paper) => {
            let [x, y] = paper.pos;
            if (x < -5 || x > 1285 || y < -5 || y > 725) {
                handlePaperRemoval(paper.type);
                return false;
            }

            let dx = x - player.pos[0];
            let dy = y - player.pos[1];

            let dist = Math.hypot(dx, dy);
            const doVelMagik = (toBeMagikd) => Math.floor(toBeMagikd * roundingFactor * frictionFactor * frff) / roundingFactor / frff;
            const doPosMagik = (toBeMagikd) => Math.round(toBeMagikd * roundingFactor + paper.vel[0] * roundingFactor) / roundingFactor;
            
            // magic math
            paper.vel[0] = doVelMagik(paper.vel[0])
            paper.vel[1] = doVelMagik(paper.vel[1])
            paper.pos[0] = doPosMagik(paper.pos[0])
            paper.pos[1] = doPosMagik(paper.pos[1])

            if (dist <= repelRad) {
                // Calculate repulsion force based on distance
                let randomForceOffsetFactor = (roundRand(50) + 55) / 100;
                let force = ((repelRad - dist) / repelRad) * repelFactor * randomForceOffsetFactor;

                // Apply repulsion force in the direction away from the player
                paper.vel[0] += (dx / dist) * force;
                paper.vel[1] += (dy / dist) * force;
            } else {
                const clamp = (wutIsBeingKlampd) => (Math.abs(wutIsBeingKlampd) < frictionThreshold) ? 0 : wutIsBeingKlampd
                paper.vel[0] = clamp(paper.vel[0])
                paper.vel[1] = clamp(paper.vel[1])
            }

            return true;
        });
    }

    window.addEventListener("keypress", (event) => {
        let key = event.key;
        switch (key) {
            case "p":
                spawnPapers(10 ** (document.getElementById("devPaperSpawnRange").value / 100), 1, true);
                break;
            case "l":
                playfield.papers = [];
                break;
            case "q":
                playfield.circles.push({
                    start: Date.now(),
                    pos: [640, 360],
                    radius: document.getElementById("circleRadiusInput").value,
                    interval: document.getElementById("circleIntervalInput").value
                });
                break;
            default:
                break;
        }
    });

    canvas.addEventListener("mousedown", (event) => {
        held = true;
    });

    canvas.addEventListener("mouseup", (event) => {
        held = false;
    });

    // interval ID
    let gameLoop = setInterval(loopFunc, 100);

    let counters = [
        {
            id: "paperspawn",
            every: 4,
            counter: 0,
            func: () => {
                spawnPapers(10, 1);
            },
        },
    ];

    function loopFunc() {
        counters.forEach((x) => {
            if (x.every === x.counter) {
                x.counter = 0;
                x.func();
            }

            x.counter = x.counter + 1;
        });
    }

    window.addEventListener("mousemove", (event) => {
        const canvasLocation = canvas.getBoundingClientRect();
        let x = Math.floor(event.x - canvasLocation.x);
        let y = Math.floor(event.y - canvasLocation.y);

        // borders
        if (x < 0) x = 0;
        if (x > 1280) x = 1280;
        if (y < 0) y = 0;
        if (y > 720) y = 720;

        player.pos = [x, y];
    });
}

window.addEventListener("load", loadSprites);

const windowDiv = document.querySelector(".floating-window");
const topBar = windowDiv.querySelector(".top-bar");
let isDragging = false;
let offset = { x: 0, y: 0 };

topBar.addEventListener("mousedown", startDrag);
topBar.addEventListener("mouseup", stopDrag);

function startDrag(e) {
    isDragging = true;
    offset.x = e.clientX - windowDiv.offsetLeft;
    offset.y = e.clientY - windowDiv.offsetTop;
}

function stopDrag() {
    isDragging = false;
}

window.addEventListener("mousemove", dragWindow);

function dragWindow(e) {
    if (!isDragging) return;
    windowDiv.style.left = e.clientX - offset.x + "px";
    windowDiv.style.top = e.clientY - offset.y + "px";
}
