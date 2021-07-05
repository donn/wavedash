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
       .topbar {
           display: none;
       }
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

ipcRenderer.on("update-vcd", (ev, vcd)=> {
    let { name, value } = vcd;
    window.setTitle(name);
    window.vcd = value;
    window.load();
})

window.addEventListener('DOMContentLoaded', tweaks);