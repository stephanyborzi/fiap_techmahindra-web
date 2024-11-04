import React from 'react'
import { Badge } from "@/components/ui/badge"
import { motion } from 'framer-motion'

const UserBetsTab = ({ userBets, isRaceFinished, userPoints }) => {
  const formatBetType = (type) => {
    switch (type) {
      case 'winner': return 'Race Winner'
      case 'podiumFinish': return 'Podium Finish'
      case 'fastestLap': return 'Fastest Lap'
      case 'topFive': return 'Top 5 Finish'
      case 'nextLapFastestLap': return 'Next Lap Fastest'
      case 'nextLapOvertakes': return 'Next Lap Overtakes'
      case 'nextLapEnergyEfficiency': return 'Next Lap Energy Efficiency'
      default: return type
    }
  }

  return (
    <div className="overflow-y-auto scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold">Seus Pontos: {userPoints}</h2>
        </div>
        {userBets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma aposta realizada ainda
          </div>
        ) : (
          userBets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center justify-between py-3 px-2 border-b last:border-b-0 dark:border-gray-700"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-sm">{formatBetType(bet.type)}</p>
                <p className="text-xs text-muted-foreground">{bet.driver}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="font-semibold text-sm">{bet.amount} pontos</p>
                <Badge
                  variant={bet.status === "won" ? "success" : bet.status === "lost" ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {bet.status === "pending"
                    ? `${bet.multiplier}x`
                    : bet.status === "won"
                    ? `+${bet.points}`
                    : bet.status === "lost"
                    ? `-${bet.amount}`
                    : ""}
                </Badge>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  )
}

export default UserBetsTab
