/**
 * Chat sidebar component with conversation list
 */

import type { FunctionalComponent } from "preact";
import {
	currentConversationId,
	newConversation,
	switchConversation,
	clearHistory,
	isSidebarOpen,
	toggleSidebar
} from "../../lib/chat/store";
import { ThreadList } from "./ThreadList";

interface SidebarProps {
	isMobile?: boolean;
}

export const Sidebar: FunctionalComponent<SidebarProps> = ({
	isMobile = false
}) => {
	const handleNewThread = () => {
		newConversation();
		if (isMobile) {
			toggleSidebar();
		}
	};

	const handleClearHistory = () => {
		clearHistory();
		if (isMobile) {
			toggleSidebar();
		}
	};

	const handleSelectThread = (threadId: string) => {
		switchConversation(threadId);
		if (isMobile) {
			toggleSidebar();
		}
	};

	const sidebarClass = `chat-sidebar ${isSidebarOpen.value ? "open" : ""}`;

	return (
		<aside class={sidebarClass}>
			<div class="chat-sidebar-title">Chat Threads</div>
			<div class="chat-sidebar-actions">
				<button class="chat-button" type="button" onClick={handleNewThread}>
					New thread
				</button>
				<button
					class="chat-button subtle"
					type="button"
					onClick={handleClearHistory}
				>
					Clear history
				</button>
			</div>
			<ThreadList
				activeThreadId={currentConversationId.value}
				onSelect={handleSelectThread}
			/>
		</aside>
	);
};
