/**
 * Thread list component for displaying conversation threads
 */

import type { FunctionalComponent } from "preact";
import { computed } from "@preact/signals";
import { conversations } from "../../lib/chat/store";
import type { Conversation } from "../../lib/chat/types";

interface ThreadListProps {
	activeThreadId: string | null;
	onSelect: (threadId: string) => void;
}

// Helper function to format date
const formatDate = (timestamp: number): string => {
	try {
		return new Intl.DateTimeFormat("en", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}).format(new Date(timestamp));
	} catch {
		return "";
	}
};

// Computed sorted threads
const sortedConversations = computed(() => {
	const convArray = Array.from(conversations.value.values());
	return convArray.sort((a, b) => b.updated_at - a.updated_at);
});

export const ThreadList: FunctionalComponent<ThreadListProps> = ({
	activeThreadId,
	onSelect
}) => {
	const threads = sortedConversations.value;

	return (
		<ul class="chat-thread-list">
			{threads.map((thread) => (
				<li key={thread.id}>
					<button
						type="button"
						class={`chat-thread-button ${
							thread.id === activeThreadId ? "active" : ""
						}`}
						onClick={() => onSelect(thread.id)}
					>
						<div class="chat-thread-title">
							{thread.title || "Untitled"}
						</div>
						<div class="chat-thread-meta">
							{formatDate(thread.updated_at)}
						</div>
					</button>
				</li>
			))}
		</ul>
	);
};
