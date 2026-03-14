import { Conversation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, ChatCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type ConversationSidebarProps = {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="p-4">
        <Button
          onClick={onNewConversation}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={20} weight="bold" />
          New Chat
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <ChatCircle size={48} weight="thin" className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-center gap-2 rounded-lg px-3 py-3 text-sm cursor-pointer transition-colors',
                  currentConversationId === conv.id
                    ? 'bg-primary/10 text-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <ChatCircle size={18} weight="fill" className="shrink-0" />
                <span className="flex-1 truncate font-medium">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
