/**
 * Message list component for rendering chat messages
 */

import type { FunctionalComponent } from "preact";
import type { Message } from "../../lib/chat/types";
import { MessageCard } from "./MessageCard";

interface MessageListProps {
	messages: Message[];
}

export const MessageList: FunctionalComponent<MessageListProps> = ({
	messages
}) => {
	if (!messages || messages.length === 0) {
		return null;
	}

	return (
		<>
			{messages.map((message, index) => (
				<MessageCard
					key={message.id}
					message={message}
					isLastMessage={index === messages.length - 1}
				/>
			))}
		</>
	);
};
