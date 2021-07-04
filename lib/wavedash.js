import { fromSignal } from "./svg";
import VCDParser from "cloudv-vcd-parser";
import "./wavedash.css";

export class Wavedash {
    constructor(domElementId, vcd, config={}) {
        this.domElementId = domElementId;
        this.vcd = vcd;
        this.config = config;

        this.domElement = document.getElementById("wavedash");
    }

    async attach() {
        this.domElement.innerHTML = "";

        this.parsed = await VCDParser.parse(this.vcd);
        let { signal: signals, endtime } = this.parsed;
        let table = document.createElement("table");
        table.className = "wavedash";
        for (let signal of signals) {
            let row = document.createElement("tr");
            
            
            let nameCell = document.createElement("div");
            nameCell.className = "wavedash_cell";
            nameCell.innerHTML = signal.signalName;

            let nameTD = document.createElement("td");
            nameTD.appendChild(nameCell);


            let svgCell = document.createElement("div");
            svgCell.className = "wavedash_cell";
            svgCell.innerHTML = fromSignal(signal, endtime, this.config);

            let svgTD = document.createElement("td");
            svgTD.appendChild(svgCell);

            row.appendChild(nameTD);
            row.appendChild(svgTD)
            
            table.appendChild(row);

        }

        this.domElement.appendChild(table);
        
    }
    
}

window.Wavedash = Wavedash;