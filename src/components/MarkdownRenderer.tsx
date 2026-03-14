import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { Copy, Check } from '@phosphor-icons/react'
import { useState } from 'react'

type MarkdownRendererProps = {
  content: string
  className?: string
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || 'text'

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted rounded-t-lg px-4 py-2 border border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-background"
        >
          {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code(props) {
            const { children, className, ...rest } = props
            const value = String(children).replace(/\n$/, '')
            const match = /language-(\w+)/.exec(className || '')
            
            if (!match) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted text-accent font-mono text-sm"
                  {...rest}
                >
                  {children}
                </code>
              )
            }

            return <CodeBlock className={className}>{value}</CodeBlock>
          },
          pre({ children }) {
            return <>{children}</>
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3 text-foreground">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h3>
          },
          p({ children }) {
            return <p className="my-3 leading-relaxed text-[15px]">{children}</p>
          },
          ul({ children }) {
            return <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>
          },
          ol({ children }) {
            return <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-accent pl-4 my-4 italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {children}
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 text-left font-semibold">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-border px-4 py-2">{children}</td>
          },
          hr() {
            return <hr className="my-6 border-border" />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
