/**
 * Chat input component
 */

import type { FunctionalComponent } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
	initialValue?: string;
}

export const ChatInput: FunctionalComponent<ChatInputProps> = ({
	onSend,
	disabled = false,
	placeholder = "Type your message...",
	initialValue = ""
}) => {
	const [input, setInput] = useState(initialValue);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (trimmed && !disabled) {
			onSend(trimmed);
			setInput("");

			// Reset textarea height
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleInput = (e: Event) => {
		const target = e.target as HTMLTextAreaElement;
		setInput(target.value);

		// Auto-resize textarea
		target.style.height = "auto";
		target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
	};

	useEffect(() => {
		if (!disabled && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [disabled]);

	// Set initial value when provided
	useEffect(() => {
		if (initialValue && !input) {
			setInput(initialValue);
			// Auto-resize for initial value
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
				textareaRef.current.style.height = `${Math.min(
					textareaRef.current.scrollHeight,
					200
				)}px`;
			}
		}
	}, [initialValue]);

	return (
		<form class="chat-input" onSubmit={handleSubmit}>
			<div class="input-wrapper">
				<textarea
					ref={textareaRef}
					value={input}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					rows={1}
					aria-label="Chat message input"
				/>
				<button
					type="submit"
					class="send-button"
					disabled={!input.trim() || disabled}
					aria-label="Send message"
				>
					Send
				</button>
			</div>
		</form>
	);
};
