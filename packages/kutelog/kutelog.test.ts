import { beforeAll, describe, expect, test } from "vitest";
import { $, cd } from "zx";
import { commandShouldNotExist, createFlakeDir } from "../../test/test-utils";

describe("kutelog", () => {
	const versionPattern = /^kutelog version v\d+\.\d+\.\d+$/;
	const pathPattern =
		/^\/nix\/store\/[^/]+-kutelog-\d+\.\d+\.\d+\/bin\/kutelog$/;

	describe("nix run .#kutelog", () => {
		test("command can be run", async () => {
			const { stdout } = await $`nix run .#kutelog -- --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .#kutelog", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop .#kutelog -c which kutelog`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop .#kutelog -c kutelog --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop . -c which kutelog`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop . -c kutelog --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("flake.nix", () => {
		let flakeDir: string;
		beforeAll(async () => {
			flakeDir = await createFlakeDir("kutelog");
			await cd(flakeDir);
		});

		test("path should be correct", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop -c kutelog --version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kutelog");
			const { stdout } = await $`nix develop -c which kutelog`;
			expect(stdout.trim()).toMatch(pathPattern);
		});
	});
});
