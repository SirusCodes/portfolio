/**
 * Preact signals-based store for chat state management
 */

import { signal, computed, effect } from "@preact/signals";
import type { Conversation, Message, ActionStatus } from "./types";
import {
	loadConversations,
	saveConversations,
	getCurrentConversationId,
	setCurrentConversationId,
	createConversation,
	addMessage,
	updateLastMessage,
	deleteConversation as deleteConversationStorage,
	clearAllConversations,
	getSortedConversations,
	generateId
} from "./storage";

// Signals
export const conversations = signal<Map<string, Conversation>>(new Map());
export const currentConversationId = signal<string | null>(null);
export const isStreaming = signal(false);
export const currentAction = signal<ActionStatus>(null);
export const isSidebarOpen = signal(false);

// Initialization flag to prevent auto-save before data is loaded
let isInitialized = false;

// Computed values
export const currentConversation = computed(() => {
	const id = currentConversationId.value;
	return id ? conversations.value.get(id) || null : null;
});

export const sortedConversations = computed(() =>
	getSortedConversations(conversations.value)
);

// Initialize from storage
export function initializeChatStore(): void {
	conversations.value = loadConversations();
	currentConversationId.value = getCurrentConversationId();
	isInitialized = true;
}

// Auto-save effect (only after initialization)
effect(() => {
	if (isInitialized) {
		saveConversations(conversations.value);
	}
});

effect(() => {
	if (isInitialized) {
		setCurrentConversationId(currentConversationId.value);
	}
});

/**
 * Create and switch to a new conversation
 */
export function newConversation(): void {
	const conversation = createConversation();
	conversations.value = new Map(conversations.value).set(
		conversation.id,
		conversation
	);
	currentConversationId.value = conversation.id;
	isSidebarOpen.value = false;
}

/**
 * Switch to a conversation
 */
export function switchConversation(id: string): void {
	if (conversations.value.has(id)) {
		currentConversationId.value = id;
		isSidebarOpen.value = false;
	}
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
	const newConversations = deleteConversationStorage(conversations.value, id);
	conversations.value = newConversations;

	if (currentConversationId.value === id) {
		const sorted = getSortedConversations(newConversations);
		currentConversationId.value = sorted[0]?.id || null;
	}
}

/**
 * Clear all conversations
 */
export function clearHistory(): void {
	clearAllConversations();
	conversations.value = new Map();
	currentConversationId.value = null;
}

/**
 * Add a user message
 */
export function addUserMessage(content: string): Message {
	let conversation = currentConversation.value;

	// Create new conversation if none exists
	if (!conversation) {
		const newConv = createConversation(content);
		conversations.value = new Map(conversations.value).set(
			newConv.id,
			newConv
		);
		currentConversationId.value = newConv.id;
		conversation = newConv;
	}

	const message: Message = {
		id: generateId(),
		type: "user",
		content,
		timestamp: Date.now()
	};

	const updated = addMessage(conversation, message);
	conversations.value = new Map(conversations.value).set(updated.id, updated);

	return message;
}

/**
 * Add an assistant message (initially empty for streaming)
 */
export function addAssistantMessage(): Message {
	const conversation = currentConversation.value;
	if (!conversation) throw new Error("No current conversation");

	const message: Message = {
		id: generateId(),
		type: "assistant",
		content: "",
		timestamp: Date.now()
	};

	const updated = addMessage(conversation, message);
	conversations.value = new Map(conversations.value).set(updated.id, updated);

	return message;
}

/**
 * Append content to the last assistant message
 */
export function appendToLastMessage(content: string): void {
	const conversation = currentConversation.value;
	if (!conversation) return;

	const lastMessage = conversation.messages[conversation.messages.length - 1];
	if (!lastMessage || lastMessage.type !== "assistant") return;

	const updated = updateLastMessage(conversation, {
		content: lastMessage.content + content
	});
	conversations.value = new Map(conversations.value).set(updated.id, updated);
}

/**
 * Update the last message with metadata
 */
export function updateLastMessageMetadata(updates: Partial<Message>): void {
	const conversation = currentConversation.value;
	if (!conversation) return;

	const updated = updateLastMessage(conversation, updates);
	conversations.value = new Map(conversations.value).set(updated.id, updated);
}

/**
 * Toggle sidebar (mobile)
 */
export function toggleSidebar(): void {
	isSidebarOpen.value = !isSidebarOpen.value;
}
