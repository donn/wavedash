import { fromSignal, ruler } from "./svg";
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
        this.config.endTime = endtime;
        this.domElement.innerHTML = "";
        let table = n("table", e=> {
            e.className = "wavedash";
            e.appendChild(n("tr", e=> {
                e.appendChild(n("th", e=> {
                    e.className = "header";
                    e.appendChild(n("div", e=> {
                        e.className = "wavedash_cell";
                        e.innerHTML = "Time";
                    }));
                }))
                e.appendChild(n("th", e=> {
                    e.className = "column-header";
                    e.appendChild(n("div", e=> {
                        e.className = "wavedash_cell";
                        e.innerHTML = ruler(this.config);
                    }));
                    e.style = "background-color: #FFFDD0;"
                }))
            }))
            for (let signal of signals) {
                e.appendChild(n("tr", e=> {
                    e.appendChild(n("th", e=> {
                        e.className = "row-header";
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash_cell";
                            e.innerHTML = signal.signalName;
                        }));
                    }));
                    
                    e.appendChild(n("td", e=> {
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash_cell";
                            e.innerHTML = fromSignal(signal, this.config);
                        }));
                    }));
                }));        
            }

        });

        this.domElement.appendChild(table);
        
    }
    
}

window.Wavedash = Wavedash;