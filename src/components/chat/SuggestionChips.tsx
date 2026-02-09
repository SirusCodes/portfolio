import type { FunctionalComponent } from "preact";

type SuggestionChipsProps = {
	onSelected: (message: string) => void;
};

export const SuggestionChips: FunctionalComponent<SuggestionChipsProps> = ({
	onSelected
}) => {
	const suggestions: string[] = [
		"Technical expertise (e.g., programming languages, tools)?",
		"Career journey and notable projects?",
		"Give me a summary of kind of blogs he writes"
	];

	return (
		<div class="chat-message assistant">
			<div class="chat-message-role">assistant</div>
			<div class="chat-message-content">
				Welcome! Start a conversation by typing a message below or
				selecting one of the suggestions.
			</div>
			<div class="suggestion-chips">
				{suggestions.map((suggestion, index) => (
					<button
						key={index}
						class="suggestion-chip"
						onClick={() => onSelected(suggestion)}
					>
						{suggestion}
					</button>
				))}
			</div>
		</div>
	);
};
