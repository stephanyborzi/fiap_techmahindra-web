import React from 'react'
import { useUser } from '@/hooks/useUser'

export default function Header() {
  const { userProfile } = useUser()

  return (
    <header className="flex justify-between items-center p-4 bg-primary">
      <h1 className="text-white">Race App</h1>
      <div className="flex items-center">
        <span className="text-white mr-4">Pontos: {userProfile?.points || 0}</span>
        <img src={userProfile?.photoURL || '/default-avatar.png'} alt="Profile" className="w-8 h-8 rounded-full" />
      </div>
    </header>
  )
}
