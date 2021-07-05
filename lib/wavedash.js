import { fromSignal } from "./svg";
import VCDParser from "cloudv-vcd-parser";

import { g, n } from "./tinydom.js";
import "./wavedash.css";

export class Wavedash {
    constructor(domElementId, vcd, config={}) {
        this.domElementId = domElementId;
        this.vcd = vcd;
        this.config = config;

        this.domElement = g("#" + domElementId);
    }

    async attach() {
        this.parsed = await VCDParser.parse(this.vcd);
        let { signal: signals, endtime } = this.parsed;
        this.domElement.innerHTML = "";
        let table = n("table", e=> {
            e.className = "wavedash";
            for (let signal of signals) {
                e.appendChild(n("tr", e=> {
                    e.appendChild(n("th", e=> {
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash_cell";
                            e.innerHTML = signal.signalName;
                        }));
                    }));
                    
                    e.appendChild(n("td", e=> {
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash_cell";
                            e.innerHTML = fromSignal(signal, endtime, this.config);
                        }));
                    }));
                }));        
            }

        });

        this.domElement.appendChild(table);
        
    }
    
}

window.Wavedash = Wavedash;