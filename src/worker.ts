import "temporal-polyfill-lite/global";
import { EmojiFormatter } from "@evnt/pretty";
import type { OpenEvnt } from "@evnt/types";
import { parseIntent, type Intent } from "./lib/intent.ts";
import { fetchEventData } from "./lib/resolve-data.ts";
import { getRedirectablesForIntent } from "./utils/instance-list.ts";
import { inferShareLink } from "./utils/inferShareLink.ts";
import { renderDocument } from "./render/document.ts";
import { renderHome } from "./render/home.ts";
import { renderPicker } from "./render/picker.ts";
import { escapeScriptText } from "./render/escape.ts";
import {
	eventSplash,
	majorityTimezone,
	renderEventMeta,
	renderEventTitle,
	renderSourceLinks,
} from "./meta.ts";

interface Env {
	ASSETS: Fetcher;
}

const PREFERENCE_KEY = "event-redirector:instance-url";

const requestLanguage = (request: Request, url: URL): string =>
	url.searchParams.get("language") ??
	url.searchParams.get("lang") ??
	request.headers.get("Accept-Language")?.split(",")[0]?.split(";")[0]?.trim() ??
	"en";

const html = (body: string): Response =>
	new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

/**
 * The preference lives in localStorage, which the server cannot read, so the
 * redirect has to happen in the document. Blocking in <head> means it runs
 * before the picker paints.
 */
const redirectScript = (intent: Intent): string => {
	const query = new URLSearchParams(intent as Record<string, string>).toString();
	return `\t\t<script>try{var u=localStorage.getItem(${escapeScriptText(JSON.stringify(PREFERENCE_KEY))});if(u)location.replace(u+"?"+${escapeScriptText(JSON.stringify(query))})}catch(e){}</script>\n`;
};

/** `/event` and the legacy `?action=view-event` render the same page as `/e`. */
const canonicalUrl = (origin: string, intent: Intent): string => {
	const params = new URLSearchParams();
	if (intent.at) params.set("at", intent.at);
	if (intent.url) params.set("url", intent.url);
	const query = params.toString();
	return `${origin}/e${query ? `?${query}` : ""}`;
};

const handlePicker = async (request: Request, url: URL, intent: Intent): Promise<Response> => {
	let data: OpenEvnt | null = null;
	try {
		data = await fetchEventData(intent);
	} catch (err) {
		console.error("Error fetching event data:", err);
	}

	const language = requestLanguage(request, url);
	const timezone =
		url.searchParams.get("timezone") ??
		url.searchParams.get("tz") ??
		(data && majorityTimezone(data)) ??
		"UTC";

	const name = data ? renderEventTitle(data, language) : null;
	const summary = data
		? new EmojiFormatter({ ...EmojiFormatter.emojiDefaults, language, timezone }).formatEvent(data)
		: "";

	// The formatter leads with the event name, which the picker shows as its heading.
	const lines = summary.split("\n").filter((line) => line.trim());
	const details = lines[0] === name ? lines.slice(1) : lines;

	const isDiscord = request.headers.get("User-Agent")?.includes("Discordbot") ?? false;

	const description = details.join(" · ");
	const canonical = canonicalUrl(url.origin, intent);

	return html(
		renderDocument({
			title: name ?? "eventsl.ink",
			description: description || undefined,
			language,
			head:
				redirectScript(intent) +
				renderSourceLinks(canonical, intent) +
				(data
					? renderEventMeta({ data, language, timezone, isDiscord, description, canonical })
					: ""),
			body: renderPicker({
				hasSource: !!(intent.at || intent.url),
				name,
				details,
				banner: data ? eventSplash(data, language) : null,
				redirectables: getRedirectablesForIntent(intent),
			}),
		}),
	);
};

const handleHome = (url: URL): Response => {
	const input = url.searchParams.get("link") ?? "";
	const shareLink = inferShareLink(input, url.origin);

	return html(
		renderDocument({
			title: "eventsl.ink",
			description: "Share one event link that opens in whichever app the reader already uses.",
			head: `\t\t<link rel="canonical" href="${url.origin}/" />\n`,
			body: renderHome({ input, shareLink, redirectables: getRedirectablesForIntent(null) }),
		}),
	);
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		const intent = parseIntent(url);
		if (intent) return handlePicker(request, url, intent);

		if (url.pathname === "/") return handleHome(url);

		return env.ASSETS.fetch(request);
	},
};
