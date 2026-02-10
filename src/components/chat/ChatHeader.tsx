/**
 * Chat header component with hamburger menu and status display
 */

import type { FunctionalComponent } from "preact";
import { toggleSidebar } from "../../lib/chat/store";

export const ChatHeader: FunctionalComponent = () => {
	return (
		<header class="chat-header">
			<button
				class="chat-icon-button"
				type="button"
				aria-label="Open threads"
				onClick={toggleSidebar}
			>
				<i class="fa-solid fa-bars"></i>
			</button>
			<div class="chat-title-group">
				<div class="chat-title">Wingman</div>
				<div class="chat-subtitle">
					Streaming assistant with thread history
				</div>
			</div>
		</header>
	);
};
