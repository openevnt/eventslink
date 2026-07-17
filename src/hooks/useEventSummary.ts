import { useEffect, useState } from "react";
import { INTENT } from "../stores/intent";
import { fetchEventData } from "../lib/resolve-data";
import { EmojiFormatter } from "@evnt/pretty";

export const useEventSummary = () => {
	const [summary, setSummary] = useState<string | null>(null);

	useEffect(() => {
		let controller = new AbortController();

		if (INTENT && INTENT.type === "event") {
			fetchEventData(INTENT).then((data) => {
				if (!data || controller.signal.aborted) return;
				const language = navigator.language || navigator.languages[0] || "en";
				const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
				const fmt = new EmojiFormatter({
					...EmojiFormatter.emojiDefaults,
					language,
					timezone,
				});
				const summary = fmt.formatEvent(data);
				setSummary(summary);
			});
		}

		return () => controller.abort();
	}, [INTENT]);

	return summary;
};
