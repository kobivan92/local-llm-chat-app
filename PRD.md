# Planning Guide

A conversational AI chat interface that allows users to interact with multiple language models (GPT-4o, GPT-4o-mini) in a seamless, intuitive conversation flow.

**Experience Qualities**:
1. **Conversational** - The interface should feel natural and human, like chatting with a knowledgeable assistant rather than using a rigid tool
2. **Responsive** - Immediate feedback and smooth interactions that make the AI feel present and attentive to user input
3. **Clean** - Minimal visual clutter that keeps focus on the conversation while providing easy access to essential controls

**Complexity Level**: Light Application (multiple features with basic state)
This is a chat interface with message history, model selection, and conversation management - more than a single-purpose tool but not requiring complex multi-view navigation or advanced data relationships.

## Essential Features

**Send Message**
- Functionality: User types a message and sends it to the selected AI model, receiving a response
- Purpose: Core interaction pattern - enables natural conversation with the AI
- Trigger: User types in input field and presses Enter or clicks Send button
- Progression: Type message → Press send → Message appears in chat → Loading indicator → AI response streams in → Ready for next message
- Success criteria: Messages persist in conversation history, AI responses are coherent and contextual

**Model Selection**
- Functionality: Switch between different LLM models (GPT-4o, GPT-4o-mini) mid-conversation
- Purpose: Allows users to choose the right model for their task (speed vs. capability)
- Trigger: Click model selector dropdown in header
- Progression: Click dropdown → View available models → Select model → Indicator updates → Next messages use new model
- Success criteria: Model changes are reflected immediately, conversation history is preserved across model switches

**Conversation Management**
- Functionality: Start new conversations, view conversation history, delete conversations
- Purpose: Organize multiple chat sessions and maintain context separation between different topics
- Trigger: Click "New Chat" button in sidebar or select previous conversation from history
- Progression: Click new chat → Current chat saved → Fresh input appears → Or click history item → Previous conversation loads
- Success criteria: All conversations persist between sessions, can switch between conversations without data loss

**Message History Display**
- Functionality: Scrollable view of all messages in current conversation with visual distinction between user and AI
- Purpose: Provides context and allows users to reference previous parts of the conversation
- Trigger: Automatic as messages are sent/received
- Progression: New message → Scrolls into view → Previous messages remain accessible via scroll
- Success criteria: Messages display in chronological order, user can scroll through full history, timestamps visible

## Edge Case Handling

- **Empty Message** - Send button disabled until user types content
- **API Error** - Display friendly error message in chat, allow retry without losing input
- **Long Response** - Messages wrap and expand container, auto-scroll to bottom
- **Model Unavailable** - Gracefully fall back to default model with notification
- **No Conversations** - Show welcoming empty state with suggestions to start chatting
- **Rapid Sending** - Disable input while AI is responding to prevent queue buildup

## Design Direction

The design should evoke clarity, intelligence, and modern sophistication - like conversing with a thoughtful expert in a calm, focused environment.

## Color Selection

A sophisticated dark-leaning palette with vibrant accent colors that create energy without overwhelming the conversation content.

- **Primary Color**: Deep purple (`oklch(0.45 0.15 285)`) - Conveys intelligence, creativity, and premium AI technology
- **Secondary Colors**: Slate gray backgrounds (`oklch(0.18 0.01 260)`) for cards and surfaces - Creates depth and focus zones
- **Accent Color**: Electric cyan (`oklch(0.72 0.14 195)`) - High-tech, modern, draws attention to CTAs and active elements
- **Foreground/Background Pairings**: 
  - Primary purple bg (`oklch(0.45 0.15 285)`): White text (`oklch(0.98 0 0)`) - Ratio 8.2:1 ✓
  - Dark slate bg (`oklch(0.18 0.01 260)`): Light gray text (`oklch(0.85 0.01 260)`) - Ratio 10.5:1 ✓
  - Accent cyan (`oklch(0.72 0.14 195)`): Dark text (`oklch(0.18 0.01 260)`) - Ratio 8.8:1 ✓
  - Message bubbles (`oklch(0.25 0.02 260)`): Light text (`oklch(0.92 0.01 260)`) - Ratio 12.1:1 ✓

## Font Selection

Typefaces should balance technical precision with approachability - clean enough for extended reading but with enough character to feel modern and distinctive.

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold / 24px / -0.02em letter spacing / 1.2 line height
  - H2 (Conversation Title): Space Grotesk Medium / 16px / -0.01em / 1.3 line height
  - Body (Messages): Inter Regular / 15px / 0em / 1.6 line height
  - Small (Metadata/Timestamps): Inter Regular / 13px / 0em / 1.4 line height
  - Code (Inline/Blocks): JetBrains Mono Regular / 14px / 0em / 1.5 line height

## Animations

Animations should create a sense of fluidity and intelligence - responses that feel thoughtful rather than instant, transitions that maintain spatial context.

- Message send: Gentle slide-up and fade-in (200ms ease-out)
- AI response: Character-by-character streaming effect with subtle fade-in on appearance
- Conversation switch: Cross-fade between conversation content (250ms ease-in-out)
- Model selection: Smooth dropdown expansion with subtle scale effect (200ms ease-out)
- Loading state: Pulsing dot animation that feels organic rather than mechanical
- Sidebar toggle: Slide animation with backdrop blur fade (300ms ease-in-out)

## Component Selection

- **Components**: 
  - `ScrollArea` for message history - smooth scrolling with custom scrollbar styling
  - `Button` for send action, new chat, model selector - primary variant for send, ghost for secondary actions
  - `Textarea` for message input - auto-expanding with max height
  - `Card` for message bubbles - subtle shadows and distinct user/AI styling
  - `DropdownMenu` for model selection - clear visual hierarchy
  - `Separator` for dividing sidebar sections
  - `Dialog` for conversation deletion confirmation
  - `Tooltip` for icon-only buttons
  
- **Customizations**:
  - Custom message bubble component with distinct styling for user vs AI messages
  - Auto-expanding textarea that grows with content up to max height
  - Streaming text component that renders character-by-character with cursor
  - Empty state illustration with prompt suggestions
  
- **States**:
  - Send button: Enabled (vibrant cyan), Disabled (muted gray), Loading (pulsing)
  - Message input: Default, Focused (subtle glow), Disabled during response
  - Model selector: Default, Hover (subtle highlight), Active (accent border)
  - Sidebar items: Default, Hover (background shift), Active/Selected (accent indicator)
  
- **Icon Selection**:
  - `PaperPlaneTilt` for send message
  - `Plus` for new conversation
  - `Trash` for delete conversation  
  - `List` for sidebar toggle
  - `CaretDown` for model dropdown
  - `Robot` for AI messages
  - `User` for user messages
  
- **Spacing**:
  - Container padding: `p-6` for main chat area, `p-4` for sidebar
  - Message gaps: `gap-4` between messages in conversation
  - Input area: `p-4` padding around textarea, `gap-3` between input and button
  - Sidebar items: `py-3 px-4` for conversation list items
  
- **Mobile**:
  - Sidebar collapses to overlay drawer on screens < 768px
  - Message bubbles reduce horizontal padding from `px-4` to `px-3`
  - Font sizes reduce slightly: Body 14px, Small 12px
  - Input area stacks vertically on very small screens with full-width button
  - Floating action button for new chat appears when sidebar is hidden
