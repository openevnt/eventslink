import { INTENT } from "../stores/intent";
import { getRedirectablesForIntent } from "../utils/instance-list";

export const usePublicInstances = () => {
	return getRedirectablesForIntent(INTENT);
};
