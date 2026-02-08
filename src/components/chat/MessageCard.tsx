/**
 * Message card component for rendering individual chat messages
 */

import type { FunctionalComponent } from "preact";
import { useMemo } from "preact/hooks";
import type { Message } from "../../lib/chat/types";
import { TelemetryBlock } from "./TelemetryBlock";
import { isStreaming, currentAction } from "../../lib/chat/store";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MessageCardProps {
	message: Message;
	isLastMessage?: boolean;
}

export const MessageCard: FunctionalComponent<MessageCardProps> = ({
	message,
	isLastMessage = false
}) => {
	// Convert message type to role for display
	const getRole = () => {
		const type = message.type as string;
		if (type === "user" || type === "HumanMessage") {
			return "user";
		}
		return "assistant";
	};

	const getDisplayRole = () => {
		return getRole() === "user" ? "you" : "assistant";
	};

	const role = getRole();
	const showStreamingStatus = isLastMessage && role === "assistant" && isStreaming.value;

	// Render markdown content safely
	const renderedContent = useMemo(() => {
		const content = message.content || (showStreamingStatus ? "" : "...");
		if (!content || content === "...") return content;

		try {
			const rawHtml = marked.parse(content) as string;
			return DOMPurify.sanitize(rawHtml);
		} catch (error) {
			console.error("Failed to parse markdown:", error);
			return content;
		}
	}, [message.content, showStreamingStatus]);

	return (
		<div
			class={`chat-message ${role}`}
			data-message-id={message.id}
		>
			<div class="chat-message-role">
				{getDisplayRole()}
			</div>
			{typeof renderedContent === "string" && renderedContent.startsWith("<") ? (
				<div
					class="chat-message-content markdown-body"
					dangerouslySetInnerHTML={{ __html: renderedContent }}
				/>
			) : (
				<div class="chat-message-content">{renderedContent}</div>
			)}
			{role === "assistant" && (
				<TelemetryBlock
					tokens={message.tokens}
					isCached={message.is_cached}
					toolName={message.tool_name}
					isStreaming={showStreamingStatus}
					status={currentAction.value}
				/>
			)}
		</div>
	);
};
