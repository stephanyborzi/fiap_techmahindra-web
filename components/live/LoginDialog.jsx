import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToastContext } from '@/contexts/ToastContext'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

export default function LoginDialog({ showLoginDialog, setShowLoginDialog, onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToastContext()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      showToast('Logged in successfully', 'success')
      setShowLoginDialog(false)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (error) {
      console.error("Error logging in with Google", error)
      showToast('Failed to log in. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Necessário</DialogTitle>
          <DialogDescription>
            Por favor, faça login com sua conta do Google para continuar.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fazendo login...
            </>
          ) : (
            'Login com Google'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
