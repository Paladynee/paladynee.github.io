import { stdout } from "../dom.js";

export default {
    aliases: ["clear", "cls"],
    usages: ["clear"],
    description: "Clears the standard output.",
    exec(_commandString = "") {
        while (stdout.firstChild) {
            stdout.removeChild(stdout.firstChild);
        }
    },
};
