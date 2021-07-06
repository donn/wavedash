import { defaultConfig, normalizeConfig, fromSignal, ruler } from "./svg";
import VCDParser from "cloudv-vcd-parser";

import { g, n } from "./tinydom.js";
import "./wavedash.css";

export class Wavedash {
    constructor(domElementId, vcd, config={}) {
        this.domElementId = domElementId;
        this.vcd = vcd;
        this.config = normalizeConfig(config);

        this.domElement = g("#" + domElementId);
    }

    async vcdParsed() {
        if (this._vcdParsed) {
            return this._vcdParsed;
        }

        this._vcdParsed = await VCDParser.parse(this.vcd);
        return this._vcdParsed;
    }

    async render() {
        this.parsed = await this.vcdParsed();
        let { signal: signals, endtime } = this.parsed;
        this.config.endTime = endtime;

        this.domElement.innerHTML = "";

        this.svgOCListeners = [];
        let svgOnClick = ev=> {
            let svg = ev.target;
            while (svg.nodeName.toLowerCase() != "svg") {
                console.log(svg.nodeName, svg.parentElement);
                svg = svg.parentElement;
            }
            let pt = svg.createSVGPoint();
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            let { x } = pt.matrixTransform(svg.getScreenCTM().inverse());
            let { startingDisplacement, width } = this.config;
            let t = (x - startingDisplacement) / width;
            if (t > endtime) {
                return;
            }
            console.log(t);
            this.svgOCListeners.map(f=> f(t));
        };

        function update(div, signal, t) {
            let trackedValue = "0";
            console.log(signal.wave);
            for (let [rawTime, value] of signal.wave) {
                let time = Number(rawTime);
                if (time <= t) {
                    trackedValue = value;
                }
                if (time > t) {
                    break;
                }
            }
            div.innerHTML = `${signal.name} &middot; ${trackedValue}`;
        }

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
                        let svg = ruler(this.config);
                        svg.onclick = svgOnClick;
                        e.appendChild(svg);
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
                            let updateBound = update.bind(null, e, signal);
                            updateBound(0);
                            this.svgOCListeners.push(updateBound);
                        }));
                    }));
                    
                    e.appendChild(n("td", e=> {
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash_cell";
                            let svg = fromSignal(signal, this.config);
                            svg.onclick = svgOnClick;
                            e.appendChild(svg);
                        }));
                    }));
                }));        
            }

        });

        this.domElement.appendChild(table);
        
    }
    
    zoomIn() {
        let currentZoomLevel = this.config.width;
        this.config.width = currentZoomLevel * 2;
        this.render();
    }

    zoomOut() {
        let currentZoomLevel = this.config.width;
        this.config.width = currentZoomLevel / 2;
        this.render();
    }

    resetZoom() {
        this.config.width = defaultConfig.width;
        this.render();
    }
}

window.Wavedash = Wavedash;