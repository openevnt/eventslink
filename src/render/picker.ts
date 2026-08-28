import type { Redirectable } from "../utils/instance-list.ts";
import { renderApplicationCards } from "./card.ts";
import { escapeHtml } from "./escape.ts";

export interface PickerOptions {
	hasSource: boolean;
	name: string | null;
	details: string[];
	banner: { url: string; alt?: string } | null;
	redirectables: Redirectable[];
}

const renderEvent = ({ name, details, banner }: PickerOptions): string => `
			<article class="event">
				${
					banner
						? `<img class="event__banner" src="${escapeHtml(banner.url)}" alt="${escapeHtml(banner.alt ?? "")}" />`
						: ""
				}
				<div class="event__body">
					<h1 class="event__name">${escapeHtml(name ?? "")}</h1>
					${
						details.length
							? `<p class="event__meta">${details
									.map((line) => `<span>${escapeHtml(line)}</span>`)
									.join(" ")}</p>`
							: ""
					}
				</div>
			</article>
`;

export const renderPicker = (options: PickerOptions): string => `
			${options.name ? renderEvent(options) : ""}

			${
				options.hasSource
					? `<section>
				${options.name ? `<h2 class="section-title">Open with</h2>` : `<h1 class="section-title">Open with</h1>`}
				${
					options.redirectables.length
						? renderApplicationCards(options.redirectables)
						: `<p class="empty">No app can open this link.</p>`
				}
			</section>`
					: `<p class="empty">No event in this link.</p>`
			}

`;
