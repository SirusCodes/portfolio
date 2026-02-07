/**
 * Chat API client for handling SSE streaming
 */

import type { ChatRequest, StreamEvent } from "./types";

export class ChatAPIError extends Error {
	constructor(
		message: string,
		public statusCode?: number
	) {
		super(message);
		this.name = "ChatAPIError";
	}
}

export interface StreamCallbacks {
	onEvent?: (event: StreamEvent) => void;
	onError?: (error: Error) => void;
	onComplete?: () => void;
}

/**
 * Stream chat responses from the API
 */
export async function streamChat(
	apiUrl: string,
	request: ChatRequest,
	callbacks: StreamCallbacks
): Promise<AbortController> {
	const abortController = new AbortController();

	try {
		const response = await fetch(`${apiUrl}/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request),
			signal: abortController.signal
		});

		if (!response.ok) {
			throw new ChatAPIError(
				`HTTP error! status: ${response.status}`,
				response.status
			);
		}

		if (!response.body) {
			throw new ChatAPIError("Response body is null");
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		const processStream = async () => {
			try {
				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						callbacks.onComplete?.();
						break;
					}

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmedLine = line.trim();

						if (trimmedLine.startsWith("data:")) {
							const data = trimmedLine.slice(5).trim();

							if (data === "[DONE]") {
								callbacks.onComplete?.();
								return;
							}

							try {
								const event: StreamEvent = JSON.parse(data);
								callbacks.onEvent?.(event);
							} catch (e) {
								console.error(
									"Failed to parse SSE data:",
									data,
									e
								);
							}
						}
					}
				}
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					// Stream was aborted, this is expected
					return;
				}
				callbacks.onError?.(error as Error);
			}
		};

		processStream();
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			// Request was aborted, this is expected
			return abortController;
		}
		callbacks.onError?.(error as Error);
	}

	return abortController;
}

/**
 * Health check endpoint
 */
export async function healthCheck(apiUrl: string): Promise<boolean> {
	try {
		const response = await fetch(`${apiUrl}/health`);
		return response.ok;
	} catch {
		return false;
	}
}
