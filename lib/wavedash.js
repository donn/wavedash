import { defaultConfig, normalizeConfig, fromSignal, ruler } from "./svg";
import VCDParser from "cloudv-vcd-parser";

import { g, n } from "./tinydom.js";
import "./wavedash.css";

export class Wavedash {
    constructor(domElementId, vcd, config={}) {
        this.domElementId = domElementId;
        this.vcd = vcd;
        this.config = normalizeConfig(config);

        this.domElement = g(`#${domElementId}`);
    }

    async vcdParsed() {
        if (this._vcdParsed) {
            return this._vcdParsed;
        }
        
        console.time("parsing");
        this._vcdParsed = await VCDParser.parse(this.vcd);
        console.timeEnd("parsing");

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
                svg = svg.parentElement;
            }
            let pt = svg.createSVGPoint();
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            let { x } = pt.matrixTransform(svg.getScreenCTM().inverse());
            let { startingDisplacement, width } = this.config;
            let t = (x - startingDisplacement) / width;
            if (t > endtime || t < 0) {
                return;
            }
            console.log(`[WAVEDASH] click resolved to @ ${t}`);
            this.svgOCListeners.map(f=> f(t));
        };

        function update(div, signal, t) {
            let trackedValue = "0";
            for (let [rawTime, value] of signal.wave) {
                let time = Number(rawTime);
                if (time <= t) {
                    trackedValue = value;
                }
                if (time > t) {
                    break;
                }
            }
            div.innerHTML = `${trackedValue}`;
        }

        let container = n("div", e=> {
            e.className = "wavedash-container";
            e.appendChild(n("table", e=> {
                e.className = "wavedash";
                e.appendChild(n("tr", e=> {
                    e.appendChild(n("th", e=> {
                        e.className = "wavedash-header";
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash-cell";
                            e.appendChild(n("p", e=> {
                                e.className = "all";
                                e.innerHTML = `Time (${this.parsed.timescale})`;
                            }));
                        }));
                    }))
                    e.appendChild(n("th", e=> {
                        e.className = "wavedash-column-header";
                        e.appendChild(n("div", e=> {
                            e.className = "wavedash-cell";
                            let svg = ruler(this.config);
                            svg.onclick = svgOnClick;
                            e.appendChild(svg);
                            e.id = `${this.domElementId}-ruler`;
                        }));
                        e.style = "background-color: #FFFDD0;"
                    }))
                }))
                
                for (let signal of signals) {
                    e.appendChild(n("tr", e=> {
                        e.appendChild(n("th", e=> {
                            e.className = "wavedash-row-header";
                            e.appendChild(n("div", e=> {
                                e.className = "wavedash-cell";
                                e.appendChild(n("p", e=> {
                                    e.className = "first";
                                    e.innerHTML = signal.name
                                }));
                                e.appendChild(n("p", e=> {
                                    e.className = "second";

                                    let updateBound = update.bind(null, e, signal);
                                    updateBound(0);
                                    this.svgOCListeners.push(updateBound);
                                }));
                            }));
                        }));
                        
                        e.appendChild(n("td", e=> {
                            e.appendChild(n("div", e=> {
                                e.className = "wavedash-cell";
                                let svg = fromSignal(signal, this.config);
                                svg.onclick = svgOnClick;
                                e.appendChild(svg);
                            }));
                        }));
                    }));        
                }
            }));

            let cursor = n("div", e=> {
                e.className = "wavedash-cursor";
            });

            this.svgOCListeners.push((t)=> {
                let disp = (
                    200 + 2 * (this.config.startingDisplacement - 1) // Correction by trial and error
                ) + (
                    t * this.config.width
                );
                cursor.style = `margin-left: ${disp}px;`;
            });

            e.appendChild(cursor);
        });
        

        this.domElement.appendChild(container);
        
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