import init, { rsVector2, greet, GameState, GameObject } from "./pkg/hashnet_lib.js";
init().then(() => {
    globalThis.rsVector2 = rsVector2;
    globalThis.greet = greet;
    globalThis.GameState = GameState;
    globalThis.GameObject = GameObject;

    import("./helpers.js").then((modules) => {
        for (const key in modules) {
            globalThis[key] = modules[key];
        }

        import("./draw.js").then((modules) => {
            for (const key in modules) {
                globalThis[key] = modules[key];
            }
            import("./main.js");
        });
    });
});
