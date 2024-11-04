import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag } from "lucide-react"
import { motion } from 'framer-motion'

export default function RaceStatusCard({ raceData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-2xl font-bold text-primary dark:text-primary-light">
            <span>Estado da Corrida</span>
            <Flag className="w-6 h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm text-muted-foreground">Voltas</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {raceData?.raceStatus.lapsCompleted ?? 0}/
                {raceData?.raceStatus.totalLaps ?? 0}
              </p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm text-muted-foreground">Tempo Decorrido</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {raceData?.raceStatus.timeElapsed ?? "00:00:00"}
              </p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm text-muted-foreground">Líder</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {raceData?.latestLapData?.leader ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
