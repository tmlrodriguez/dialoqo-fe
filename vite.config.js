import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    server: {
        allowedHosts: [".trycloudflare.com"],

        proxy: {
            "/ws": { target: "http://127.0.0.1:8000", ws: true },
            "/access": "http://127.0.0.1:8000",
            "/organizations": "http://127.0.0.1:8000",
            "/members": "http://127.0.0.1:8000",
            "/whatsapp": "http://127.0.0.1:8000",
            "/auditing": "http://127.0.0.1:8000",
        },
    },
});
