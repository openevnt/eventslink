/// <reference types="@cloudflare/workers-types" />

import type { OpenEvnt, SplashMediaComponent } from "@evnt/types";
import { MarkdownFormatter, DiscordFormatter } from "@evnt/pretty";
import { TranslationsUtil } from "@evnt/translations";
import { schemaOrg } from "@evnt/convert/schema-org";
import { fetchEventData } from "../src/lib/resolve-data";
import { parseIntent } from "../src/lib/intent";
import "temporal-polyfill-lite/global";

interface Env {}

const escHtml = (s: string): string =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const appendMeta = (el: Element, props: { property?: string; name?: string; content: string }) => {
	const prop = props.property ? `property="${props.property}"` : `name="${props.name}"`;
	el.append(`<meta ${prop} content="${escHtml(props.content)}"/>`, { html: true });
};

const appendImageMeta = (
	el: Element,
	image: { url: string; mimeType?: string; dimensions?: { width: number; height: number } },
	altText?: string,
) => {
	appendMeta(el, { property: "og:image", content: image.url });
	appendMeta(el, { name: "twitter:image", content: image.url });
	if (altText) appendMeta(el, { property: "og:image:alt", content: altText });
	if (image.mimeType) appendMeta(el, { property: "og:image:type", content: image.mimeType });
	if (image.dimensions) {
		appendMeta(el, { property: "og:image:width", content: String(image.dimensions.width) });
		appendMeta(el, { property: "og:image:height", content: String(image.dimensions.height) });
	}
};

/** Extract timezone from a PartialDate string (e.g. "2026-06-25T14:00[America/New_York]" → "America/New_York"). */
const extractTimezone = (pd: string): string | null => {
	const match = /\[(.+)\]$/.exec(pd);
	return match?.[1] ?? null;
};

/** Find the most common timezone across all event instances. */
const majorityTimezone = (event: OpenEvnt): string | null => {
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

export const onRequest: PagesFunction<Env> = async (ctx) => {
	const url = new URL(ctx.request.url);
	const response = await ctx.next();

	let data: OpenEvnt | null = null;

	try {
		const intent = parseIntent(url);
		if (intent?.type == "event") data = await fetchEventData(intent);
	} catch (err) {
		console.error("Error fetching event data:", err);
		return response;
	}

	if (!data) return response;

	const isDiscord = ctx.request.headers.get("User-Agent")?.includes("Discordbot") ?? false;

	const language = url.searchParams.get("language") ?? url.searchParams.get("lang") ?? "en";
	const timezone =
		url.searchParams.get("timezone") ??
		url.searchParams.get("tz") ??
		majorityTimezone(data) ??
		"UTC";

	const title = TranslationsUtil.translate(data.name, [language]) ?? "Event";

	const markdown = (
		isDiscord
			? new DiscordFormatter(DiscordFormatter.discordDefaults)
			: new MarkdownFormatter(MarkdownFormatter.markdownDefaults)
	).formatEvent(data);

	const splashMediaComponents = data.components?.filter(
		(c): c is SplashMediaComponent => c.$type === "directory.evnt.component.splashMedia",
	);

	const selected =
		splashMediaComponents?.find((c) => c.roles.includes("ogembed")) ??
		splashMediaComponents?.find((c) => c.roles.includes("embed")) ??
		splashMediaComponents?.find((c) => c.roles.includes("poster")) ??
		splashMediaComponents?.[0];

	const source = selected?.media.sources[0];
	const image = source
		? {
				url: source.url,
				mimeType: (source as { mimeType?: string }).mimeType,
				dimensions: (source as { dimensions?: { width: number; height: number } }).dimensions,
			}
		: undefined;
	const altText = selected?.media.alt
		? TranslationsUtil.translate(selected.media.alt, [language])
		: undefined;

	const jsonld = schemaOrg.to!(data, { language, timezone });

	return new HTMLRewriter()
		.on("head", {
			element(element) {
				appendMeta(element, { name: "twitter:card", content: "summary" });
				appendMeta(element, { name: "twitter:site", content: "eventsl.ink" });
				appendMeta(element, { name: "application-name", content: "eventsl.ink" });
				appendMeta(element, { property: "og:title", content: title });
				appendMeta(element, { property: "og:description", content: markdown });

				if (image?.url) {
					appendImageMeta(
						element,
						{ url: image.url, mimeType: image.mimeType, dimensions: image.dimensions },
						altText,
					);
				}

				element.append(`<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`, {
					html: true,
				});
			},
		})
		.transform(response);
};
