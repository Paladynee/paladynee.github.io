import config from "./config.js";
const toastContainer = document.querySelector(".toast-container");

export function showToast({ color = "#2d8cf0", title, innerHTML = "", image = null }) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.borderLeft = `6px solid ${color}`;

    let imgHtml = "";
    if (image) {
        imgHtml = `<img src="${image}" class="toast-img" alt="toast image" />`;
    }

    toast.innerHTML = `
        ${imgHtml}
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${innerHTML ? `<div class="toast-message">${innerHTML}</div>` : ""}
        </div>
        <button class="toast-close">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Slide down animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // --- Guess removal time based on title + message lengths ---
    const totalLength = (title ? title.length : 0) + (innerHTML ? innerHTML.length : 0);
    let removalTime = config.toast.base_duration_seconds * 1000 + totalLength * config.toast.duration_milliseconds_added_per_character;
    removalTime = Math.min(removalTime, 8000);

    // Remove toast after calculated time or on close
    const removeToast = () => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    };
    toast.querySelector(".toast-close").onclick = removeToast;
    setTimeout(removeToast, removalTime);
}
