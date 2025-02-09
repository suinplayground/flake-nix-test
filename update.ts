import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import ky from "ky";
import { $ } from "zx";
import type { Platform, RepositoryConfig } from "./types";

interface ReleaseResponse {
	tag_name: string;
}

interface UpdateResult {
	package: string;
	success: boolean;
	newVersion?: string;
	error?: string;
	changed?: boolean;
	previousVersion?: string | null;
}

async function setGitHubOutput(name: string, value: string) {
	// biome-ignore lint/complexity/useLiteralKeys: <explanation>
	const githubOutput = process.env["GITHUB_OUTPUT"];
	if (githubOutput) {
		await fs.appendFile(githubOutput, `${name}<<EOF\n${value}\nEOF\n`);
	}
}

async function getCurrentVersion(packageName: string): Promise<string | null> {
	try {
		const filePath = `packages/${packageName}/release.json`;
		const content = await fs.readFile(filePath, "utf-8");
		const data = JSON.parse(content);
		return data.version;
	} catch {
		return null;
	}
}

async function fetchLatestRelease(
	config: RepositoryConfig,
): Promise<{ version: string }> {
	console.log(`📦 Fetching latest release for ${config.org}/${config.repo}...`);
	const response = await ky
		.get(
			`https://api.github.com/repos/${config.org}/${config.repo}/releases/latest`,
		)
		.json<ReleaseResponse>();

	const version = response.tag_name.replace(/^v/, "");
	console.log(`✨ Found version ${version} for ${config.org}/${config.repo}`);
	return { version };
}

async function calculateHash(url: string): Promise<string> {
	console.log(`🔍 Prefetching URL: ${url}`);
	const prefetchUrl = await $`nix-prefetch-url ${url}`;
	if (!prefetchUrl.stdout) {
		throw new Error("Failed to prefetch URL");
	}
	console.log(`🔐 Calculating hash for: ${url}`);
	const hash =
		await $`nix hash to-sri --type sha256 ${prefetchUrl.stdout.trim()}`;
	if (!hash.stdout) {
		throw new Error("Failed to calculate hash");
	}
	const result = hash.stdout.trim();
	console.log(`✅ Hash calculated: ${result}`);
	return result;
}

async function updateReleaseJson(
	packageName: string,
	data: {
		version: string;
		artifacts: Record<Platform, { url: string; sha256: string }>;
	},
): Promise<void> {
	const filePath = `packages/${packageName}/release.json`;
	console.log(`💾 Updating release.json for ${packageName}...`);
	await fs.writeFile(filePath, `${JSON.stringify(data, null, "\t")}\n`);
	console.log(`✅ Successfully updated ${filePath}`);
}

async function updatePackage(packageName: string): Promise<UpdateResult> {
	console.log(`\n🚀 Starting update for package: ${packageName}`);
	try {
		const currentVersion = await getCurrentVersion(packageName);

		// Dynamically import repository.ts
		console.log(`📖 Loading repository configuration for ${packageName}...`);
		const { default: config } = (await import(
			path.resolve(`packages/${packageName}/repository.ts`)
		)) as { default: RepositoryConfig };

		const latestRelease = await fetchLatestRelease(config);

		// Skip if version hasn't changed
		if (currentVersion === latestRelease.version) {
			return {
				package: packageName,
				success: true,
				newVersion: latestRelease.version,
				changed: false,
				previousVersion: currentVersion,
			};
		}

		const urls = config.getDownloadUrls({ version: latestRelease.version });

		console.log(`🔄 Processing artifacts for ${packageName}...`);
		// Calculate hashes in parallel
		const artifactPromises = Object.entries(urls).map(
			async ([platform, url]) => {
				console.log(`⚙️ Processing ${platform} artifact...`);
				try {
					const sha256 = await calculateHash(url);
					return {
						platform: platform as Platform,
						url,
						sha256,
						success: true,
					};
				} catch (error) {
					console.error(`Failed to calculate hash for ${url}: ${error}`);
					return {
						platform: platform as Platform,
						url,
						success: false,
					};
				}
			},
		);

		const artifactResults = await Promise.all(artifactPromises);
		const artifacts = {} as Record<Platform, { url: string; sha256: string }>;

		for (const result of artifactResults) {
			if (result.success && "sha256" in result) {
				artifacts[result.platform] = {
					url: result.url,
					sha256: result.sha256,
				};
			}
		}

		await updateReleaseJson(packageName, {
			version: latestRelease.version,
			artifacts,
		});

		return {
			package: packageName,
			success: true,
			newVersion: latestRelease.version,
			changed: true,
			previousVersion: currentVersion,
		};
	} catch (error) {
		return {
			package: packageName,
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function main() {
	console.log("🎯 Starting package updates...");
	const startTime = Date.now();

	const packageDirs = await glob("packages/*");
	console.log(`📦 Found ${packageDirs.length} packages to update`);

	// Update packages in parallel
	const updatePromises = packageDirs.map(async (dir) => {
		const packageName = path.basename(dir);
		const result = await updatePackage(packageName);
		console.log(
			`${packageName}: ${result.success ? "✅" : "❌"} ${result.newVersion ? `(v${result.newVersion})` : ""}`,
		);
		if (!result.success) {
			console.error(`❌ Error updating ${packageName}: ${result.error}`);
		}
		return result;
	});

	const results = await Promise.all(updatePromises);

	const endTime = Date.now();
	const duration = ((endTime - startTime) / 1000).toFixed(2);

	// Generate changes summary
	const changes = results
		.filter((r) => r.changed)
		.map(
			(r) =>
				`- ${r.package}: v${r.previousVersion || "none"} → v${r.newVersion}`,
		)
		.join("\n");

	// Set GitHub Actions outputs
	const hasChanges = results.some((r) => r.changed);
	await setGitHubOutput("CONTENT_CHANGED", hasChanges.toString());
	await setGitHubOutput("CHANGES", changes);

	// Generate labels for changed packages
	const labels = results
		.filter((r) => r.changed && r.newVersion)
		.map((r) => `${r.package}-${r.newVersion}`)
		.join(",");
	await setGitHubOutput("LABELS", labels);

	// Output final results
	console.log(`\n📊 Update completed in ${duration}s`);
	if (hasChanges) {
		console.log("\n📝 Changes detected:");
		console.log(changes);
	} else {
		console.log("\n📝 No changes detected");
	}
}

main().catch(console.error);
