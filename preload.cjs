const { ipcRenderer } = require("electron");

const macOS = process.platform == "darwin";

function tweaks() {
    // CSS
    let style = document.createElement("style");

    style.innerHTML = `
        /*
        .topbar > button {
            display: none;
        }
        */
    `;
    if (macOS) {
        // Account for inset toolbar
        style.innerHTML += `
            .topbar > h4 {
                margin-left: 64px;
            }
        `;
    }

    document.querySelector("head").appendChild(style);

}

ipcRenderer.on("reload-pressed", ()=> {
    window.load();
})

ipcRenderer.on("open-pressed", ()=> {
    window.fakeInput.click();
})

window.addEventListener('DOMContentLoaded', tweaks);