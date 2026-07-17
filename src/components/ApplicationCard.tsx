import { Anchor, Box, Group, Image, Paper, Stack, Text } from "@mantine/core";
import type { Redirectable } from "../utils/instance-list";

export const ApplicationCard = ({ info }: { info: Redirectable }) => {
	return (
		<Anchor
			href={info.url}
			unstyled
			w="100%"
			c="unset"
			td="unset"
			style={{
				cursor: "pointer",
			}}
		>
			<Paper withBorder radius="xl" className="instance-card" shadow="sm" py="xs" px="md">
				<Group wrap="nowrap" gap="xs">
					<Image
						src={info.faviconUrl}
						alt={`${info.title} favicon`}
						w={32}
						width={32}
						h={32}
						bdrs={info.faviconRadius ?? "50%"}
						aria-hidden
					/>
					<Stack gap={0} flex="1">
						<Text>{info.title}</Text>
						<Text fz="xs" c="dimmed">
							{info.label}
						</Text>
					</Stack>
					<Box>
						<Text w={32} h="100%" ta="center" c="dimmed" fw={900} fz="lg" aria-hidden>
							↗
						</Text>
					</Box>
				</Group>
			</Paper>
		</Anchor>
	);
};
