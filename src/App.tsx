import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Conversation, Message, ModelType } from './lib/types'
import { ConversationSidebar } from './components/ConversationSidebar'
import { MessageBubble } from './components/MessageBubble'
import { ChatInput } from './components/ChatInput'
import { ModelSelector } from './components/ModelSelector'
import { ScrollArea } from './components/ui/scroll-area'
import { Button } from './components/ui/button'
import { List, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'

function App() {
  const [conversations, setConversations] = useKV<Conversation[]>('conversations', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const safeConversations = conversations || []
  const currentConversation = safeConversations.find((c) => c.id === currentConversationId)

  useEffect(() => {
    if (safeConversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(safeConversations[0].id)
    }
  }, [safeConversations, currentConversationId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentConversation?.messages])

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [newConv, ...(prev || [])])
    setCurrentConversationId(newConv.id)
  }

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) {
      createNewConversation()
      setTimeout(() => handleSendMessage(content), 100)
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setConversations((prev) =>
      (prev || []).map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: Date.now(),
              title:
                conv.messages.length === 0
                  ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
                  : conv.title,
            }
          : conv
      )
    )

    setIsLoading(true)

    try {
      const prompt = window.spark.llmPrompt([content], content)
      const response = await window.spark.llm(prompt, selectedModel)

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setConversations((prev) =>
        (prev || []).map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : conv
        )
      )
    } catch (error) {
      toast.error('Failed to get response. Please try again.')
      console.error('LLM Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => (prev || []).filter((c) => c.id !== id))
    if (currentConversationId === id) {
      const remaining = safeConversations.filter((c) => c.id !== id)
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model)
    if (currentConversationId) {
      setConversations((prev) =>
        (prev || []).map((conv) =>
          conv.id === currentConversationId ? { ...conv, model } : conv
        )
      )
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Toaster />
      {sidebarOpen && (
        <ConversationSidebar
          conversations={safeConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={createNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List size={24} weight="bold" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkle size={28} weight="duotone" className="text-accent" />
              <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
            </div>
          </div>
          <ModelSelector selectedModel={selectedModel} onSelectModel={handleModelChange} />
        </header>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="mx-auto max-w-4xl py-6">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
                <Sparkle size={64} weight="duotone" className="text-accent/50" />
                <h2 className="text-2xl font-bold">Start a Conversation</h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything! I'm here to help with questions, ideas, and creative tasks.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {currentConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 px-4 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Sparkle size={20} weight="duotone" className="text-secondary-foreground animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}

export default App