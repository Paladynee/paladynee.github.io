export const CURRENCY_NULL = 0;
export const CURRENCY_WATER = 1;
export const CURRENCY_TEXT = 2;

export function currencyToString(currencyEnum = -1) {
    switch (currencyEnum) {
        case CURRENCY_NULL:
            return "null currency";
        case CURRENCY_WATER:
            return "water";
        case CURRENCY_TEXT:
            return "text";
        default:
            return "unknown";
    }
}
