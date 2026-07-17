import { useState } from "react";
import {
	Anchor,
	Box,
	Button,
	Collapse,
	CopyButton,
	Group,
	Image,
	Input,
	Paper,
	Space,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { usePublicInstances } from "../hooks/usePublicInstances";
import { ApplicationCard } from "./ApplicationCard";
import { inferShareLink } from "../utils/inferShareLink";

export const HomePage = () => {
	const redirectables = usePublicInstances();
	const [inputValue, setInputValue] = useState("");

	const link = inferShareLink(inputValue);

	const canShare = !!link && navigator.canShare?.({ url: link });

	return (
		<Stack>
			<Text fz="lg" ta="center">
				Create shareable links to events without being tied to a specific application, platform or
				website.
			</Text>

			<Space h="md" />

			<TextInput
				value={inputValue}
				onChange={(e) => setInputValue(e.currentTarget.value)}
				label="Create a shareable link to an event"
				placeholder="Enter a link to an event"
				error={inputValue && !link ? "Unsupported link..." : false}
				inputWrapperOrder={["label", "input", "error", "description"]}
				styles={{ label: { marginBottom: "var(--mantine-spacing-sm)" } }}
				description={
					<Stack c="dimmed" gap={0}>
						<Text span inherit>
							Supported: Open Evnt, atmo.rsvp, Smoke Signal, PDSls, AT-URIs
						</Text>
					</Stack>
				}
			/>

			<Collapse expanded={!!link}>
				<Group grow>
					<CopyButton value={link}>
						{({ copied, copy }) => (
							<Button
								color={copied ? "teal" : "blue"}
								onClick={copy}
								leftSection={copied ? "✓" : "📋"}
								variant="outline"
							>
								{copied ? "Copied" : "Copy"}
							</Button>
						)}
					</CopyButton>
					{canShare && (
						<Button
							color="blue"
							variant="light"
							leftSection={"📤"}
							onClick={() =>
								navigator.share?.({
									url: link,
								})
							}
						>
							Share
						</Button>
					)}
					<Button
						component="a"
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						variant="outline"
						color="blue"
						leftSection={"🔗"}
					>
						Preview
					</Button>
				</Group>
			</Collapse>

			<Space h="xl" />

			<Stack gap="xs">
				<Input.Label>This website supports:</Input.Label>
				<Group grow align="stretch">
					{(
						[
							{
								label: "Open Evnt",
								icon: "https://evnt.directory/favicon.ico",
								content: (
									<Text inline inherit span>
										An interoperable modern data format for events.{" "}
										<Anchor
											inherit
											inline
											href="https://evnt.directory"
											target="_blank"
											rel="noopener noreferrer"
										>
											More details ↗
										</Anchor>
									</Text>
								),
							},
							{
								label: "AT Protocol",
								icon: "https://atproto.com/favicon.ico",
								content: (
									<Text span inherit>
										Decentralized social networking protocol.{" "}
										<Anchor
											inherit
											inline
											href="https://atproto.com"
											target="_blank"
											rel="noopener noreferrer"
										>
											More details ↗
										</Anchor>
									</Text>
								),
							},
						] as const
					).map(({ label, content, icon }) => (
						<Paper withBorder p="xs">
							<Group gap="xs" align="start">
								<Image
									src={icon}
									alt={label}
									fit="contain"
									width={32}
									w={32}
									height={32}
									aria-hidden
								/>
								<Stack gap={4} flex="1">
									<Text fw="bold" fz="sm" inline inherit>
										{label}
									</Text>
									<Box fz="sm">{content}</Box>
								</Stack>
							</Group>
						</Paper>
					))}
				</Group>
			</Stack>

			<Space h="xl" />

			<Stack gap="sm">
				<Input.Label>Or select an app to visit:</Input.Label>
				<Stack>
					{redirectables.map((redirectable) => (
						<ApplicationCard key={redirectable.url} info={redirectable} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};
