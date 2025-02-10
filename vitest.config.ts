import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		testTimeout: 180_000,
		reporters: ["verbose"],
	},
});
