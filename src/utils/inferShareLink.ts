import { parseResourceUri } from "@atcute/lexicons";

const DEFAULT_COLLECTION = "community.lexicon.calendar.event";

const toShareAtUri = (at: string): string => {
	return `${window.location.origin}/e?at=${at}`;
};

const toShareHttpUrl = (url: string): string => {
	return `${window.location.origin}/e?url=${encodeURIComponent(url)}`;
};

const maybeAt = (value: string): string | null => {
	try {
		parseResourceUri(value);
		return value;
	} catch {
		return null;
	}
};

export const inferShareLink = (input: string): string => {
	const value = input.trim();
	if (!value) return "";

	const directAt = maybeAt(value);
	if (directAt) return toShareAtUri(directAt);

	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch {
		return "";
	}

	if (parsed.pathname.endsWith(".json")) {
		return toShareHttpUrl(parsed.href);
	}

	const atParam = parsed.searchParams.get("at");
	if (atParam) {
		const validated = maybeAt(atParam);
		if (validated) return toShareAtUri(validated);
	}

	const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
	const parts = path ? path.split("/") : [];

	if (parsed.host === "platform.openmeet.net" && parts[0] === "at" && parts.length >= 4) {
		const at = `at://${decodeURIComponent(parts[1])}/${decodeURIComponent(parts[2])}/${decodeURIComponent(parts[3])}`;
		const validated = maybeAt(at);
		if (validated) return toShareAtUri(validated);
	}

	if (parsed.host === "atmo.rsvp" && parts[0] === "p" && parts[2] === "e" && parts.length >= 4) {
		const at = `at://${decodeURIComponent(parts[1])}/${DEFAULT_COLLECTION}/${decodeURIComponent(parts[3])}`;
		const validated = maybeAt(at);
		if (validated) return toShareAtUri(validated);
	}

	if (parsed.host === "smokesignal.events" && parts.length >= 2) {
		const at = `at://${decodeURIComponent(parts[0])}/${DEFAULT_COLLECTION}/${decodeURIComponent(parts[1])}`;
		const validated = maybeAt(at);
		if (validated) return toShareAtUri(validated);
	}

	if (parsed.host === "pds.ls" && parts.length >= 1) {
		const joined = decodeURIComponent(parts.join("/"));
		const validated = maybeAt(joined.startsWith("at://") ? joined : `at://${joined}`);
		if (validated) return toShareAtUri(validated);
	}

	return "";
};
