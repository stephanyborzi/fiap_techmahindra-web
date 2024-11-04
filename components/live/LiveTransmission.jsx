import React, { useCallback } from 'react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from 'framer-motion'
import YouTube from "react-youtube"
import { Users, Clock, Flag } from "lucide-react"
import RaceProgress from './RaceProgress'

export default function LiveTransmission({ raceTitle, raceSubtitle, viewerCount, isLive, duration, lapsCompleted, totalLaps, timeElapsed }) {
  const onPlayerReady = useCallback((event) => {
    // Store the player instance
    const player = event.target;
    // Set up an event listener for when the video ends
    player.addEventListener('onStateChange', (event) => {
      if (event.data === YouTube.PlayerState.ENDED) {
        // When the video ends, play it again
        player.playVideo();
      }
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden sm:px-16 sm:pt-8 sm:pb-0"
    >
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 Aspect Ratio */}
        <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center">
          <YouTube
            videoId="efq9LKuelIo"
            className="w-full h-full rounded-lg"
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                controls: 1,
                mute: 1,
                playsinline: 1,
              }
            }}
            onReady={onPlayerReady}
          />
        </div>
        {isLive && (
          <Badge 
            variant="destructive" 
            className="absolute top-4 left-4 text-sm font-semibold"
          >
            LIVE
          </Badge>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-2 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {raceTitle}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {raceSubtitle}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <RaceProgress
          currentLap={lapsCompleted}
          totalLaps={totalLaps}
          elapsedTime={timeElapsed}
          isRaceFinished={lapsCompleted == totalLaps}
        />
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>{viewerCount.toLocaleString()} viewers</span>
          </div>
          {duration && (
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{duration}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
