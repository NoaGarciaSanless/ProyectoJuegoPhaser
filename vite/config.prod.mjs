import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

const phasermsg = () => {
    return {
        name: "phasermsg",
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {},
    };
};

export default defineConfig({
    base: "./",
    plugins: [vue(), phasermsg()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("../src", import.meta.url)),
        },
    },
    logLevel: "warning",
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ["phaser"],
                },
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                passes: 2,
                drop_console: true,
                drop_debugger: true,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },
    },
});
