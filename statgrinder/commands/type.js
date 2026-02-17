import player from "../player.js";
import { randomIntBetween, randomSelect } from "../logic.js";
import { writeToStdout } from "../stdout.js";

export default {
    aliases: ["type", "code", "hack", "text"],
    usages: ["type"],
    description: "Type some text.",
    exec(_commandString = "") {
        const letters_typed = randomIntBetween(1, 7);
        player.letters_typed += letters_typed;
        const noun = ["characters", "letters", "keystrokes", "symbols", "lines of code", "words"];
        writeToStdout(`You typed ${letters_typed} [BLUE]${randomSelect(noun)}[/BOLD].`);
    },
};
