import { beforeAll, describe, expect, test } from "vitest";
import { $, cd } from "zx";
import { commandShouldNotExist, createFlakeDir } from "../../test/test-utils";

describe("kcl-language-server", () => {
	const versionPattern = /^kcl-language-server Version: \d+\.\d+\.\d+/;
	const pathPattern =
		/^\/nix\/store\/[^/]+-kcl-language-server-\d+\.\d+\.\d+\/bin\/kcl-language-server$/;

	describe("nix run .#kcl-language-server", () => {
		test("command can be run", async () => {
			const { stdout } = await $`nix run .#kcl-language-server -- --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .#kcl-language-server", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } =
				await $`nix develop .#kcl-language-server -c which kcl-language-server`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } =
				await $`nix develop .#kcl-language-server -c kcl-language-server --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } = await $`nix develop . -c which kcl-language-server`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } =
				await $`nix develop . -c kcl-language-server --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("flake.nix", () => {
		let flakeDir: string;
		beforeAll(async () => {
			flakeDir = await createFlakeDir("kcl-language-server");
			await cd(flakeDir);
		});

		test("path should be correct", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } = await $`nix develop -c kcl-language-server --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl-language-server");
			const { stdout } = await $`nix develop -c which kcl-language-server`;
			expect(stdout.trim()).toMatch(pathPattern);
		});
	});
});
