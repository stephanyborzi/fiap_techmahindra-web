import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flag } from 'lucide-react';

const formatTime = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':');
  if (parseInt(hours) === 0) {
    return `${minutes}:${seconds}`;
  } else {
    return `${hours}:${minutes}:${seconds}`;
  }
};

const RaceProgress = ({ currentLap, totalLaps, elapsedTime, isRaceFinished }) => {
  const progress = (currentLap / totalLaps) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg py-2 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Flag className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm font-medium">Race Progress</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isRaceFinished ? "Race Finished" : `Lap ${currentLap} of ${totalLaps}`}
        </span>
      </div>
    </div>
  );
};

export default RaceProgress;
