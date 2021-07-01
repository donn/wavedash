import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    external: [
        "jsdom",
        "jsdom/lib/jsdom/living/generated/utils",
        "jsdom/lib/jsdom/utils"
    ],
    input: 'lib/wavedash.js',
    output: {
        file: 'dist/wavedash.js',
        format: 'iife',
        sourcemap: true,
        globals: {
            "jsdom": "trash",
            "jsdom/lib/jsdom/living/generated/utils": "trash",
            "jsdom/lib/jsdom/utils": "trash"
        }
    },
    plugins: [
        resolve(), 
        commonjs(),
        production && terser()
    ]
};