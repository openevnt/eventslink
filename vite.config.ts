import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from "node:fs";
import { VirtualModule } from "@deniz-blue/vite-plugins";

export default defineConfig({
	plugins: [
		react(),
		VirtualModule(
			"applications",
			() => {
				const json = JSON.parse(readFileSync("./data/applications.json", "utf-8"));
				return `export const applications = ${JSON.stringify(json)};`;
			},
		),
	],
})
