/**
 * Local storage manager for conversation threads
 */

import type { Conversation, Message } from "./types";

const STORAGE_KEY = "chat_conversations";
const CURRENT_CONVERSATION_KEY = "chat_current_conversation_id";

/**
 * Generate a unique ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a conversation title from the first message
 */
export function generateTitle(firstMessage: string): string {
	const words = firstMessage.trim().split(/\s+/).slice(0, 6);
	return (
		words.join(" ") + (firstMessage.split(/\s+/).length > 6 ? "..." : "")
	);
}

/**
 * Load all conversations from local storage
 */
export function loadConversations(): Map<string, Conversation> {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return new Map();

		const data: Record<string, Conversation> = JSON.parse(stored);
		return new Map(Object.entries(data));
	} catch (error) {
		console.error("Failed to load conversations:", error);
		return new Map();
	}
}

/**
 * Save conversations to local storage
 */
export function saveConversations(
	conversations: Map<string, Conversation>
): void {
	try {
		const data = Object.fromEntries(conversations);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.error("Failed to save conversations:", error);
	}
}

/**
 * Get current conversation ID
 */
export function getCurrentConversationId(): string | null {
	try {
		return localStorage.getItem(CURRENT_CONVERSATION_KEY);
	} catch {
		return null;
	}
}

/**
 * Set current conversation ID
 */
export function setCurrentConversationId(id: string | null): void {
	try {
		if (id) {
			localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
		} else {
			localStorage.removeItem(CURRENT_CONVERSATION_KEY);
		}
	} catch (error) {
		console.error("Failed to set current conversation ID:", error);
	}
}

/**
 * Create a new conversation
 */
export function createConversation(firstMessage?: string): Conversation {
	const now = Date.now();
	return {
		id: generateId(),
		title: firstMessage ? generateTitle(firstMessage) : "New Conversation",
		messages: [],
		created_at: now,
		updated_at: now
	};
}

/**
 * Add a message to a conversation
 */
export function addMessage(
	conversation: Conversation,
	message: Message
): Conversation {
	return {
		...conversation,
		messages: [...conversation.messages, message],
		updated_at: Date.now()
	};
}

/**
 * Update the last message in a conversation
 */
export function updateLastMessage(
	conversation: Conversation,
	updates: Partial<Message>
): Conversation {
	if (conversation.messages.length === 0) return conversation;

	const messages = [...conversation.messages];
	const lastMessage = messages[messages.length - 1];
	messages[messages.length - 1] = { ...lastMessage, ...updates };

	return {
		...conversation,
		messages,
		updated_at: Date.now()
	};
}

/**
 * Delete a conversation
 */
export function deleteConversation(
	conversations: Map<string, Conversation>,
	id: string
): Map<string, Conversation> {
	const newConversations = new Map(conversations);
	newConversations.delete(id);
	return newConversations;
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(CURRENT_CONVERSATION_KEY);
	} catch (error) {
		console.error("Failed to clear conversations:", error);
	}
}

/**
 * Get sorted conversation list (by updated_at, descending)
 */
export function getSortedConversations(
	conversations: Map<string, Conversation>
): Conversation[] {
	return Array.from(conversations.values()).sort(
		(a, b) => b.updated_at - a.updated_at
	);
}
