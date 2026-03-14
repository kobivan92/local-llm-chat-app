import { useState } from 'react'
import { Sparkle, EnvelopeSimple, SignIn } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { toast } from 'sonner'

interface LoginScreenProps {
  onLogin: (email: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    const emailLower = email.toLowerCase().trim()
    
    if (!emailLower.endsWith('@telmico.ge')) {
      toast.error('Access restricted to @telmico.ge email addresses only')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    setTimeout(() => {
      onLogin(emailLower)
      toast.success(`Welcome, ${emailLower}!`)
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Sparkle size={32} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI Chat</h1>
            <p className="mt-2 text-muted-foreground">
              Restricted to Telmico users
            </p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your @telmico.ge email to access the AI chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <EnvelopeSimple 
                    size={20} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@telmico.ge"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <SignIn size={20} weight="bold" className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <EnvelopeSimple size={16} className="text-accent" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Access Requirements</p>
              <p className="mt-1 text-muted-foreground">
                This application is restricted to Telmico employees. You must use a valid @telmico.ge email address to sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
