# Chat Feature

A dedicated chat interface integrated into the portfolio site that streams responses from a custom AI API.

## Features

- **Streaming Responses**: Real-time Server-Sent Events (SSE) streaming from the API
- **Conversation Threads**: Multiple conversation threads with local browser storage
- **Thread Management**: Create new threads, switch between conversations, and clear history
- **Prompt Prefill**: Support for `?prompt=` URL parameter (does not auto-send)
- **Token Tracking**: Displays input/output token counts and cache status for AI responses
- **Processing Updates**: Real-time status indicators while AI is processing
- **Dark Theme**: Matches the existing site design with minimal dark UI
- **Responsive Design**:
    - Desktop: Always-visible sidebar (non-collapsible)
    - Mobile: Hamburger menu with overlay sidebar and background dimming
- **Clean UI**: Hidden scrollbars for cleaner presentation

## Tech Stack

- **Preact**: Lightweight React alternative for interactive components
- **@preact/signals**: Reactive state management
- **TypeScript**: Type-safe development
- **Astro**: Static site generator with component islands

## Setup

### 1. Install Dependencies

Dependencies are already installed if you ran the project setup. If not:

```bash
pnpm install
```

### 2. Configure API URL

Create a `.env` file in the project root (or copy from `.env.example`):

```env
PUBLIC_CHAT_API_URL=http://localhost:8000
```

For production, set the environment variable in your deployment platform.

### 3. Start Development Server

```bash
pnpm dev
```

The chat interface will be available at `http://localhost:4321/chat`

## Usage

### Basic Chat

1. Navigate to `/chat`
2. Click "Start New Thread" or "New Thread" button
3. Type your message and press Enter or click send
4. Watch real-time streaming responses with processing updates

### Prompt Prefill

Share a chat link with a pre-filled prompt:

```
https://yourdomain.com/chat?prompt=Tell%20me%20about%20your%20experience
```

The prompt will be ready to send but won't auto-submit.

### Mobile Experience

On mobile devices (≤900px width):

- Tap the hamburger menu (☰) to open the sidebar
- Select or create conversations
- Tap outside the sidebar or the × button to close

## Architecture

### Component Structure

```
src/
├── lib/chat/
│   ├── types.ts          # TypeScript type definitions
│   ├── api.ts            # SSE streaming client
│   ├── storage.ts        # LocalStorage management
│   └── store.ts          # Preact signals store
└── components/chat/
    ├── ChatContainer.tsx # Main container component
    ├── Sidebar.tsx       # Conversation list sidebar
    ├── MessageList.tsx   # Message display
    ├── ChatInput.tsx     # Message input with auto-resize
    └── StatusIndicator.tsx # Processing status display
```

### State Management

The chat uses Preact signals for reactive state management:

- `conversations`: Map of all conversation threads
- `currentConversationId`: Active conversation
- `isStreaming`: Whether a response is streaming
- `currentAction`: Current AI processing status
- `isSidebarOpen`: Mobile sidebar state

### Storage

Conversations are persisted in browser localStorage:

- **Key**: `chat_conversations`
- **Format**: JSON serialized conversation objects
- **Lifetime**: Persists until manually cleared

## API Integration

### Request Format

```typescript
POST /chat
Content-Type: application/json

{
  "thread_id": "unique-thread-id",
  "prompt": "User message"
}
```

### Response Format (SSE)

```
data: {"type": "AIMessage", "content": "chunk", "action": "generating"}
data: {"type": "AIMessage", "content": " of", "action": "generating"}
data: {"type": "AIMessage", "content": " text", "tokens": {...}}
data: {"type": "complete"}
```

### Event Types

- `HumanMessage`: User message echo
- `AIMessage`: AI response chunk
- `ToolMessage`: Tool usage notification
- `SystemMessage`: System notification
- `complete`: Stream completion
- `error`: Error notification

### Processing Actions

- `received_prompt`: Message received
- `calling_tool`: Using a tool
- `generating`: Generating response
- `processing`: General processing
- `complete`: Finished
- `error`: Error occurred

## Customization

### Styling

Chat styles are defined in `/src/pages/chat.astro` using scoped `:global()` styles. Key CSS variables:

```css
--accent-color: #88d3ff;
--material-black: #121212;
--shape-color: #222222;
```

### API URL

Change the API URL in `.env`:

```env
PUBLIC_CHAT_API_URL=https://api.yourdomain.com
```

### Mobile Breakpoint

The mobile/desktop breakpoint is set at `900px`. To change:

1. Update the media query in `chat.astro`
2. Update the resize check in `ChatContainer.tsx`

## Troubleshooting

### Chat page shows blank

- Check browser console for errors
- Verify API URL is correct in `.env`
- Ensure Preact integration is enabled in `astro.config.mjs`

### Streaming not working

- Verify the API endpoint returns SSE with proper headers
- Check CORS configuration on the API
- Inspect Network tab for failed requests

### Sidebar not opening on mobile

- Check browser console for JavaScript errors
- Ensure viewport width is ≤900px
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Conversations not persisting

- Check if localStorage is enabled in the browser
- Verify localStorage quota hasn't been exceeded
- Check browser privacy settings (some modes block localStorage)

## Development

### Adding New Features

1. **New message type**: Add to `types.ts` and handle in `ChatContainer.tsx`
2. **New UI component**: Create in `components/chat/` directory
3. **New state**: Add signal to `store.ts` with computed values
4. **New storage pattern**: Extend `storage.ts` utility functions

### Testing

Test the chat interface:

1. Create multiple conversations
2. Test streaming with different response sizes
3. Verify mobile responsiveness (toggle device toolbar)
4. Test error handling (disconnect API)
5. Check localStorage persistence (refresh page)
6. Test prompt prefill with `?prompt=test`

## License

Part of the portfolio project. See main LICENSE file.
