import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, DollarSign } from 'lucide-react'
import UserBetsTab from './UserBetsTab'
import CompactBettingForm from './CompactBettingForm'
import { useBetting } from '@/hooks/useBetting'
import { useRace } from '@/contexts/RaceContext'
import { useUser } from '@/hooks/useUser'
import { useToastContext } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'

export default function UserBetsWidget({ isRaceFinished }) {
  const [showBettingForm, setShowBettingForm] = useState(false)
  const { userBets, placeBet } = useBetting()
  const { user, userProfile, updateUserPoints } = useUser()
  const { showToast } = useToastContext()

  const handlePlaceBet = async (betType, betDriver, betAmount) => {
    if (!user) {
      showToast('Por favor, faça login para apostar', 'error')
      return
    }
    try {
      await placeBet(betType, betDriver, betAmount)
      setShowBettingForm(false)
      // Update points after placing a bet
      await updateUserPoints(user.uid, -betAmount)
    } catch (error) {
      showToast('Falha ao fazer aposta. Tente novamente.', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="overflow-y-auto scrollbar-hide">
        <Card className="bg-white dark:bg-gray-800 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl font-bold text-primary dark:text-primary-light">
              <span className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                {showBettingForm ? 'Fazer uma Nova Aposta' : 'Suas Apostas'}
              </span>
              {!showBettingForm ? (
                <Button
                  size="sm"
                  onClick={() => setShowBettingForm(true)}
                  disabled={isRaceFinished}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Aposta
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBettingForm(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {showBettingForm ? (
              <CompactBettingForm
                onPlaceBet={handlePlaceBet}
                isRaceFinished={isRaceFinished}
                onCancel={() => setShowBettingForm(false)}
              />
            ) : (
              <UserBetsTab
                userBets={userBets}
                isRaceFinished={isRaceFinished}
                userPoints={userProfile?.points || 0}
                compact={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
