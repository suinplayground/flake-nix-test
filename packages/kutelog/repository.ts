import type { RepositoryConfig } from "../../types";

export default {
	org: "appthrust",
	repo: "kutelog",
	getDownloadUrls({ version }) {
		const baseUrl = `https://github.com/appthrust/kutelog/releases/download/v${version}`;
		return {
			"x86_64-linux": `${baseUrl}/kutelog-linux-amd64`,
			"aarch64-linux": `${baseUrl}/kutelog-linux-arm64`,
			"x86_64-darwin": `${baseUrl}/kutelog-darwin-amd64`,
			"aarch64-darwin": `${baseUrl}/kutelog-darwin-arm64`,
		};
	},
} satisfies RepositoryConfig;
