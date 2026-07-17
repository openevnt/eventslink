import { useEffect, useState } from "react";
import { BroadcastChannelKey, getInstanceUrl } from "../utils/api";

export const usePreferredInstanceUrl = () => {
	const [preferredInstanceUrl, setPreferredInstanceUrl] = useState<string | null>(getInstanceUrl());

	useEffect(() => {
		const channel = new BroadcastChannel(BroadcastChannelKey);
		channel.onmessage = () => setPreferredInstanceUrl(getInstanceUrl());
		return () => channel.close();
	}, []);

	return preferredInstanceUrl;
};
