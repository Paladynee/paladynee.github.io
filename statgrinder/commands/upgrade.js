import { Upgrade } from "../upgrade.js";
import { commandsStore } from "../scripts.js";
import { showToast } from "../toasts.js";
import { writeToStdout } from "../stdout.js";
import config from "../config.js";
import { escapeHtml, displayTrimString } from "../logic.js";

export default {
    aliases: ["upgrade", "up", "enhance"],
    usages: ["upgrade <command>", "upgrade <command> <upgrade id>"],
    description: "Query all upgrades of a command, or purchase an upgrade for a command.",
    exec(commandString = "") {
        const [_stem, ...args] = commandString.split(/ +/g);

        if (args.length === 0) {
            showToast({
                title: "Upgrade - Insufficient Arguments",
                color: config.palette.warning_orange,
                innerHTML: "Please specify a command to query the upgrades for.",
            });
        } else if (args.length === 1) {
            queryUpgrades(args[0]);
        } else if (args.length === 2) {
            purchaseUpgrade(args[0], args[1]);
        }
    },
};

function queryUpgrades(commandAlias) {
    const query = commandsStore.get(commandAlias.toLowerCase());

    if (query === undefined) {
        return showToast({
            color: config.palette.warning_orange,
            title: "Upgrade - Command Not Found",
            innerHTML: `The command <kbd>${escapeHtml(displayTrimString(commandAlias, config.toast.max_input_length_characters))}</kbd> does not exist!`,
        });
    } else {
        if (query.upgrades?.length) {
            writeToStdout(`Available upgrades for command [CODE]${commandAlias}[/CODE]:`);
            query.upgrades.forEach((upgrade) => {
                writeToStdout(` - [CODE]${upgrade.id}[/CODE]: [BOLD][AQUA]${upgrade.name}[/AQUA][/BOLD], [ITALIC]${upgrade.description}[/ITALIC]`);
            });
        } else {
            writeToStdout(`No upgrades available for command [CODE]${commandAlias}[/CODE].`);
        }
    }
}

function purchaseUpgrade(commandAlias, upgradeId) {
    // todo!
}
