import { showToast } from "../toasts.js";
import config from "../config.js";
import { escapeHtml } from "../logic.js";

export default {
    aliases: ["set", "setting", "settings", "options", "option", "config", "configure"],
    usages: ["set", "set <option>", "set <option> <value>"],
    description: "Set a configuration option, or list all configuration options.",
    exec(commandString = "") {
        const [_stem, subcommand, ...args] = commandString.split(/ +/g);
        if (!subcommand) {
            listAllConfigs();
        } else if (args.length === 0) {
            getConfig(subcommand);
        } else {
            // original command written to the terminal because we don't want to modify the value portion
            setConfig(commandString);
        }
    },
};

function listAllConfigs() {
    function serialize(obj, prefix = "") {
        let result = [];
        for (const key in obj) {
            const value = obj[key];
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === "object" && value !== null) {
                result = result.concat(serialize(value, fullKey));
            } else {
                result.push(`<li><kbd>${escapeHtml(fullKey)}</kbd>: <kbd>${escapeHtml(String(value))}</kbd></li>`);
            }
        }
        return result;
    }
    const items = serialize(config).join("");
    const final = `<ul>${items}</ul>`;
    showToast({
        color: config.palette.info_blue,
        title: "Options - All Configurations",
        innerHTML: final,
    });
}

function getConfig(option) {
    const keys = option.split(".");
    let value = config;
    for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
            value = value[key];
        } else {
            return `Config option "<kbd>${escapeHtml(option)}</kbd>" not found.`;
        }
    }
    const final = `<kbd>${escapeHtml(option)}</kbd>: <kbd>${escapeHtml(String(value))}</kbd>`;
    showToast({
        color: config.palette.info_blue,
        title: "Options - Configuration Value",
        innerHTML: final,
    });
}

function setConfig(originalString) {
    const parts = originalString.split(/ +/g);
    if (parts.length < 3) {
        return "Usage: set <option> <value>";
    }
    const option = parts[1];
    const valueStr = parts.slice(2).join(" ");
    const keys = option.split(".");
    let obj = config;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) {
            return `Config option "<kbd>${escapeHtml(option)}</kbd>" not found.`;
        }
        obj = obj[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    if (!(lastKey in obj)) {
        return `Config option "<kbd>${escapeHtml(option)}</kbd>" not found.`;
    }
    let value = valueStr;
    if (!isNaN(Number(valueStr))) {
        value = Number(valueStr);
    }
    obj[lastKey] = value;
    showToast(`Set <kbd>${escapeHtml(option)}</kbd> to <kbd>${escapeHtml(String(value))}</kbd>`);
    const final = `<kbd>${escapeHtml(option)}</kbd> set to <kbd>${escapeHtml(String(value))}</kbd>`;
    showToast({
        color: config.palette.success_green,
        title: "Options - Configuration Set",
        innerHTML: final,
    });
}