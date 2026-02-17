import player from "../player.js";
import { showToast } from "../toasts.js";
import config from "../config.js";
import { writeToStdout } from "../stdout.js";

export default {
    aliases: ["grind"],
    usages: ["grind"],
    description: "Grind some items in your favourite RPG game.",
    exec(_commandString = "") {
        const now = Date.now();

        if (now < player.last_grind + 3000) {
            showToast({
                color: config.palette.warning_orange,
                title: "Grind - Rate limited",
                innerHTML: "You can only grind once per 3 seconds!",
            });
            return;
        }

        player.last_grind = Date.now();
        alert("todo")
    },
};
