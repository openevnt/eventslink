# eventsl.ink

Applications can use the `eventsl.ink` service to create links that open in compatible applications. This allows users to share events across different platforms while maintaining a consistent experience.

```mermaid
graph LR
	A([Application A])
	B([Application B])
	C([Application C])
	Redirector(eventsl.ink)

	Redirector -.-> A
	Redirector -.-> B
	Redirector -->|Preferred App| C

	A -->|Share link| Redirector
```

## Link Format

The links are path-based with query parameters for intent parsing. The base URL is `https://eventsl.ink`.

- Show an event: `/event` or `/e`

Search parameters for event links:

- One of the following:
  - `at`: an AT Protocol event record URI
  - `url`: an HTTP URL pointing to a JSON event payload

Optional, affecting how the event summary and metadata are rendered:

- `language` (or `lang`): a BCP 47 tag, defaulting to the request's `Accept-Language`
- `timezone` (or `tz`): an IANA zone, defaulting to the most common zone across the
  event's instances, then UTC

Examples:

- https://eventsl.ink/e?at=at://did:plc:example/community.lexicon.calendar.event/3kxyz
- https://eventsl.ink/event?url=https://deniz.blue/events-data/events/2026/foss/fosdem26.json

## Applications

If you have an application or a website that can handle event links, you can make a pull request to add it to the list of applications in `data/applications.json`.

If you have an Android application you can also add it to the `assetlinks.json` file.

## Development

The site is a Cloudflare Worker that renders HTML on the server; visitors receive
no JavaScript bundle. Static files under `public/` are served by the assets
binding.

```sh
pnpm install
pnpm dev
```

`pnpm typecheck` runs `tsc`, and `pnpm deploy` publishes with wrangler.
