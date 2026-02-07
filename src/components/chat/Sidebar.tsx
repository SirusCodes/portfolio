/**
 * Chat sidebar component with conversation list
 */

import type { FunctionalComponent } from "preact";
import {
	sortedConversations,
	currentConversationId,
	newConversation,
	switchConversation,
	deleteConversation,
	clearHistory,
	isSidebarOpen,
	toggleSidebar
} from "../../lib/chat/store";

interface SidebarProps {
	isMobile?: boolean;
}

export const Sidebar: FunctionalComponent<SidebarProps> = ({
	isMobile = false
}) => {
	const handleNewChat = () => {
		newConversation();
	};

	const handleClearHistory = () => {
		if (
			confirm("Are you sure you want to clear all conversation history?")
		) {
			clearHistory();
		}
	};

	const handleSelectConversation = (id: string) => {
		switchConversation(id);
	};

	const handleDeleteConversation = (e: Event, id: string) => {
		e.stopPropagation();
		if (confirm("Delete this conversation?")) {
			deleteConversation(id);
		}
	};

	const formatTimestamp = (timestamp: number): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffTime = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		// Format as "Mon DD, HH:MM AM/PM" for recent items
		if (diffDays === 0 || diffDays === 1) {
			const months = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			];
			const month = months[date.getMonth()];
			const day = date.getDate();
			const hours = date.getHours();
			const minutes = date.getMinutes().toString().padStart(2, "0");
			const ampm = hours >= 12 ? "PM" : "AM";
			const displayHours = hours % 12 || 12;

			return `${month} ${day}, ${displayHours}:${minutes} ${ampm}`;
		}

		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	};

	const sidebarClass = isMobile
		? `chat-sidebar mobile ${isSidebarOpen.value ? "open" : ""}`
		: "chat-sidebar desktop";

	return (
		<>
			{isMobile && isSidebarOpen.value && (
				<div class="sidebar-overlay" onClick={toggleSidebar} />
			)}
			<aside class={sidebarClass}>
				<div class="sidebar-header">
					<h2>Chat Threads</h2>
					{isMobile && (
						<button
							class="close-button"
							onClick={toggleSidebar}
							aria-label="Close sidebar"
						>
							✕
						</button>
					)}
				</div>

				<div class="sidebar-actions">
					<button class="btn-new-chat" onClick={handleNewChat}>
						<span class="icon">+</span>
						New thread
					</button>
				</div>

				<div class="conversations-list">
					{sortedConversations.value.length === 0 ? (
						<div class="empty-state">
							<p>No conversations yet</p>
							<p class="hint">Start a new thread to begin</p>
						</div>
					) : (
						sortedConversations.value.map((conv) => (
							<div
								key={conv.id}
								class={`conversation-item ${
									currentConversationId.value === conv.id
										? "active"
										: ""
								}`}
								onClick={() =>
									handleSelectConversation(conv.id)
								}
							>
								<div class="conversation-content">
									<div class="conversation-title">
										{conv.title}
									</div>
									<div class="conversation-meta">
										<span class="conversation-date">
											{formatTimestamp(conv.updated_at)}
										</span>
										<span class="conversation-count">
											{conv.messages.length} messages
										</span>
									</div>
								</div>
								<button
									class="delete-button"
									onClick={(e) =>
										handleDeleteConversation(e, conv.id)
									}
									aria-label="Delete conversation"
								>
									🗑️
								</button>
							</div>
						))
					)}
				</div>

				<div class="sidebar-footer">
					<button
						class="btn-clear-history"
						onClick={handleClearHistory}
						disabled={sortedConversations.value.length === 0}
					>
						Clear History
					</button>
				</div>
			</aside>
		</>
	);
};
