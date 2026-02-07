/**
 * Chat API types based on OpenAPI specification
 */

export type MessageType =
	| "HumanMessage"
	| "AIMessage"
	| "ToolMessage"
	| "SystemMessage"
	| "complete"
	| "error";

export type ActionStatus =
	| "received_prompt"
	| "calling_tool"
	| "generating"
	| "processing"
	| "complete"
	| "error"
	| null;

export interface TokenInfo {
	input_tokens: number | null;
	output_tokens: number | null;
	total_tokens: number | null;
}

export interface StreamEvent {
	thread_id?: string;
	type: MessageType;
	content?: string;
	tokens?: TokenInfo;
	is_cached?: boolean;
	action?: ActionStatus;
	tool_name?: string | null;
}

export interface ChatRequest {
	thread_id: string;
	prompt: string;
}

export interface Message {
	id: string;
	type: "user" | "assistant";
	content: string;
	timestamp: number;
	tokens?: TokenInfo;
	is_cached?: boolean;
	status?: ActionStatus;
	tool_name?: string | null;
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	created_at: number;
	updated_at: number;
}

export interface ChatState {
	conversations: Map<string, Conversation>;
	currentConversationId: string | null;
	isStreaming: boolean;
	currentAction: ActionStatus;
}
