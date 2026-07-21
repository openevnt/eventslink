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
  - `data`: inline JSON event data

Examples:

- https://eventsl.ink/e?at=at://did:plc:example/community.lexicon.calendar.event/3kxyz
- https://eventsl.ink/event?url=https://deniz.blue/events-data/events/2026/foss/fosdem26.json

## Applications

If you have an application or a website that can handle event links, you can make a pull request to add it to the list of applications in `data/applications.json`.

If you have an Android application you can also add it to the `assetlinks.json` file.
