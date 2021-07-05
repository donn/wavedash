import axios from "axios";
import { Wavedash } from "../lib/wavedash.js";
import { g, n } from "../lib/tinydom.js";

import "./app.css";

const WAVEDASH_ID = "wavedash";

let query = location.search.slice(1).split("&").filter(p=> p).reduce(
    (dict, kv)=> {
        console.log(kv);
        let [key, value] = kv.split("=");
        dict[key] = value;
        return dict;
    }, {}
);

let loadedFile = null;
async function load() {
    if (!loadedFile) {
        return;
    }
    const reader = new FileReader();
    reader.onload = ((data)=> {
        let base64 = data.currentTarget.result.split(',')[1];
        let decoded = atob(base64);
        let wd = new Wavedash(WAVEDASH_ID, decoded);
        wd.attach();
    });
    reader.readAsDataURL(loadedFile);
}

async function main() {
    let app = g("#app");
    
    let topBar = n("div", e=> {
        e.className = "topbar";
        e.appendChild(n("h4", e=> {
            e.innerHTML = "Wavedash!";
        }));

        e.appendChild(n("button", e=> {
            e.innerHTML = "Open";
            let fakeInput = n("input", e=> {
                e.type = "file";
                e.onchange = (ev) => {
                    loadedFile = e.files[0];
                    load();
                }
                e.accept = ".vcd"
            }) ;
            e.onclick = () => {
                fakeInput.click();
            }
        }))

        e.appendChild(n("button", e=> {
            e.innerHTML = "Reload";
            e.onclick = () => {
                load();
            }
        }));
    });
    app.appendChild(topBar);

    app.appendChild(n("div", e=> {
        e.id = WAVEDASH_ID;
    }));

    if (query["load_url"]) {
        let res = await axios(query["load_url"]);
        let wd = new Wavedash(WAVEDASH_ID, res.data);
        wd.attach();
    }
    
}

main();