import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRace } from "@/contexts/RaceContext"
import { useBetting } from '@/hooks/useBetting'

export default function CompactBettingForm({
  onPlaceBet,
  isRaceFinished,
  onCancel,
}) {
  const [betType, setBetType] = useState("")
  const [betDriver, setBetDriver] = useState("")
  const [betAmount, setBetAmount] = useState("")
  const { currentRaceId, drivers } = useRace()
  const { fetchBetMultiplier } = useBetting()
  const [betMultiplier, setBetMultiplier] = useState(null)
  const [loadingMultiplier, setLoadingMultiplier] = useState(false)

  useEffect(() => {
    const fetchMultiplier = async () => {
      if (betType && betDriver) {
        setLoadingMultiplier(true)
        const multiplier = await fetchBetMultiplier(currentRaceId, betType, betDriver)
        setBetMultiplier(multiplier)
        setLoadingMultiplier(false)
      } else {
        setBetMultiplier(null)
      }
    }

    fetchMultiplier()
  }, [betType, betDriver, currentRaceId, fetchBetMultiplier])

  const handleSubmit = (e) => {
    e.preventDefault()
    onPlaceBet(betType, betDriver, betAmount) // Ensure parameters are in the correct order
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={betType} onValueChange={setBetType}>
        <SelectTrigger>
          <SelectValue placeholder="Select bet type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="winner">Race Winner</SelectItem>
          <SelectItem value="podiumFinish">Podium Finish</SelectItem>
          <SelectItem value="fastestLap">Fastest Lap</SelectItem>
          <SelectItem value="topFive">Top 5 Finish</SelectItem>
        </SelectContent>
      </Select>

      <Select value={betDriver} onValueChange={setBetDriver}>
        <SelectTrigger>
          <SelectValue placeholder="Select driver" />
        </SelectTrigger>
        <SelectContent>
          {drivers.map((driver) => (
            <SelectItem key={driver.name} value={driver.name}>
              {driver.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Bet amount"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
      />

      {betType && betDriver && betAmount && betMultiplier !== null && (
        <div className="text-sm text-muted-foreground">
          <p>
            Potential Win: {(parseInt(betAmount) * betMultiplier || 0).toFixed(2)} points
          </p>
          <p>Multiplier: {betMultiplier.toFixed(2)}x</p>
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={
            isRaceFinished ||
            !betType ||
            !betDriver ||
            !betAmount ||
            betMultiplier === null ||
            loadingMultiplier
          }
        >
          {loadingMultiplier ? "Loading..." : "Place Bet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}