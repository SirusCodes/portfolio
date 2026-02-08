/**
 * Inline telemetry display component with elegant styling
 */

import type { FunctionalComponent } from "preact";
import type { TokenInfo, ActionStatus } from "../../lib/chat/types";

interface TelemetryBlockProps {
	tokens?: TokenInfo;
	isCached?: boolean;
	toolName?: string | null;
	isStreaming?: boolean;
	status?: ActionStatus;
}

export const TelemetryBlock: FunctionalComponent<TelemetryBlockProps> = ({
	tokens,
	isCached = false,
	toolName,
	isStreaming = false,
	status
}) => {
	// Show live status during streaming
	if (isStreaming) {
		const getStatusText = (): string => {
			switch (status) {
				case "received_prompt":
					return "Thinking...";
				case "calling_tool":
					return toolName ? `🔧 Using ${toolName}` : "🔧 Using tool...";
				case "generating":
					return "✨ Generating response...";
				case "processing":
					return "⚙️ Processing...";
				default:
					return "💭 Thinking...";
			}
		};

		return (
			<div class="chat-telemetry streaming">
				<div class="telemetry-status">
					<span class="status-pulse"></span>
					<span class="status-text">{getStatusText()}</span>
				</div>
			</div>
		);
	}

	// Don't show telemetry block if no data
	if (!tokens && !isCached && !toolName) {
		return null;
	}

	const inputTokens = tokens?.input_tokens ?? 0;
	const outputTokens = tokens?.output_tokens ?? 0;

	return (
		<div class="chat-telemetry">
			{/* Cache hit indicator - only show if cached */}
			{isCached && (
				<span class="telemetry-badge cache-hit">⚡ Cached</span>
			)}

			{/* Tool name if present */}
			{toolName && (
				<span class="telemetry-badge tool-used">🔧 {toolName}</span>
			)}

			{/* Token counts with icons */}
			{tokens && (
				<div class="telemetry-tokens">
					{inputTokens > 0 && (
						<span class="token-count input">
							<span class="token-icon">📥</span>
							<span class="token-value">{inputTokens.toLocaleString()}</span>
						</span>
					)}
					{outputTokens > 0 && (
						<span class="token-count output">
							<span class="token-icon">📤</span>
							<span class="token-value">{outputTokens.toLocaleString()}</span>
						</span>
					)}
				</div>
			)}
		</div>
	);
};
