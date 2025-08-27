import player from "../player.js";
// import { showToast } from "../toasts.js";
// import config from "../config.js";
import { writeToStdout } from "../stdout.js";

export default {
    aliases: ["drink", "hydrate", "water"],
    usages: ["drink"],
    description: "Drink some water.",
    exec(_commandString = "") {
        player.water_bar += 1;
        // showToast({
        //     color: config.palette.info_blue,
        //     title: "Drink",
        //     innerHTML: "You drank some water: " + player.water_bar,
        // });
        writeToStdout(`You drank some [BLUE]water[/BLUE]: [BOLD]${player.water_bar}[/BOLD]`);
    },
};
