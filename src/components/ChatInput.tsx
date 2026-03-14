import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PaperPlaneTilt, Stop } from '@phosphor-icons/react'

type ChatInputProps = {
  onSendMessage: (content: string) => void
  onStopStreaming?: () => void
  disabled?: boolean
  isStreaming?: boolean
}

export function ChatInput({ onSendMessage, onStopStreaming, disabled, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || disabled) return
    
    onSendMessage(trimmedInput)
    setInput('')
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <Textarea
          ref={textareaRef}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={disabled}
          rows={1}
          className="min-h-[48px] max-h-[200px] resize-none text-[15px] leading-relaxed"
        />
        {isStreaming ? (
          <Button
            onClick={onStopStreaming}
            size="icon"
            variant="destructive"
            className="h-12 w-12 shrink-0"
          >
            <Stop size={20} weight="fill" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            size="icon"
            className="h-12 w-12 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <PaperPlaneTilt size={20} weight="fill" />
          </Button>
        )}
      </div>
    </div>
  )
}
