import { displayTrimString, levenshtein, escapeHtml } from "./logic.js";
import config from "./config.js";
import { showToast } from "./toasts.js";
import { textbox } from "./dom.js";
import player from "./player.js";

const savefile = localStorage.getItem("statgrinder_savefile");
if (savefile) {
    try {
        const parsed = JSON.parse(savefile);
        if (parsed.config) {
            Object.assign(config, parsed.config);
        }
        if (parsed.player) {
            Object.assign(player, parsed.player);
        }
        let savedate = parsed.save_date ?? "unknown date";

        showToast({
            color: config.palette.success_green,
            title: "Load - Success",
            innerHTML: `Save file loaded successfully. Saved on <kbd>${escapeHtml(savedate)}</kbd>.`,
        });
    } catch (e) {
        console.error("Error loading save file:", e);
        showToast({
            color: config.palette.error_red,
            title: "Load - Failed",
            innerHTML: "Error loading save file. Please inspect <kbd>localStorage</kbd> for your save data.",
        });
        throw new Error();
    }
}

document.addEventListener("keydown", () => {
    textbox.focus();
});

textbox.addEventListener("keydown", function (e) {
    switch (e.key) {
        case "Tab":
            e.preventDefault();
            const currentValue = textbox.value;
            const cursorPosition = textbox.selectionStart;
            const searchterm = currentValue.slice(0, cursorPosition);
            const possibleCommands = [];

            for (const commandAlias of commandsStore.keys()) {
                // todo: pursue more advanced autocompletion later.
                if (commandAlias.startsWith(searchterm)) {
                    possibleCommands.push(commandAlias);
                }
            }

            if (possibleCommands.length === 1) {
                const completion = possibleCommands[0];
                textbox.value = completion + currentValue.slice(cursorPosition);
                textbox.selectionStart = textbox.selectionEnd = completion.length;
            }
            break;
        case "Enter":
            handleTerminalInput(textbox.value);
            textbox.value = "";
            e.preventDefault();
            break;
        case "ArrowUp":
            e.preventDefault();
            if (config.history.max_entries > 0) {
                const history = player.history;
                if (history.length > 0) {
                    // if there is already stuff in the textbox, we want to save it to the history so we can come back to it
                    // using down arrow.
                    if (player.history_index === -1 && textbox.value.trim().length > 0) {
                        player.history.push(textbox.value);
                        if (player.history.length > config.history.max_entries) {
                            player.history.shift();
                        }
                    }
                    const current_index = player.history_index;
                    const new_index = Math.min(current_index + 1, history.length - 1);
                    player.history_index = new_index;
                    textbox.value = history[history.length - 1 - new_index];
                }
            }
            break;
        case "ArrowDown":
            e.preventDefault();
            if (config.history.max_entries > 0) {
                const history = player.history;
                if (history.length > 0) {
                    const current_index = player.history_index;
                    const new_index = Math.max(current_index - 1, -1);
                    player.history_index = new_index;
                    if (new_index === -1) {
                        textbox.value = "";
                    } else {
                        textbox.value = history[history.length - 1 - new_index];
                    }
                }
            }
            break;
        default:
            break;
    }
});

/**
 * @type {Map<string, {aliases: string[], usages: string[], upgrades?: Upgrade[] description: string, exec: (commandString: string) => void}>}
 */
export const commandsStore = new Map();

import help from "./commands/help.js";
import drink from "./commands/drink.js";
import type_command from "./commands/type.js";
import set from "./commands/set.js";
import clear from "./commands/clear.js";
import save from "./commands/save.js";
import hard_reset from "./commands/hard_reset.js";
import history from "./commands/history.js";
import grind from "./commands/grind.js";
import upgrade from "./commands/upgrade.js";

for (const command of [help, drink, type_command, set, clear, save, hard_reset, history, grind, upgrade]) {
    for (const alias of command.aliases) {
        commandsStore.set(alias, command);
    }
}

function handleTerminalInput(input) {
    if (input.trim().length === 0) {
        return;
    }
    if (config.history.max_entries > 0) {
        // if the last history entry is the same as the current input, don't add it again.
        if (player.history.length === 0 || player.history[player.history.length - 1] !== input) {
            player.history.push(input);
        }
        if (player.history.length > config.history.max_entries) {
            player.history.shift();
        }
        player.history_index = -1;
    }
    const trimmed = input.trim();
    const processed = trimmed.split(/ +/g);
    const stem = processed[0];
    const query = commandsStore.get(stem.toLowerCase());

    if (!stem.length) {
        return;
    }

    if (query === undefined) {
        let innerHTML = `The command <kbd>${escapeHtml(displayTrimString(stem, config.toast.max_input_length_characters))}</kbd> does not exist!`;

        const commandSuggestionsArray = [];

        for (const commandAlias of commandsStore.keys()) {
            const distance = levenshtein(stem, commandAlias);
            if (distance <= config.toast.levenshtein_tolerance) {
                commandSuggestionsArray.push(commandAlias);
            }
        }

        if (commandSuggestionsArray.length) {
            const suggestionsHtml = commandSuggestionsArray.map((alias) => `<kbd>${escapeHtml(alias)}</kbd><br>`).join("");
            innerHTML += `<br><br>Did you mean:<ul>${suggestionsHtml}</ul>`;
        }

        showToast({
            color: config.palette.warning_orange,
            title: "Error",
            innerHTML,
        });
    } else {
        query.exec(trimmed);
    }
}
