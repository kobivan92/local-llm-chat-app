import { Message } from '@/lib/types'
import { User, Robot } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { MarkdownRenderer } from './MarkdownRenderer'

type MessageBubbleProps = {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('flex gap-3 px-4 py-4', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser ? 'bg-primary' : 'bg-secondary'
        )}
      >
        {isUser ? (
          <User size={20} weight="bold" className="text-primary-foreground" />
        ) : (
          <Robot size={20} weight="duotone" className="text-secondary-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-3xl">
        <div
          className={cn(
            'rounded-xl px-4 py-3 relative',
            isUser
              ? 'bg-primary text-primary-foreground text-[15px] leading-relaxed whitespace-pre-wrap break-words'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {isUser ? (
            <>
              {message.content}
            </>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <span className="inline-block w-[2px] h-[1.1em] bg-accent ml-0.5 animate-pulse" />
              )}
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  )
}
