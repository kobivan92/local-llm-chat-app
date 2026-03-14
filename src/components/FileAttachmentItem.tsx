import { FileAttachment } from '@/lib/types'
import { downloadFile, formatFileSize } from '@/lib/fileUtils'
import { Button } from '@/components/ui/button'
import { DownloadSimple, FilePdf, FileXls, FileDoc, FileImage, File } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type FileAttachmentItemProps = {
  attachment: FileAttachment
  variant?: 'compact' | 'full'
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FilePdf size={24} weight="fill" className="text-red-500" />
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileXls size={24} weight="fill" className="text-green-500" />
  if (type.includes('wordprocessing') || type.includes('msword')) return <FileDoc size={24} weight="fill" className="text-blue-500" />
  if (type.includes('image')) return <FileImage size={24} weight="fill" className="text-purple-500" />
  return <File size={24} weight="fill" className="text-muted-foreground" />
}

export function FileAttachmentItem({ attachment, variant = 'full' }: FileAttachmentItemProps) {
  const isImage = attachment.type.includes('image')
  const imageUrl = isImage ? `data:${attachment.type};base64,${attachment.data}` : null

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
      >
        {getFileIcon(attachment.type)}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate max-w-[150px]">{attachment.name}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={() => downloadFile(attachment)}
        >
          <DownloadSimple size={16} weight="bold" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-card p-4',
        isImage && 'flex-col'
      )}
    >
      {isImage && imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={attachment.name}
            className="w-full max-w-md rounded-lg object-contain max-h-96"
          />
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2">
              {getFileIcon(attachment.type)}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{attachment.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(attachment)}
              className="shrink-0"
            >
              <DownloadSimple size={16} weight="bold" className="mr-2" />
              Download
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary shrink-0">
            {getFileIcon(attachment.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(attachment)}
            className="shrink-0"
          >
            <DownloadSimple size={16} weight="bold" className="mr-2" />
            Download
          </Button>
        </>
      )}
    </motion.div>
  )
}
