import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Conversation, Message, ModelType, FileAttachment } from './lib/types'
import { ConversationSidebar } from './components/ConversationSidebar'
import { MessageBubble } from './components/MessageBubble'
import { ChatInput } from './components/ChatInput'
import { ModelSelector } from './components/ModelSelector'
import { ScrollArea } from './components/ui/scroll-area'
import { Button } from './components/ui/button'
import { List, Sparkle, DownloadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { exportConversationToPDF, exportConversationToExcel, exportConversationToCSV, exportConversationToJSON, extractTextFromFile } from './lib/fileUtils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'

function App() {
  const [conversations, setConversations] = useKV<Conversation[]>('conversations', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const streamIntervalRef = useRef<number | null>(null)

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
  }, [currentConversation?.messages, streamingContent])

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

  const stopStreaming = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
    }

    if (streamingContent) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamingContent,
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
    }

    setStreamingContent('')
    setIsStreaming(false)
    setIsLoading(false)
    toast.info('Response stopped')
  }

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentConversationId) {
      createNewConversation()
      setTimeout(() => handleSendMessage(content, attachments), 100)
      return
    }

    let enrichedContent = content
    
    if (attachments && attachments.length > 0) {
      const fileDescriptions = await Promise.all(
        attachments.map(async (attachment) => {
          const blob = new Blob([Uint8Array.from(atob(attachment.data), c => c.charCodeAt(0))], { type: attachment.type })
          const file = new File([blob], attachment.name, { type: attachment.type })
          return await extractTextFromFile(file)
        })
      )
      
      if (content) {
        enrichedContent = `${content}\n\n${fileDescriptions.join('\n')}`
      } else {
        enrichedContent = fileDescriptions.join('\n')
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: enrichedContent,
      timestamp: Date.now(),
      attachments,
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
    setStreamingContent('')
    setIsStreaming(true)

    try {
      const prompt = window.spark.llmPrompt([enrichedContent], enrichedContent)
      const response = await window.spark.llm(prompt, selectedModel)

      let currentIndex = 0
      const streamInterval = setInterval(() => {
        if (currentIndex < response.length) {
          const charsToAdd = Math.min(3, response.length - currentIndex)
          setStreamingContent((prev) => prev + response.slice(currentIndex, currentIndex + charsToAdd))
          currentIndex += charsToAdd
        } else {
          clearInterval(streamInterval)
          streamIntervalRef.current = null
          
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
          
          setStreamingContent('')
          setIsStreaming(false)
          setIsLoading(false)
        }
      }, 20)
      
      streamIntervalRef.current = streamInterval as unknown as number
    } catch (error) {
      toast.error('Failed to get response. Please try again.')
      console.error('LLM Error:', error)
      setStreamingContent('')
      setIsStreaming(false)
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

  const handleExportPDF = () => {
    if (!currentConversation) return
    exportConversationToPDF(currentConversation.title, currentConversation.messages)
    toast.success('Conversation exported to PDF')
  }

  const handleExportExcel = () => {
    if (!currentConversation) return
    exportConversationToExcel(currentConversation.title, currentConversation.messages)
    toast.success('Conversation exported to Excel')
  }

  const handleExportCSV = () => {
    if (!currentConversation) return
    exportConversationToCSV(currentConversation.title, currentConversation.messages)
    toast.success('Conversation exported to CSV')
  }

  const handleExportJSON = () => {
    if (!currentConversation) return
    exportConversationToJSON(currentConversation.title, currentConversation.messages)
    toast.success('Conversation exported to JSON')
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
          <div className="flex items-center gap-3">
            {currentConversation && currentConversation.messages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <DownloadSimple size={16} weight="bold" className="mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ModelSelector selectedModel={selectedModel} onSelectModel={handleModelChange} />
          </div>
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
                {isLoading && !isStreaming && (
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
                {isStreaming && streamingContent && (
                  <MessageBubble 
                    key="streaming" 
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingContent,
                      timestamp: Date.now(),
                    }}
                    isStreaming={true}
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <ChatInput 
          onSendMessage={handleSendMessage} 
          onStopStreaming={stopStreaming}
          disabled={isLoading && !isStreaming} 
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}

export default App