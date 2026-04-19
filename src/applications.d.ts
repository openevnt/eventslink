declare module "virtual:applications" {
	export const applications: ApplicationsManifest;

	export interface ApplicationsManifest {
		applications: ApplicationInfo[];
	}

	export interface ApplicationInfo {
		url: string;
		name?: string;
		description?: string;
		redirectTo?: string;
		faviconUrl?: string;
		faviconRadius?: number;
		capabilities: string[];
	}
}