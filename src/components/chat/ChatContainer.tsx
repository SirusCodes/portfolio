/**
 * Main chat container component
 */

import type { FunctionalComponent } from "preact";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
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

interface ChatContainerProps {
	apiUrl: string;
	initialPrompt?: string;
}

export const ChatContainer: FunctionalComponent<ChatContainerProps> = ({
	apiUrl,
	initialPrompt
}) => {
	// Initialize chat store
	useChatInit();

	// Mobile detection
	const isMobile = useMobile(900);

	// Handle initial prompt
	useInitialPrompt(initialPrompt);

	// Chat streaming functionality
	const { handleSendMessage } = useChatStreaming(apiUrl);

	const conversation = currentConversation.value;

	return (
		<div class="chat-container">
			{isMobile && (
				<div class="mobile-header">
					<button
						class="hamburger-button"
						onClick={toggleSidebar}
						aria-label="Open sidebar"
					>
						<div class="hamburger-icon">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</button>
					<h1>ChatAbout</h1>
				</div>
			)}

			<Sidebar isMobile={isMobile} />

			<main class="chat-main">
				{conversation ? (
					<>
						<div class="chat-header">
							<div class="header-content">
								<h1>ChatAbout</h1>
								<p class="header-subtitle">
									Streaming assistant with thread history
								</p>
							</div>
							<div class="header-status">
								{isStreaming.value ? "Streaming" : "Idle"}
							</div>
						</div>
						<MessageList messages={conversation.messages} />
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
					</>
				) : (
					<div class="no-conversation">
						<div class="welcome-container">
							<h2>Welcome to ChatAbout</h2>
							<p>Start a new thread to begin the conversation</p>
							<button
								class="btn-start-chat"
								onClick={() => newConversation()}
							>
								Start New Thread
							</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};
