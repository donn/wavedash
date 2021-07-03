"use strict";

const defaultConfig = {
    width: 0.5, // Per Time Unit
    
    colors: {
        digital: "#00FF00",
        real: "#FFFF00",
        
        impedance: "#FF0000",
        unknown: "#0000FF"
    }
};

export function fromSignal(signal, endTime, config = null) {
    let { wave, size, type } = signal;

    let real = type === "real";

    config = config ?? {};

    for (let element in defaultConfig) {
        config[element] = config[element] ?? defaultConfig[element];
    }

    let { width, colors } = config;

    let path = `M 0 0 `;
    if (size === 1) {
        if (real) {
            
        } else {
            let currentTime = 0;
            let currentValue = 0;
            for (let [time, value] of wave) {
                value = Number(value);
    
                path += `l ${width * (time - currentTime)} 0 `;
                currentTime = time;
                
                path += `l 0 ${-100 + 2 * 100 * value}% `;
                value = currentValue;
            }
            path += `l ${width * (endTime - currentTime)} 0 `;
        }
        // for (let i = 0; i <= endTime; i += 1) {
        //     if (extant(changes[i])) {
        //         path += `l 0 ${-height + 2 * height * changes[i]} `;
        //     }
        //     path += `l ${width} 0 `;
        // }
    } else {

    }

    return `
        <svg version="1.1"
        baseProfile="full"
        width="${endTime * width}" height="100%"
        xmlns="http://www.w3.org/2000/svg"
        >
            <path d="${path}" stroke="${colors.digital}" fill="transparent"/>

        </svg>
    `;
}