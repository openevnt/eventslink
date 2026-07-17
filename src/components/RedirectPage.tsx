import { Anchor, Collapse, Fieldset, Stack, Text, Title } from "@mantine/core";
import { usePublicInstances } from "../hooks/usePublicInstances";
import { ApplicationCard } from "./ApplicationCard";
import { useEventSummary } from "../hooks/useEventSummary";

export const RedirectPage = () => {
	const redirectables = usePublicInstances();
	const summary = useEventSummary();

	return (
		<Stack align="center" w="100%">
			<Collapse w="100%" expanded={!!summary}>
				<Stack w="100%">
					<Fieldset
						legend={
							<Text inherit inline c="dimmed">
								Event Summary
							</Text>
						}
						w="100%"
					>
						<Text fz="sm" style={{ whiteSpace: "pre-wrap" }}>
							{summary}
						</Text>
					</Fieldset>
				</Stack>
			</Collapse>

			<Title ta="center" order={3} fw="normal" my="md">
				Choose an app to continue
			</Title>

			<Stack gap={0} w="100%">
				<Stack w="100%">
					{redirectables.map((redirectable) => (
						<ApplicationCard key={redirectable.url} info={redirectable} />
					))}
				</Stack>
			</Stack>

			<Stack align="start" w="100%" mt="xl" ta="center">
				<Stack gap="xs" fz="sm" mb="md" w="100%">
					<Text inherit>View events without being tied to a specific application.</Text>

					<Text inherit>
						You can view the{" "}
						<Anchor
							inherit
							href="https://github.com/openevnt/eventslink"
							target="_blank"
							rel="noopener noreferrer"
						>
							source code
						</Anchor>{" "}
						or{" "}
						<Anchor
							inherit
							href="https://github.com/openevnt/eventslink/issues"
							target="_blank"
							rel="noopener noreferrer"
						>
							give feedback
						</Anchor>{" "}
						on GitHub.
					</Text>
				</Stack>
			</Stack>
		</Stack>
	);
};
