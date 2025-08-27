import { writeToStdout } from "../stdout.js";
import player from "../player.js";

export default {
    aliases: ["history"],
    usages: ["history"],
    description: "Shows the command history.",
    exec(_commandString = "") {
        writeToStdout(`Command history (most recent first, ${player.history.length} items):`);
        for (let i = 0; i < player.history.length; i++) {
            const index = player.history.length - 1 - i;
            writeToStdout(`[BOLD]${i + 1}[/BOLD]: [CODE]${player.history[index]}[/CODE]`);
        }
    },
};
