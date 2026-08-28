import { escapeHtml } from "./escape.ts";

export interface DocumentOptions {
	title: string;
	description?: string;
	language?: string;
	head?: string;
	body: string;
}

export const renderDocument = ({
	title,
	description,
	language = "en",
	head = "",
	body,
}: DocumentOptions): string =>
	`<!doctype html>
<html lang="${escapeHtml(language)}">
	<head>
		<meta charset="UTF-8" />
		<title>${escapeHtml(title)}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
		<meta name="color-scheme" content="light dark" />
		<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f9fbfb" />
		<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#161b1d" />
${
	description
		? `		<meta name="description" content="${escapeHtml(description)}" />
`
		: ""
}
		<link rel="stylesheet" href="/styles.css" />
${head}
	</head>
	<body>
		<header class="nav">
			<div class="nav__inner">
				<a class="nav__brand" href="/"><span aria-hidden="true">📆</span> eventsl.ink</a>
			</div>
		</header>
		<main class="main">
${body}
		</main>
		<footer class="footer">
			<div class="footer__inner">
				<a href="https://github.com/openevnt/eventslink" target="_blank" rel="noopener noreferrer">Source code</a>
				<span aria-hidden="true">·</span>
				<a href="https://github.com/openevnt/eventslink/issues" target="_blank" rel="noopener noreferrer">Give feedback</a>
				<span aria-hidden="true">·</span>
				<a href="https://github.com/openevnt/eventslink/blob/main/data/applications.json" target="_blank" rel="noopener noreferrer">Add your application</a>
			</div>
		</footer>
	</body>
</html>
`;
