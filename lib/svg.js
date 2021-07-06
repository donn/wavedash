"use strict";
import { g, n, toElement } from "./tinydom";

export const defaultConfig = {
    startingDisplacement: 5, //px
    rulerPixelCount: 4,

    height: 20, // px
    width: 2, // px/Per Time Unit

    strokeWidth: 2, // px
    
    colors: {
        digital: "#00FF00",
        real: "#FFFF00",
        impedance: "#FF0000",
        unknown: "#0000FF",

        ruler: "#000000"
    },

    endTime: 3000 // ticks
};

export function normalizeConfig(config) {
    config = config ?? {};
    let finalConfig = {};

    for (let element in defaultConfig) {
        finalConfig[element] = config[element] ?? defaultConfig[element];
    }

    return finalConfig;
}

export function ruler(config) {
    let { height, width, colors, endTime, startingDisplacement, rulerPixelCount } = config;
    let color = colors.ruler;

    let path = `<path stroke="${color}" fill="transparent" stroke-width="1" d="`;

    let text = [];
    for (let i = 0; i <= (endTime * width) / rulerPixelCount; i += 1) {
        let dx = i * rulerPixelCount;
        let t = dx / width;
        let x = startingDisplacement + dx;
        path += `M ${x} 0 `;
        let currentHeight = height / 4;
        if (i % 5 === 0) {
            currentHeight = height / 2;
        }
        if (i % 10 === 0) {
            currentHeight = height;
            text.push(`
                <text
                    x="${x + rulerPixelCount / 2}"
                    y="${height}"
                    fill="${color}"
                    font-size="${height * 0.4}"
                >${
                    t 
                }</text>
            `);
        }
        path += `l 0 ${currentHeight} `;
    }

    path += `"/>`;

    return `
        <svg version="1.1"
        baseProfile="full"
        width="${endTime * width}" height="${height}"
        viewbox="0 0 ${endTime * width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        >
            ${path}
            ${text.join("\n")}
        </svg>
    `;
}

export function fromSignal(signal, config) {
    let { height, width, strokeWidth, colors, endTime, startingDisplacement } = config;
    let { wave, size, type } = signal;

    let real = type === "real";

    const fontSize = height * 0.8;

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

        Note: if you stroke along an axis, it will chop off the stroke width
        in half. That's why we leave an initial displacement and clamp the
        height between 10% and 90% of the minimum/maximum.
    */

    let paths = [];
    let text = [];

    let lastState = "initial"; // "valid", "unknown", "impedance"

    let defaultColor = real ? colors.real : colors.digital;
    
    let cutPath = (color, at=[0, height]) => {
        let previousPath = paths[paths.length - 1];
        if (previousPath) {
            paths[paths.length - 1] += `"/>`;
        }
        if (color) {
            let [x, y] = at;
            paths.push(`<path stroke="${color}" fill="transparent" stroke-width="${strokeWidth}" d="M ${x + startingDisplacement} ${y}`);
        }
    };

    let append = (str) => {
        paths[paths.length - 1] += (str + " ");
    };

    if (size === 1) {
        let lastTime = 0;
        let lastClampedValue = 0;

        let valueMin = 0, valueMax = 1;
        if (real) {
            valueMin = Infinity; valueMax = -Infinity;
            for (let [_, value] of wave) {
                valueMin = Math.min(valueMin, value);
                valueMax = Math.max(valueMax, value);
            }
        }

        let clamp = (value) => ((value - valueMin) / (valueMax - valueMin)) * 0.9 + 0.05;

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
            
            append(`l 0 ${delta * height}`);

            lastClampedValue = valueClamped;
        }
        append(`l ${width * (endTime - lastTime)} 0`);
    } else {
        for (let i = 0; i < wave.length; i += 1) {
            let signal = wave[i];
            let [time, rawValue] = signal;

            let from = time;
            let to = wave[i + 1]?.[0] ?? endTime;
            let totalWidth = (to - from) * width;

            let slopeWidth = height / 4;
            if (totalWidth < height) {
                slopeWidth = totalWidth / 2;
            }
            let straightWidth = totalWidth - (slopeWidth * 2);

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

            const fallRiseDelta = (height / 2) * 0.9;
            
            cutPath(color, [width * from, height / 2]);
            append(`l ${slopeWidth} ${fallRiseDelta}`);
            append(`l ${straightWidth} 0`);
            append(`l ${slopeWidth} ${-fallRiseDelta}`);
            append(`l ${-slopeWidth} ${-fallRiseDelta}`);
            append(`l ${-straightWidth} 0`);
            append(`l ${-slopeWidth} ${fallRiseDelta}`);
            append(`M ${totalWidth} ${fallRiseDelta}`);

            // Estimate Text Width
            let estWidth = (fontSize * 0.75);

            let label = rawValue;

            let estLabelWidth = label.length * estWidth;

            if (estLabelWidth <= straightWidth) {
                text.push(`
                    <text
                        x="${startingDisplacement + from * width + slopeWidth}"
                        y="${height * 0.8}"
                        fill="white"
                        font-size="${height * 0.8}"
                    >${
                        rawValue
                    }</text>
                `);
            }
        }
    }
    cutPath();

    let str = `
        <svg version="1.1"
        baseProfile="full"
        width="${endTime * width}" height="${height}"
        viewbox="0 0 ${endTime * width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        >
            ${paths.join("\n")}
            ${text.join("\n")}
        </svg>
    `;

    if (false) {
        let svg = n("svg", (e, sa)=> {
            let w = endTime * width, h = height;
            sa("version", "1.1");
            sa("baseProfile", "full");
            sa("width", w);
            sa("height", h);
            sa("viewbox", `0 0 ${w} ${h}`);
            sa("xmlns", "http://www.w3.org/2000/svg");
            let finalPathList = (paths.concat(text)).join("\n");
            console.log(finalPathList);

            // For some reason, this doesn't work as you'd expect
            e.innerHTML = finalPathList;
        });
    }

    
    return toElement(str);
}