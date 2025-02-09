import type { RepositoryConfig } from "../../types";

export default {
	org: "kcl-lang",
	repo: "kubectl-kcl",
	getDownloadUrls({ version }) {
		const baseUrl = `https://github.com/kcl-lang/kubectl-kcl/releases/download/v${version}`;
		return {
			"x86_64-linux": `${baseUrl}/kubectl-kcl-linux-amd64.tgz`,
			"aarch64-linux": `${baseUrl}/kubectl-kcl-linux-arm64.tgz`,
			"x86_64-darwin": `${baseUrl}/kubectl-kcl-macos-amd64.tgz`,
			"aarch64-darwin": `${baseUrl}/kubectl-kcl-macos-arm64.tgz`,
		};
	},
} satisfies RepositoryConfig;
