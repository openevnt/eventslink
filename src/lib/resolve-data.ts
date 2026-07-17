import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	DohJsonHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from "@atcute/identity-resolver";
import { Client, simpleFetchHandler } from "@atcute/client";
import { type ParsedResourceUri, parseResourceUri } from "@atcute/lexicons";
import { communityLexicon } from "@evnt/convert/community-lexicon";
import { OpenEvntSchema } from "@evnt/schema";
import type { OpenEvnt } from "@evnt/types";
import type {} from "@atcute/atproto";
import type { AtprotoDid } from "@atcute/lexicons/syntax";

const actorResolver = new LocalActorResolver({
	handleResolver: new CompositeHandleResolver({
		methods: {
			dns: new DohJsonHandleResolver({ dohUrl: "https://mozilla.cloudflare-dns.com/dns-query" }),
			http: new WellKnownHandleResolver(),
		},
	}),
	didDocumentResolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
});

export const fetchATProtoRecord = async (
	aturi: ParsedResourceUri,
): Promise<Record<string, unknown> | null> => {
	if (!aturi.collection || !aturi.rkey) return null;
	const { pds } = await actorResolver.resolve(aturi.repo);

	const rpc = new Client({
		handler: simpleFetchHandler({
			service: pds,
		}),
	});

	const res = await rpc.get("com.atproto.repo.getRecord", {
		params: {
			repo: aturi.repo,
			collection: aturi.collection,
			rkey: aturi.rkey,
		},
	});

	if (!res.ok) throw new Error(`Failed to fetch record: ${JSON.stringify(res)}`);

	return res.data.value as Record<string, unknown>;
};

export const fetchEventData = async (intent: {
	at?: string;
	url?: string;
	data?: string;
}): Promise<OpenEvnt | null> => {
	if (intent.at) {
		const parsed = parseResourceUri(intent.at);
		const record = await fetchATProtoRecord(parsed);
		if (!record) return null;
		return communityLexicon.from!(JSON.stringify(record), { did: parsed.repo as AtprotoDid });
	} else if (intent.url) {
		const res = await fetch(intent.url);
		if (!res.ok) return null;
		const json = await res.json();
		return OpenEvntSchema.parse(json);
	} else return null;
};
