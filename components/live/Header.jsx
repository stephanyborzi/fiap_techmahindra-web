'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useUser } from '@/hooks/useUser'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Zap, Sun, Moon, Laptop } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LivePageHeader() {
  const { setTheme } = useTheme()
  const { user, userProfile, loading } = useUser()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) {
    return null
  }

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useUser hook will automatically update the user state
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // The useUser hook will automatically update the user state
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b ${
        scrolled ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : 'bg-background'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block text-primary">Fórmula E Ao Vivo</span>
        </Link>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!loading && (user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User avatar'} />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Points: {userProfile?.points || 0}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Rank: {userProfile?.rank || 'N/A'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleLogin}>
              Log in with Google
            </Button>
          ))}
        </div>
      </div>
    </motion.header>
  )
}
