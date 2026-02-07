/**
 * Custom hooks for chat functionality
 */

import { useEffect, useRef, useState } from "preact/hooks";
import {
	currentConversation,
	isStreaming,
	currentAction,
	addUserMessage,
	addAssistantMessage,
	appendToLastMessage,
	updateLastMessageMetadata,
	newConversation,
	initializeChatStore
} from "./store";
import { streamChat } from "./api";
import type { StreamEvent } from "./types";

/**
 * Hook for detecting mobile viewport
 * @param breakpoint - Width breakpoint for mobile detection (default: 900)
 */
export function useMobile(breakpoint: number = 900) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= breakpoint);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, [breakpoint]);

	return isMobile;
}

/**
 * Hook for handling initial prompt from URL or props
 * @param initialPrompt - The initial prompt to process
 */
export function useInitialPrompt(initialPrompt?: string) {
	const initialPromptSentRef = useRef(false);

	useEffect(() => {
		if (initialPrompt && !initialPromptSentRef.current) {
			// Ensure a new conversation exists for the initial prompt
			if (!currentConversation.value) {
				newConversation();
			}
			initialPromptSentRef.current = true;
		}
	}, [initialPrompt]);
}

/**
 * Hook for initializing chat store
 */
export function useChatInit() {
	useEffect(() => {
		initializeChatStore();
	}, []);
}

/**
 * Hook for handling chat streaming functionality
 * @param apiUrl - The API URL for streaming
 */
export function useChatStreaming(apiUrl: string) {
	const abortControllerRef = useRef<AbortController | null>(null);

	const handleStreamEvent = (event: StreamEvent) => {
		if (event.type === "AIMessage" && event.content) {
			appendToLastMessage(event.content);
		}

		if (event.action) {
			currentAction.value = event.action;
			updateLastMessageMetadata({
				status: event.action,
				tool_name: event.tool_name
			});
		}

		if (event.tokens) {
			updateLastMessageMetadata({
				tokens: event.tokens,
				is_cached: event.is_cached
			});
		}

		if (event.type === "complete") {
			currentAction.value = "complete";
			isStreaming.value = false;
		}

		if (event.type === "error") {
			currentAction.value = "error";
			if (event.content) {
				appendToLastMessage(`\n\n[Error: ${event.content}]`);
			}
			isStreaming.value = false;
		}
	};

	const handleSendMessage = async (message: string) => {
		if (isStreaming.value) return;

		// Add user message
		addUserMessage(message);

		// Prepare assistant message
		const assistantMessage = addAssistantMessage();

		// Get current thread ID
		const threadId = currentConversation.value?.id;
		if (!threadId) {
			console.error("No thread ID available");
			return;
		}

		// Start streaming
		isStreaming.value = true;
		currentAction.value = "received_prompt";

		try {
			abortControllerRef.current = await streamChat(
				apiUrl,
				{ thread_id: threadId, prompt: message },
				{
					onEvent: (event: StreamEvent) => {
						handleStreamEvent(event);
					},
					onError: (error: Error) => {
						console.error("Stream error:", error);
						appendToLastMessage(`\n\n[Error: ${error.message}]`);
						currentAction.value = "error";
						isStreaming.value = false;
					},
					onComplete: () => {
						currentAction.value = "complete";
						isStreaming.value = false;
						abortControllerRef.current = null;
					}
				}
			);
		} catch (error) {
			console.error("Failed to start stream:", error);
			appendToLastMessage(`\n\n[Error: Failed to send message]`);
			currentAction.value = "error";
			isStreaming.value = false;
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return { handleSendMessage };
}
