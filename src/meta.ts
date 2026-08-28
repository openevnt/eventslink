import type { OpenEvnt, SplashMediaComponent } from "@evnt/types";
import { DiscordFormatter } from "@evnt/pretty";
import { TranslationsUtil } from "@evnt/translations";
import { schemaOrg } from "@evnt/convert/schema-org";
import { escapeHtml, escapeScriptText } from "./render/escape.ts";

const meta = (props: { property?: string; name?: string; content: string }): string => {
	const key = props.property ? `property="${props.property}"` : `name="${props.name}"`;
	return `\t\t<meta ${key} content="${escapeHtml(props.content)}" />\n`;
};

const imageMeta = (image: Splash, altText?: string): string =>
	meta({ property: "og:image", content: image.url }) +
	meta({ name: "twitter:image", content: image.url }) +
	(altText ? meta({ property: "og:image:alt", content: altText }) : "") +
	(image.mimeType ? meta({ property: "og:image:type", content: image.mimeType }) : "") +
	(image.dimensions
		? meta({ property: "og:image:width", content: String(image.dimensions.width) }) +
			meta({ property: "og:image:height", content: String(image.dimensions.height) })
		: "");

const extractTimezone = (partialDate: string): string | null => {
	const match = /\[(.+)\]$/.exec(partialDate);
	return match?.[1] ?? null;
};

export const majorityTimezone = (event: OpenEvnt): string | null => {
	const counts = new Map<string, number>();
	for (const instance of event.instances ?? []) {
		const tz =
			extractTimezone(instance.start?.toString() ?? "") ??
			extractTimezone(instance.end?.toString() ?? "");
		if (tz) counts.set(tz, (counts.get(tz) ?? 0) + 1);
	}
	let best: { tz: string; count: number } | null = null;
	for (const [tz, count] of counts) {
		if (!best || count > best.count) best = { tz, count };
	}
	return best?.tz ?? null;
};

const splashComponent = (data: OpenEvnt) => {
	const components = data.components?.filter(
		(c): c is SplashMediaComponent => c.$type === "directory.evnt.component.splashMedia",
	);

	return (
		components?.find((c) => c.roles.includes("ogembed")) ??
		components?.find((c) => c.roles.includes("embed")) ??
		components?.find((c) => c.roles.includes("poster")) ??
		components?.[0]
	);
};

export interface Splash {
	url: string;
	mimeType?: string;
	dimensions?: { width: number; height: number };
	alt?: string;
}

export const eventSplash = (data: OpenEvnt, language: string): Splash | null => {
	const component = splashComponent(data);
	const source = component?.media.sources[0] as
		| { url?: string; mimeType?: string; dimensions?: { width: number; height: number } }
		| undefined;
	if (!source?.url) return null;

	return {
		url: source.url,
		mimeType: source.mimeType,
		dimensions: source.dimensions,
		alt: component?.media.alt
			? (TranslationsUtil.translate(component.media.alt, [language]) ?? undefined)
			: undefined,
	};
};

export interface MetaOptions {
	data: OpenEvnt;
	language: string;
	timezone: string;
	isDiscord: boolean;
	description: string;
	canonical: string;
}

/**
 * Open Evnt link discovery: a client landing here can follow the alternate to
 * the event record instead of scraping the markup. These describe the request,
 * so they are emitted even when the event fails to load.
 */
export const renderSourceLinks = (
	canonical: string,
	source: { at?: string; url?: string },
): string =>
	`\t\t<link rel="canonical" href="${escapeHtml(canonical)}" />\n` +
	(source.url
		? `\t\t<link rel="alternate" type="application/evnt+json" href="${escapeHtml(source.url)}" />\n`
		: "") +
	(source.at ? `\t\t<link rel="alternate" href="${escapeHtml(source.at)}" />\n` : "");

export const renderEventTitle = (data: OpenEvnt, language: string): string =>
	TranslationsUtil.translate(data.name, [language]) ?? "Event";

export const renderEventMeta = ({
	data,
	language,
	timezone,
	isDiscord,
	description,
	canonical,
}: MetaOptions): string => {
	// Discord renders markdown inside an embed; everywhere else it would show the asterisks.
	const embedDescription = isDiscord
		? new DiscordFormatter(DiscordFormatter.discordDefaults).formatEvent(data)
		: description;

	const splash = eventSplash(data, language);

	const jsonld = schemaOrg.to!(data, { language, timezone });

	return (
		meta({ name: "twitter:card", content: splash ? "summary_large_image" : "summary" }) +
		meta({ name: "twitter:site", content: "eventsl.ink" }) +
		meta({ name: "application-name", content: "eventsl.ink" }) +
		meta({ property: "og:type", content: "website" }) +
		meta({ property: "og:site_name", content: "eventsl.ink" }) +
		meta({ property: "og:url", content: canonical }) +
		meta({ property: "og:title", content: renderEventTitle(data, language) }) +
		meta({ property: "og:description", content: embedDescription }) +
		(splash ? imageMeta(splash, splash.alt) : "") +
		`\t\t<script type="application/ld+json">${escapeScriptText(jsonld)}</script>\n`
	);
};
