import { beforeAll, describe, expect, test } from "vitest";
import { $, cd } from "zx";
import { commandShouldNotExist, createFlakeDir } from "../../test/test-utils";

describe("kubectl-kcl", () => {
	const versionPattern = /^\d+\.\d+\.\d+$/;
	const pathPattern =
		/^\/nix\/store\/[^/]+-kubectl-kcl-\d+\.\d+\.\d+\/bin\/kubectl-kcl$/;

	describe("nix run .#kubectl-kcl", () => {
		test("command can be run", async () => {
			const { stdout } = await $`nix run .#kubectl-kcl version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .#kubectl-kcl", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } =
				await $`nix develop .#kubectl-kcl -c which kubectl-kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } =
				await $`nix develop .#kubectl-kcl -c kubectl-kcl version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("nix develop .", () => {
		test("path should be correct", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } = await $`nix develop . -c which kubectl-kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } = await $`nix develop . -c kubectl-kcl version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});
	});

	describe("flake.nix", () => {
		let flakeDir: string;
		beforeAll(async () => {
			flakeDir = await createFlakeDir("kubectl-kcl");
			await cd(flakeDir);
		});

		test("path should be correct", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } = await $`nix develop -c kubectl-kcl version`;
			expect(stdout.trim()).toMatch(versionPattern);
		});

		test("command can be run", async () => {
			commandShouldNotExist("kubectl-kcl");
			const { stdout } = await $`nix develop -c which kubectl-kcl`;
			expect(stdout.trim()).toMatch(pathPattern);
		});
	});
});
