import { CURRENCY_NULL } from "./currencies.js";

export class Upgrade {
    constructor({ id, name = "Default Upgrade", description = "", multipurchase = 1, bought = 0, currency_type, effect, cost }) {
        if (id === undefined) {
            throw new Error("internal error: all upgrades must have an id");
        }
        if (currency_type === CURRENCY_NULL || currency_type === undefined) {
            throw new Error("internal error: all upgrades must have a valid currency type");
        }
        if (effect === undefined || typeof effect !== "function") {
            throw new Error("internal error: effect is the getter function of the upgrade, all upgrades must have one");
        }
        if (cost === undefined || typeof cost !== "function") {
            throw new Error("internal error: all upgrades must have a cost function");
        }
        this.getEffect = effect.bind(this);
        this.getCost = cost.bind(this);
        this.id = id;
        this.name = name;
        this.description = description;
        this.bought = bought;
        this.multipurchase = multipurchase;
        this.currency_type = currency_type;
    }

    isPurchased() {
        return this.bought !== 0;
    }
}
