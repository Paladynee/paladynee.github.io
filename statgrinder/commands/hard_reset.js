export default {
    aliases: ["hard_reset_caution"],
    usages: ["hard_reset_caution"],
    description: "Hard reset the game, wiping all progress. This action is irreversible.",
    exec(_commandString = "") {
        if (confirm("Are you sure you want to hard reset the game? This action is irreversible.")) {
            localStorage.removeItem("statgrinder_savefile");
            location.reload();
        }
    },
};
