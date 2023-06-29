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
function load1() {
    let spritePaths = ["./sprites/player.png", "./sprites/sprite1.png", "./sprites/sprite2.png", "./sprites/sprite3.png", "./sprites/sprite4.png", "./sprites/sprite5.png", "./sprites/sprite6.png", "./sprites/sprite7.png", "./sprites/sprite8.png", "./sprites/sprite9.png", "./sprites/sprite10.png"];

    let loadedSprites = 0;

    // Function to check if all sprites have been loaded
    function checkAllSpritesLoaded() {
        if (loadedSprites === spritePaths.length) {
            load2();
        }
    }

    // Load each sprite image
    for (let i = 0; i < spritePaths.length; i++) {
        let sprite = new Image();
        sprite.onload = function () {
            loadedSprites++;
            checkAllSpritesLoaded();
        };
        sprite.src = spritePaths[i];
        if (spritePaths[i] === "./sprites/player.png") {
            playerSprites.push(sprite);
        } else {
            sprites.push(sprite);
        }
    }
}

function rand(domain) {
    return Math.round(Math.random() * domain);
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

function randFloor(domain) {
    return Math.floor(Math.random() * domain);
}

function spawnPapers(amount, type, dev) {
    if (!dev) {
        // check paper limit amount
        let current = playfield.papers.length;
        let freeSpace = player.paperLimit - current;
        if (freeSpace <= 0) return;
        if (current + amount > player.paperLimit) {
            amount = player.paperLimit - current;
        }
    }
    for (let i = 0; i < amount; i++)
        playfield.papers.push({
            pos: [30 + rand(1220), 30 + rand(660)],
            type: type,
            vel: [0, 0],
            sprite: sprites[randFloor(sprites.length)],
        });
}

function load2() {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = 720;
    canvas.width = 1280;

    let held = false;

    function draw() {
        // update the game
        updateGame();
        // clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // draw papers
        for (let paper of playfield.papers) {
            let pos = paper.pos;
            ctx.drawImage(paper.sprite, 0, 0, 16, 16, pos[0] - 8, pos[1] - 8, 32, 32);
        }
        // draw circles

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

        // draw player
        ctx.drawImage(playerSprites[0], 0, 0, 64, 64, player.pos[0] - 32, player.pos[1] - 32, 64, 64);
        let display = document.getElementById("primaryDisplay");
        display.innerHTML = "Money: " + player.moneys.paper;
        requestAnimationFrame(draw);
    }

    draw();

    function spawnCircle(timestamp, pos, radius, interval) {
        playfield.circles.push({ start: timestamp, pos: pos, radius: radius, interval: interval });
    }

    function updateGame() {
        let repelFactor = 1;
        let repelRad = document.getElementById("repelRadRange").value;
        let frictionFactor = 0.93;
        let frictionThreshold = 0.025;
        let roundingFactor = 10;
        let frictionRoundingFactorFactor = 100;

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

            paper.vel[0] = Math.floor(paper.vel[0] * roundingFactor * frictionFactor * frictionRoundingFactorFactor) / roundingFactor / frictionRoundingFactorFactor;
            paper.vel[1] = Math.floor(paper.vel[1] * roundingFactor * frictionFactor * frictionRoundingFactorFactor) / roundingFactor / frictionRoundingFactorFactor;

            paper.pos[0] = Math.round(paper.pos[0] * roundingFactor + paper.vel[0] * roundingFactor) / roundingFactor;
            paper.pos[1] = Math.round(paper.pos[1] * roundingFactor + paper.vel[1] * roundingFactor) / roundingFactor;

            if (dist <= repelRad) {
                // Calculate repulsion force based on distance
                let randomForceOffsetFactor = (rand(50) + 55) / 100;
                let force = ((repelRad - dist) / repelRad) * repelFactor * randomForceOffsetFactor;

                // Apply repulsion force in the direction away from the player
                paper.vel[0] += (dx / dist) * force;
                paper.vel[1] += (dy / dist) * force;
            } else {
                if (Math.abs(paper.vel[0]) < frictionThreshold) paper.vel[0] = 0;
                if (Math.abs(paper.vel[1]) < frictionThreshold) paper.vel[1] = 0;
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
                spawnCircle(Date.now(), [640, 360], document.getElementById("circleRadiusInput").value, document.getElementById("circleIntervalInput").value);
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

    let gameLoop = setInterval(loopFunc, 100);

    let counters = [
        {
            id: "paperspawn",
            every: 4,
            counter: 0,
            func: () => {
                spawnPapers(10, 1, false);
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
        if (x < 0) x = 0;
        if (x > 1280) x = 1280;
        if (y < 0) y = 0;
        if (y > 720) y = 720;
        player.pos = [x, y];
    });
}

window.addEventListener("load", load1);

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
