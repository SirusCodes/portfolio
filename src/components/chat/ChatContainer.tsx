/**
 * Main chat container component
 */

import type { FunctionalComponent } from "preact";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import {
	currentConversation,
	isStreaming,
	newConversation,
	isSidebarOpen,
	toggleSidebar
} from "../../lib/chat/store";
import {
	useMobile,
	useInitialPrompt,
	useChatInit,
	useChatStreaming
} from "../../lib/chat/hooks";
import { useEffect, useRef } from "preact/hooks";
import { SuggestionChips } from "./SuggestionChips";

interface ChatContainerProps {
	apiUrl: string;
}

export const ChatContainer: FunctionalComponent<ChatContainerProps> = ({
	apiUrl
}) => {
	// Get initial prompt from URL
	const initialPrompt =
		new URLSearchParams(window.location.search).get("prompt") ?? undefined;

	// Initialize chat store
	useChatInit();

	// Mobile detection
	const isMobile = useMobile(900);

	// Handle initial prompt
	useInitialPrompt(initialPrompt);

	// Chat streaming functionality
	const { handleSendMessage } = useChatStreaming(apiUrl);

	const conversation = currentConversation.value;
	const logRef = useRef<HTMLDivElement | null>(null);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (!logRef.current) {
			return;
		}
		logRef.current.scrollTop = logRef.current.scrollHeight;
	}, [conversation?.messages]);

	return (
		<div class="chat-body">
			<div class="chat-page">
				<Sidebar isMobile={isMobile} />

				<div class="chat-main">
					<ChatHeader />

					<div class="chat-log" ref={logRef}>
						{conversation && conversation.messages.length > 0 ? (
							<MessageList messages={conversation.messages} />
						) : (
							<SuggestionChips onSelected={handleSendMessage} />
						)}
					</div>

					<ChatInput
						onSend={handleSendMessage}
						disabled={isStreaming.value}
						placeholder={
							isStreaming.value
								? "Waiting for response..."
								: "Ask me anything..."
						}
						initialValue={initialPrompt}
					/>
				</div>

				<div
					class={`chat-sidebar-overlay ${isSidebarOpen.value ? "open" : ""}`}
					onClick={toggleSidebar}
				></div>
			</div>
		</div>
	);
};
