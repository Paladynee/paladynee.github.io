import player from "../player.js";
import config from "../config.js";
import { showToast } from "../toasts.js";

export default {
    aliases: ["save"],
    usages: ["save"],
    description: "Save the game.",
    exec(_commandString = "") {
        // use localstorage to store config and player.

        const all_data = {
            config,
            player,
            save_date: new Date().toISOString(),
        };

        localStorage.setItem("statgrinder_savefile", JSON.stringify(all_data));

        showToast({
            color: config.palette.success_green,
            title: "Save",
            innerHTML: "Game saved successfully.",
        });
    },
};
