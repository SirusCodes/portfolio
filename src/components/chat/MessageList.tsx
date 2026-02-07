/**
 * Message list component
 */

import type { FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { Message } from "../../lib/chat/types";
import { StatusIndicator } from "./StatusIndicator";
import { currentAction } from "../../lib/chat/store";

interface MessageListProps {
	messages: Message[];
}

export const MessageList: FunctionalComponent<MessageListProps> = ({
	messages
}) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages.length]);

	const formatTimestamp = (timestamp: number): string => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit"
		});
	};

	return (
		<div class="messages-list">
			{messages.length === 0 ? (
				<div class="empty-chat">
					<div class="welcome-message">
						<h3>Start a conversation</h3>
						<p>Ask me anything about Darshan Rander</p>
					</div>
				</div>
			) : (
				<>
					{messages.map((message) => (
						<div key={message.id} class={`message ${message.type}`}>
							<div class="message-content">
								<div class="message-text">
									{message.content}
								</div>
								{message.status &&
									message.type === "assistant" && (
										<StatusIndicator
											action={message.status}
											toolName={message.tool_name}
										/>
									)}
								<div class="message-meta">
									<span class="message-time">
										{formatTimestamp(message.timestamp)}
									</span>
									{message.tokens &&
										message.type === "assistant" && (
											<span class="message-tokens">
												{message.is_cached && "⚡ "}
												{message.tokens.input_tokens &&
													`📥 ${message.tokens.input_tokens}`}
												{message.tokens.output_tokens &&
													` 📤 ${message.tokens.output_tokens}`}
												{message.tokens.total_tokens &&
													` (${message.tokens.total_tokens} total)`}
											</span>
										)}
								</div>
							</div>
						</div>
					))}
					{currentAction.value &&
						currentAction.value !== "complete" && (
							<div class="message assistant streaming">
								<div class="message-content">
									<StatusIndicator
										action={currentAction.value}
									/>
								</div>
							</div>
						)}
				</>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
};
