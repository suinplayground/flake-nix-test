export type Platform =
	| "x86_64-linux"
	| "aarch64-linux"
	| "x86_64-darwin"
	| "aarch64-darwin";

export interface RepositoryConfig {
	org: string;
	repo: string;
	getDownloadUrls(params: { version: string }): Record<Platform, string>;
}
