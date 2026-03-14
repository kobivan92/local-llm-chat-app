import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PaperPlaneTilt, Stop, Paperclip, X } from '@phosphor-icons/react'
import { FileAttachment } from '@/lib/types'
import { fileToBase64, extractTextFromFile, SUPPORTED_FILE_TYPES } from '@/lib/fileUtils'
import { toast } from 'sonner'

type ChatInputProps = {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void
  onStopStreaming?: () => void
  disabled?: boolean
  isStreaming?: boolean
}

export function ChatInput({ onSendMessage, onStopStreaming, disabled, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmedInput = input.trim()
    if ((!trimmedInput && attachments.length === 0) || disabled) return
    
    onSendMessage(trimmedInput || 'Attached files', attachments.length > 0 ? attachments : undefined)
    setInput('')
    setAttachments([])
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxSize = 10 * 1024 * 1024

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 10MB.`)
        continue
      }

      const supportedTypes = Object.keys(SUPPORTED_FILE_TYPES)
      if (!supportedTypes.some(type => file.type.includes(type.split('/')[1]))) {
        toast.error(`${file.name} is not a supported file type.`)
        continue
      }

      try {
        const base64Data = await fileToBase64(file)
        const newAttachment: FileAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        }
        setAttachments(prev => [...prev, newAttachment])
        toast.success(`${file.name} attached`)
      } catch (error) {
        toast.error(`Failed to attach ${file.name}`)
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
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

  const acceptedTypes = Object.values(SUPPORTED_FILE_TYPES).flat().join(',')

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex flex-col gap-3 max-w-4xl mx-auto">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2"
              >
                <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="ghost"
            disabled={disabled}
            className="h-12 w-12 shrink-0"
          >
            <Paperclip size={20} weight="bold" />
          </Button>
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
              disabled={(!input.trim() && attachments.length === 0) || disabled}
              size="icon"
              className="h-12 w-12 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
