import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import css from "rollup-plugin-import-css";
import json from "rollup-plugin-json";
import nodepf from "rollup-plugin-node-polyfills";


// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    external: [
        "jsdom",
        "jsdom/lib/jsdom/living/generated/utils",
        "jsdom/lib/jsdom/utils"
    ],
    input: 'src/app.js',
    output: {
        file: 'app-dist/app.js',
        format: 'iife',
        sourcemap: true,
        globals: {
            "jsdom": "trash",
            "jsdom/lib/jsdom/living/generated/utils": "trash",
            "jsdom/lib/jsdom/utils": "trash"
        }
    },
    plugins: [
        !production && serve(),
        !production && livereload(),
        css(),
        json(),
        resolve({ browser: true }), 
        commonjs(),
        nodepf(),
        production && terser(),
    ]
};