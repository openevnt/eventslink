import { Container, Divider, Text } from "@mantine/core";
import { HomePage } from "./HomePage";
import { RedirectPage } from "./RedirectPage";
import { INTENT } from "../stores/intent";

export const Page = () => {
	return (
		<Container size="xs" my="md">
			<Divider aria-hidden ff="monospace" my="sm" mx="xl" label={<Text>📆 eventsl.ink 🔗</Text>} />

			{INTENT ? <RedirectPage /> : <HomePage />}
		</Container>
	);
};
