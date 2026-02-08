/**
 * Chat input component with form submission
 */

import type { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import type { JSX } from "preact";

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled: boolean;
	placeholder: string;
	initialValue?: string;
}

export const ChatInput: FunctionalComponent<ChatInputProps> = ({
	onSend,
	disabled,
	placeholder,
	initialValue
}) => {
	const [inputValue, setInputValue] = useState("");

	// Set initial value if provided
	useEffect(() => {
		if (initialValue) {
			setInputValue(initialValue);
		}
	}, [initialValue]);

	const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault();
		const trimmed = inputValue.trim();
		if (trimmed && !disabled) {
			onSend(trimmed);
			setInputValue("");
		}
	};

	const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			const trimmed = inputValue.trim();
			if (trimmed && !disabled) {
				onSend(trimmed);
				setInputValue("");
			}
		}
	};

	return (
		<form class="chat-input-bar" onSubmit={handleSubmit} autoComplete="off">
			<div class="chat-input-wrap">
				<textarea
					class="chat-input"
					rows={1}
					placeholder={placeholder}
					value={inputValue}
					onInput={(event) =>
						setInputValue((event.target as HTMLTextAreaElement).value)
					}
					onKeyDown={handleKeyDown}
				/>
				<button class="chat-send" type="submit" disabled={disabled}>
					Send
				</button>
			</div>
			<div class="chat-hint">Enter to send, Shift+Enter for newline.</div>
		</form>
	);
};
