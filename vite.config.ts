import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: "@",
				replacement: "/src",
			},
		],
	},
	build: {
		outDir: "docs",
	},
});
