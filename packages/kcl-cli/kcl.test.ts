import { beforeAll, describe, expect, test } from "vitest";
import { $, cd } from "zx";
import { commandShouldNotExist, createFlakeDir } from "../../test/test-utils";

describe("kcl", () => {
	const versionPattern = /^kcl version \d+\.\d+\.\d+$/;
	const pathPattern = /^\/nix\/store\/[^/]+-kcl-cli-\d+\.\d+\.\d+\/bin\/kcl$/;

	describe("nix run .#kcl-cli", () => {
		test("command can be run", async () => {
			const { stdout } = await $`nix run .#kcl-cli -- --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .#kcl-cli", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop .#kcl-cli -c which kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop .#kcl-cli -c kcl --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop . -c which kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop . -c kcl --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("flake.nix", () => {
		let flakeDir: string;
		beforeAll(async () => {
			flakeDir = await createFlakeDir("kcl-cli");
			await cd(flakeDir);
		});

		test("path should be correct", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop -c kcl --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kcl");
			const { stdout } = await $`nix develop -c which kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});
	});
});
