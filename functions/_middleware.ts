/// <reference types="@cloudflare/workers-types" />

import { type EventData, type SplashMediaComponent } from "@evnt/schema";
import { MarkdownSnippets, EventUtil } from "@evnt/pretty";
import { TranslationsUtil } from "@evnt/translations";
import { snippetEvent } from "@evnt/pretty";
import { convertToSchemaOrg } from "@evnt/convert/schema-org";
import { fetchEventData } from "../lib/resolve-data";
import { parseIntent } from "../lib/intent";
import "temporal-polyfill-lite/global";

interface Env { }

export const onRequest: PagesFunction<Env> = async (ctx) => {
	const url = new URL(ctx.request.url);
	const response = await ctx.next();

	let data: EventData | null = null;

	try {
		let intent = parseIntent(url);
		if (intent?.type == "event") data = await fetchEventData(intent);
	} catch (err) {
		console.error("Error fetching event data:", err);
		return response;
	}

	if (!data) return response;

	const isDiscord = ctx.request.headers.get("User-Agent")?.includes("Discordbot") ?? false;

	const eventMajorTimezone = EventUtil.majorityTimezone(data);

	const language = url.searchParams.get("language") ?? url.searchParams.get("lang") ?? "en";
	const timezone = url.searchParams.get("timezone") ?? url.searchParams.get("tz") ?? eventMajorTimezone ?? "UTC";

	const md = new MarkdownSnippets();
	md.language = language;
	md.timezone = timezone;
	if (isDiscord) md.flavor = "discord";

	let title = TranslationsUtil.translate(data.name ?? {}, [language]) ?? "Event";

	let markdown = snippetEvent(data, {
		maxGroups: 10,
		maxInstances: 5,
		maxVenues: 5,
	}).map(snip => md.snippet(snip)).join("\n");

	markdown += "\n\n" + md.subtext(`TZ: ${timezone}`);

	let splashMediaComponents = data.components
		?.filter((c): c is SplashMediaComponent => c.$type === "directory.evnt.component.splashMedia")

	let selected = splashMediaComponents?.find(c => c.roles.includes("ogembed"))
		?? splashMediaComponents?.find(c => c.roles.includes("embed"))
		?? splashMediaComponents?.find(c => c.roles.includes("poster"))
		?? splashMediaComponents?.[0];

	let image = selected?.media.sources[0];

	let jsonld = convertToSchemaOrg(data, { language, timezone });

	return new HTMLRewriter()
		.on('head', {
			element(element) {
				element.append(`<meta property="twitter:card" content="summary"/>`, { html: true });
				element.append(`<meta property="twitter:site" content="eventsl.ink"/>`, { html: true });
				element.append(`<meta property="application-name" content="eventsl.ink" />`, { html: true });
				element.append(`<meta property="og:title" content="${title!}" />`, { html: true });
				element.append(`<meta property="og:description" content="${markdown}" />`, { html: true });
				if (image?.url) {
					element.append(`<meta property="og:image" content="${image.url}" />`, { html: true });
					element.append(`<meta property="twitter:image" content="${image.url}" />`, { html: true });
					if (TranslationsUtil.translate(selected?.media.alt ?? {}, [language]))
						element.append(`<meta property="og:image:alt" content="${TranslationsUtil.translate(selected?.media.alt ?? {}, [language])}" />`, { html: true });
					if (image.mimeType)
						element.append(`<meta property="og:image:type" content="${image.mimeType}" />`, { html: true });
					if (image.dimensions) {
						element.append(`<meta property="og:image:width" content="${image.dimensions.width}" />`, { html: true });
						element.append(`<meta property="og:image:height" content="${image.dimensions.height}" />`, { html: true });
					}
				}
				element.append(`<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`, { html: true });
			},
		})
		.transform(response);
};
