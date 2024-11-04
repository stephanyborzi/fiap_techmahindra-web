import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Leaderboard from './Leaderboard'
import ChatTab from './ChatTab'
import { PlusCircle } from 'lucide-react'

export default function Sidebar({
  raceData,
  chatMessages,
  userBets,
  isDesktop,
  onPlaceBet,
  setShowLoginDialog,
  onSendMessage,
  isUserLoggedIn,
  isRaceFinished,
  drivers
}) {
  return (
    <motion.div
      className={`h-full flex flex-col bg-gray-100 dark:bg-gray-800 ${
        isDesktop ? 'w-80' : 'w-full'
      } rounded-t-none`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isDesktop ? (
        <Tabs defaultValue="leaderboard" className="flex-grow flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-none">
            <TabsTrigger 
              value="leaderboard" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none"
            >
              Classificação
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none"
            >
              Chat da Corrida
            </TabsTrigger>
          </TabsList>
          <TabsContent value="leaderboard" className="flex-grow overflow-y-auto scrollbar-hide">
            <Leaderboard 
              drivers={drivers} 
              isLoading={!raceData} 
              isRaceFinished={isRaceFinished}
            />
          </TabsContent>
          <TabsContent value="chat" className="flex-grow p-0">
            <ChatTab
              chatMessages={chatMessages}
              onSendMessage={onSendMessage}
              isUserLoggedIn={isUserLoggedIn}
              setShowLoginDialog={setShowLoginDialog}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Leaderboard drivers={raceData?.drivers} isLoading={!raceData} />
      )}
    </motion.div>
  )
}
