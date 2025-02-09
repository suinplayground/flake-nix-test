import type { RepositoryConfig } from "../../types";

export default {
	org: "kcl-lang",
	repo: "cli",
	getDownloadUrls({ version }) {
		const baseUrl = `https://github.com/kcl-lang/cli/releases/download/v${version}`;
		return {
			"x86_64-linux": `${baseUrl}/kcl-v${version}-linux-amd64.tar.gz`,
			"aarch64-linux": `${baseUrl}/kcl-v${version}-linux-arm64.tar.gz`,
			"x86_64-darwin": `${baseUrl}/kcl-v${version}-darwin-amd64.tar.gz`,
			"aarch64-darwin": `${baseUrl}/kcl-v${version}-darwin-arm64.tar.gz`,
		};
	},
} satisfies RepositoryConfig;
