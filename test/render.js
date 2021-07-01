import fs from "fs";
import { fromSignal } from "../lib/svg.js";

async function main() {
    let results = JSON.parse(fs.readFileSync("./test.json"));
    let svgs = results.signal.map(sig=> [sig.name, fromSignal(sig, results.endtime)]);

    fs.writeFileSync("./index.html", `
        <html>
        <head>
            <title>WD test</title>
            <script src="dist/wavedash.js" type="text/javascript"></script>
            <style>
                body {
                    background: black;
                    color: white;
                }
                p {
                    width: 100%;
                }

                #vcd > td {
                    width: 50%;
                }
            </style>
        </head>
        <body>
            <table id="vcd">
            ${svgs.map(svg=>`<tr><td>${svg[0]}</td><td>${svg[1]}</td></tr>`).join("\n")}
            </table>
        </body>
        </html>
    `);
}

main();