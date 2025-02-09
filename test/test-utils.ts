import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { $ } from "zx";

export async function createFlakeDir(packageName: string): Promise<string> {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	const workspaceRoot = dirname(currentDir);
	const dir = await mkdtemp(join(tmpdir(), "falke-nix-test-"));
	const template = await readFile(join(currentDir, "flake.nix.tpl"), "utf-8");
	const flakeNix = template
		.replace("{{ workspaceRoot }}", workspaceRoot)
		.replace("{{ packageName }}", packageName);
	await writeFile(join(dir, "flake.nix"), flakeNix);
	return dir;
}

export async function commandShouldNotExist(command: string): Promise<void> {
	const result = await $({ nothrow: true })`which ${command}`;
	expect(result.exitCode).toBe(1);
}

/**
 * Determines if the current execution environment is inside a Docker container
 * @returns Promise<boolean> true if inside a Docker container, false otherwise
 */
export async function isRunningInDocker(): Promise<boolean> {
	try {
		// 1. Check for existence of /.dockerenv file
		try {
			await fs.access("/.dockerenv");
			return true;
		} catch {
			// If file doesn't exist, proceed to next check
		}

		// 2. Search for 'docker' string in cgroup
		const cgroupContent = await fs.readFile("/proc/1/cgroup", "utf8");
		if (cgroupContent.includes("docker")) {
			return true;
		}

		// 3. Check hostname for container ID-like string
		const hostname = await fs.readFile("/proc/sys/kernel/hostname", "utf8");
		if (/^[a-f0-9]{12}$/.test(hostname.trim())) {
			return true;
		}

		return false;
	} catch (error) {
		// If file access error occurs, assume not in Docker environment
		return false;
	}
}
