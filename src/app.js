import axios from "axios";
import { Wavedash } from "../lib/wavedash.js";
import { g, n } from "../lib/tinydom.js";

import "./app.css";

const WAVEDASH_ID = "wavedash";

const query = location.search.slice(1).split("&").filter(p=> p).reduce(
    (dict, kv)=> {
        console.log(kv);
        let [key, value] = kv.split("=");
        dict[key] = value;
        return dict;
    }, {}
);

window.vcd = null;
window.setTitle = function(file) {
    document.title = `${file} - Wavedash`;
}
window.load = async function() {
    if (!window.vcd) {
        return;
    }
    let wd = new Wavedash(WAVEDASH_ID, window.vcd);
    wd.attach();
}

window.fakeInput = n("input", e=> {
    e.type = "file";
    e.onchange = (ev) => {
        window.currentFile = e.files[0];
        const reader = new FileReader();
        reader.onload = ((data)=> {
            let base64 = data.currentTarget.result.split(',')[1];
            let decoded = atob(base64);
            window.vcd = decoded;
            load();
        });
        reader.readAsDataURL(window.currentFile);
    }
    e.accept = ".vcd"
}) ;


async function main() {
    let app = g("#app");
    
    let topBar = n("div", e=> {
        e.className = "topbar";
        e.appendChild(n("h4", e=> {
            e.innerHTML = "Wavedash!";
        }));

        e.appendChild(n("button", e=> {
            e.innerHTML = "Open";
            
            e.onclick = () => {
                window.fakeInput.click();
            }
        }))

        // e.appendChild(n("button", e=> {
        //     e.innerHTML = "Reload";
        //     e.onclick = () => {
        //         load();
        //     }
        // }));
    });
    app.appendChild(topBar);

    app.appendChild(n("div", e=> {
        e.id = WAVEDASH_ID;
        e.appendChild(n("h4", e=> {
            e.innerHTML = "No waveform loaded.";
            e.style = "margin-left: 1em;";
        }));
    }));

    if (query["load_url"]) {
        let res = await axios(query["load_url"]);
        window.vcd = res.data;
        window.load();
    }
    
}

main();
