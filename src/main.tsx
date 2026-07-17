import "@mantine/core/styles.css";
import "./index.css";
import { getInstanceUrl } from "./utils/api.ts";
import { render } from "./app.tsx";
import { INTENT } from "./stores/intent.ts";

if (INTENT && getInstanceUrl())
	window.location.replace(`${getInstanceUrl()}?${new URLSearchParams(INTENT)}`);
else render();
