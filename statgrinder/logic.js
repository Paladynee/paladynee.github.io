export function displayTrimString(string, length) {
    if (string.length <= length) return string;
    return string.slice(0, length - 3) + "...";
}

export function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const m = a.length;
    const n = b.length;
    const dp = new Array(n + 1);

    for (let j = 0; j <= n; j++) dp[j] = j;

    for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
            const temp = dp[j];
            dp[j] = Math.min(
                dp[j] + 1, // deletion
                dp[j - 1] + 1, // insertion
                prev + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
            );
            prev = temp;
        }
    }
    return dp[n];
}

export function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            default:
                return match;
        }
    });
}

export function countReadableCharactersInHtmlString(html = "") {
    return html.replace(/<[^>]*>/g, "").length;
}

export function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloatBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomSelect(array) {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}
