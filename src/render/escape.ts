export const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

/**
 * Inside `<script>` the HTML parser looks for `</script` and `<!--` before the
 * script ever reaches the JS parser, so `<` has to leave as a unicode escape.
 * JSON and JS both accept `<` wherever a `<` can legally appear.
 */
export const escapeScriptText = (value: string): string => value.replace(/</g, "\\u003c");
