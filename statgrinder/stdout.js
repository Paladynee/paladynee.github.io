import { stdout } from "./dom.js";
import config from "./config.js";
import { escapeHtml } from "./logic.js";

const stdoutFormatMapping = {
    "[RED]": "<span style='color: red;'>",
    "[/RED]": "</span>",
    "[ORANGE]": "<span style='color: orange;'>",
    "[/ORANGE]": "</span>",
    "[YELLOW]": "<span style='color: yellow;'>",
    "[/YELLOW]": "</span>",
    "[GREEN]": "<span style='color: green;'>",
    "[/GREEN]": "</span>",
    "[BLUE]": "<span style='color: blue;'>",
    "[/BLUE]": "</span>",
    "[PURPLE]": "<span style='color: purple;'>",
    "[/PURPLE]": "</span>",

    "[BOLD]": "<strong>",
    "[/BOLD]": "</strong>",
    "[ITALIC]": "<em>",
    "[/ITALIC]": "</em>",
    "[UNDERLINE]": "<u>",
    "[/UNDERLINE]": "</u>",
    "[CODE]": "<kbd>",
    "[/CODE]": "</kbd>",

    "[BR]": "<br>",
};

export function writeToStdout(formattedText = "") {
    const line = document.createElement("div");
    line.classList.add("stdout-line");
    let innerHTML = escapeHtml(formattedText);
    for (const [key, value] of Object.entries(stdoutFormatMapping)) {
        innerHTML = innerHTML.split(key).join(value);
    }

    line.innerHTML = innerHTML;
    stdout.appendChild(line);
    while (stdout.children.length > config.stdout.max_lines) {
        stdout.removeChild(stdout.firstChild);
    }
    stdout.scrollTop = stdout.scrollHeight;
}
