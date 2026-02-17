import { commandsStore } from "../scripts.js";
import { showToast } from "../toasts.js";
import config from "../config.js";
import { displayTrimString, escapeHtml } from "../logic.js";

export default {
    aliases: ["help", "commands", "man"],
    usages: ["help", "help <command>"],
    description: "Display all available commands, their aliases, usages and descriptions, or learn about a specific command.",
    exec(commandString = "") {
        const [_stem, subcommand] = commandString.split(/ +/g);

        if (!subcommand) {
            showAllCommands();
        } else {
            specificCommand(subcommand.toLowerCase());
        }
    },
};

function showAllCommands() {
    const uniqueCommands = new Set(commandsStore.values());

    let html = "All available commands:<br><ul>";

    for (const command of uniqueCommands) {
        html += "<li>";
        for (let i = 0; i < command.aliases.length; i++) {
            html += `<kbd>${escapeHtml(command.aliases[i])}</kbd>`;
            if (i < command.aliases.length - 1) {
                html += ", ";
            }
        }

        html += ": ";
        html += escapeHtml(command.description);
        html += "<br>";
        html += `Usages:`;

        for (let i = 0; i < command.usages.length; i++) {
            html += `<kbd>${escapeHtml(command.usages[i])}</kbd>`;
            if (i < command.usages.length - 1) {
                html += ", ";
            }
        }

        html += "</li>";
        html += "<br>";
    }

    html += "</ul>";

    showToast({
        color: config.palette.info_blue,
        title: "Help - All Commands",
        innerHTML: html,
    });
}

function specificCommand(commandName = "") {
    const query = commandsStore.get(commandName);

    if (query === undefined) {
        return showToast({
            color: config.palette.warning_orange,
            title: "Help - Error",
            innerHTML: `The command <kbd>${escapeHtml(displayTrimString(commandName, config.toast.max_input_length_characters))}</kbd> does not exist!`,
        });
    }

    let html = `Details of command <kbd>${escapeHtml(commandName)}</kbd>:<br>`;

    if (query.aliases.length > 1) {
        html += "Aliases: <ul>";
        for (let i = 0; i < query.aliases.length; i++) {
            html += `<li><kbd>${escapeHtml(query.aliases[i])}</kbd></li>`;
        }
        html += "</ul>";
    }

    html += "<br>";
    html += "Description:<br><ul><li>";
    html += escapeHtml(query.description);
    html += "</li></ul><br>";
    html += "Usages: <ul>";

    for (let i = 0; i < query.usages.length; i++) {
        html += `<li><kbd>${escapeHtml(query.usages[i])}</kbd></li>`;
    }

    html += "</ul>";

    showToast({
        color: config.palette.info_blue,
        title: "Help - Command Details",
        innerHTML: html,
    });
}
