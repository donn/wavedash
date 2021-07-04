"use strict";

const defaultConfig = {
    height: 20,
    width: 1, // Per Time Unit
    
    colors: {
        digital: "#00FF00",
        real: "#FFFF00",
        
        impedance: "#FF0000",
        unknown: "#0000FF"
    },

    endTime: null
};

export function fromSignal(signal, endTime, config = null) {
    let { wave, size, type } = signal;

    let real = type === "real";

    config = config ?? {};

    for (let element in defaultConfig) {
        config[element] = config[element] ?? defaultConfig[element];
    }

    let { height, width, colors } = config;

    /*
        Please refer to this graph for any odd-looking mathematics:
        
        M -> move
        L -> line
        m -> move relatively
        l -> line relatively
        
        O------------> x
        |
        |
        |
        |
        V
        y
    */

    let paths = [];
    let lastTime = 0;

    let lastClampedValue = 0;
    let lastState = "initial"; // "valid", "unknown", "impedance"

    let defaultColor = real ? colors.real : colors.digital;
    
    let cutPath = (color, at=[0, height]) => {
        let previousPath = paths[paths.length - 1];
        if (previousPath) {
            paths[paths.length - 1] += `"/>`;
        }
        if (color) {
            let [x, y] = at;
            paths.push(`<path stroke="${color}" fill="transparent" stroke-width="2px" d="M ${x} ${y}`);
        }
    };

    let append = (str) => {
        paths[paths.length - 1] += (str + " ");
    };

    if (size === 1) {

        let valueMin = 0, valueMax = 1;
        if (real) {
            valueMin = Infinity; valueMax = -Infinity;
            for (let [_, value] of wave) {
                valueMin = Math.min(valueMin, value);
                valueMax = Math.max(valueMax, value);
            }
        }

        let clamp = (value) => (value - valueMin) / (valueMax - valueMin);

        console.log(wave);
        for (let [time, rawValue] of wave) {

            append(`l ${width * (time - lastTime)} 0`);
            lastTime = time;
            
            let value = Number(rawValue);
            let state = "valid";
            if (isNaN(value)) {
                let lowercased = rawValue.toLowerCase();
                if (lowercased.includes("z")) {
                    state = "impedance";
                } else if (lowercased.includes("x")) {
                    state = "unknown";
                } else {
                    throw new Error("Unknown value " + rawValue + ".");
                }
            }
            
            lastState = lastState ?? state;
            
            let valueClamped = isNaN(value) ? 0.5 : clamp(value);

            if (lastState != state) {
                let color = defaultColor;
                switch (state) {
                case "unknown":
                    color = colors.unknown;
                    break;
                case "impedance":
                    color = colors.impedance;
                    break;
                default:                    
                    break;
                }
                let startingHeight = height - (height * valueClamped);
                lastClampedValue = valueClamped;
                cutPath(color, [width * lastTime, startingHeight]);

                lastState = state;
            }

            let delta = -(valueClamped - lastClampedValue);
            
            append(`l 0 ${delta * height} `);

            lastClampedValue = valueClamped;
        }
        append(`l ${width * (endTime - lastTime)} 0`);
    } else {

    }
    cutPath();

    let final = `
        <svg version="1.1"
        baseProfile="full"
        width="${endTime * width}" height="${height}"
        viewbox="0 0 ${endTime * width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        >
            ${paths.join("\n")}
        </svg>
    `;
    return final;
}