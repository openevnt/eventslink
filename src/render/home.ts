import type { Redirectable } from "../utils/instance-list.ts";
import { renderApplicationCards } from "./card.ts";
import { escapeHtml } from "./escape.ts";

export interface HomeOptions {
	input: string;
	shareLink: string;
	redirectables: Redirectable[];
}

export const renderHome = ({ input, shareLink, redirectables }: HomeOptions): string => `
			<h1 class="intro">Link redirector for events. The person you send it to picks the app.</h1>

			<form class="panel" method="get" action="/">
				<label for="link">Event link or at:// URI</label>
				<div class="field-row">
					<input
						id="link"
						name="link"
						type="text"
						autocomplete="off"
						spellcheck="false"
						placeholder="https://smokesignal.events/… or at://…"
						value="${escapeHtml(input)}"
						${input && !shareLink ? `aria-invalid="true" aria-describedby="link-error"` : ""}
					/>
					<button type="submit">Create link</button>
				</div>
				${input && !shareLink ? `<p class="field-error" id="link-error">Unsupported link.</p>` : ""}
			</form>

			${
				shareLink
					? `<div class="panel share-result" id="share-result">
				<label for="share-link">Shareable link</label>
				<input id="share-link" readonly value="${escapeHtml(shareLink)}" />
				<div class="button-row">
					<a class="button button--quiet" href="${escapeHtml(shareLink)}" target="_blank" rel="noopener noreferrer">🔗 Preview</a>
				</div>
			</div>`
					: ""
			}

			<p class="note">
				Supported:
				<a href="https://evnt.directory" target="_blank" rel="noopener noreferrer">Open Evnt</a>,
				atmo.rsvp, Smoke Signal, PDSls,
				<a href="https://atproto.com" target="_blank" rel="noopener noreferrer">AT-URIs</a>.
			</p>

			<section>
				<h2 class="section-title">Apps</h2>
				${renderApplicationCards(redirectables)}
			</section>

${shareLink ? ENHANCEMENT : ""}
`;

/**
 * Copy and Share exist only where the browser has the APIs, so they are added
 * here rather than rendered as buttons the server cannot know will work.
 */
const ENHANCEMENT = `
			<script>
				(function () {
					var row = document.querySelector("#share-result .button-row");
					var link = document.getElementById("share-link").value;
					var add = function (text, onclick) {
						var button = document.createElement("button");
						button.type = "button";
						button.className = "button button--quiet";
						button.textContent = text;
						button.onclick = onclick.bind(null, button);
						row.insertBefore(button, row.firstChild);
					};
					if (navigator.canShare && navigator.canShare({ url: link })) {
						add("📤 Share", function () {
							navigator.share({ url: link });
						});
					}
					if (navigator.clipboard) {
						add("📋 Copy", function (button) {
							navigator.clipboard.writeText(link).then(function () {
								button.textContent = "✓ Copied";
							});
						});
					}
				})();
			</script>`;
