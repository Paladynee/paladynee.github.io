import player from "../player.js";
import { writeToStdout } from "../stdout.js";
import { CURRENCY_TEXT } from "../currencies.js";
import { Upgrade } from "../upgrade.js";

export default {
    aliases: ["drink", "hydrate", "water"],
    usages: ["drink"],
    upgrades: [
        new Upgrade({
            name: "Bigger cups",
            description: "[ORANGE][BOLD]base[/BOLD][/ORANGE] water drank +1",
            currency_type: CURRENCY_TEXT,
            id: 1,
            effect() {
                return this.bought;
            },
            cost() {
                return 100;
            },
        }),
    ],
    description: "Drink some water.",
    exec(_commandString = "") {
        player.water_bar += this.upgrades[0].getEffect() + 1;
        writeToStdout(`You drank some [BLUE]water[/BLUE]: [BOLD]${player.water_bar}[/BOLD]`);
    },
};
