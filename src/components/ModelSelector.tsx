import { ModelType, MODELS } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'

type ModelSelectorProps = {
  selectedModel: ModelType
  onSelectModel: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const currentModel = MODELS.find((m) => m.value === selectedModel)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {currentModel?.label}
          <CaretDown size={16} weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.value}
            onClick={() => onSelectModel(model.value)}
            className="flex flex-col items-start py-3"
          >
            <div className="font-medium">{model.label}</div>
            <div className="text-xs text-muted-foreground">{model.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
