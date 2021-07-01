import fs from "fs";
import VCDParser from "vcd-parser";

VCDParser.parse(fs.readFileSync("./test.vcd").toString()).then(json=> fs.writeFileSync("./test.json", JSON.stringify(json)));

