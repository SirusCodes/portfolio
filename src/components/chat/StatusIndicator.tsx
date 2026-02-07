/**
 * Status indicator component for showing processing updates
 */

import type { FunctionalComponent } from "preact";
import type { ActionStatus } from "../../lib/chat/types";

interface StatusIndicatorProps {
	action: ActionStatus;
	toolName?: string | null;
}

export const StatusIndicator: FunctionalComponent<StatusIndicatorProps> = ({
	action,
	toolName
}) => {
	if (!action || action === "complete") return null;

	const getStatusText = (): string => {
		switch (action) {
			case "received_prompt":
				return "Received your message...";
			case "calling_tool":
				return toolName ? `Using tool: ${toolName}` : "Calling tool...";
			case "generating":
				return "Generating response...";
			case "processing":
				return "Processing...";
			case "error":
				return "Error occurred";
			default:
				return "Working...";
		}
	};

	return (
		<div class="status-indicator">
			<div class="status-spinner">
				<div class="spinner"></div>
			</div>
			<span class="status-text">{getStatusText()}</span>
		</div>
	);
};
