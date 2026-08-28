import type { Redirectable } from "../utils/instance-list.ts";
import { escapeHtml } from "./escape.ts";

const faviconRadius = (radius: number | undefined): string =>
	radius === undefined ? "50%" : `${radius}px`;

const renderApplicationCard = (info: Redirectable): string => `
	<a class="instance-card" href="${escapeHtml(info.url ?? "")}">
		<img
			class="instance-card__icon"
			src="${escapeHtml(info.faviconUrl ?? "")}"
			alt=""
			aria-hidden="true"
			width="32"
			height="32"
			style="border-radius: ${faviconRadius(info.faviconRadius)}"
		/>
		<span class="instance-card__text">
			<span class="instance-card__title">${escapeHtml(info.title ?? "")}</span>
			${
				info.label && info.label !== info.title
					? `<span class="instance-card__label">${escapeHtml(info.label)}</span>`
					: ""
			}
		</span>
	</a>
`;

export const renderApplicationCards = (infos: Redirectable[]): string =>
	`<div class="card-list">${infos.map(renderApplicationCard).join("")}</div>`;
