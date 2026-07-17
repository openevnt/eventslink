import { parseIntent } from "@lib/intent";

export const INTENT = parseIntent(new URL(window.location.href)) ?? null;

console.log("Parsed intent:", INTENT);
