import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BettingForm({ betOptions, nextLapBetOptions, drivers, userPoints, onPlaceBet }) {
  const [betType, setBetType] = useState("")
  const [betDriver, setBetDriver] = useState("")
  const [betAmount, setBetAmount] = useState("")
  const [betMultiplier, setBetMultiplier] = useState(1)

  const calculateBetMultiplier = (betType, driverName) => {
    const driver = drivers.find((d) => d.name === driverName)
    if (!driver || !betType) return 1

    let baseDifficulty = 1
    const isNextLapBet = betType.startsWith("nextLap")
    const actualBetType = isNextLapBet ? betType.slice(7).toLowerCase() : betType

    switch (actualBetType) {
      case "winner":
        baseDifficulty = 10 - (driver.position / drivers.length) * 5
        break
      case "fastestlap":
        baseDifficulty = 5
        break
      case "podiumfinish":
        baseDifficulty = 7 - (driver.position / drivers.length) * 3
        break
      case "topfive":
        baseDifficulty = 5 - (driver.position / drivers.length) * 2
        break
      case "overtakes":
        baseDifficulty = 4
        break
      case "energyefficiency":
        baseDifficulty = 3
        break
      default:
        baseDifficulty = 2
    }

    if (isNextLapBet) {
      baseDifficulty *= 1.5 // Increase difficulty for next lap bets
    }

    const randomFactor = 0.8 + Math.random() * 0.4 // Random factor between 0.8 and 1.2
    return Math.max(1.1, +(baseDifficulty * randomFactor).toFixed(2))
  }

  useEffect(() => {
    if (betType && betDriver) {
      const newMultiplier = calculateBetMultiplier(betType, betDriver)
      setBetMultiplier(newMultiplier)
    } else {
      setBetMultiplier(1)
    }
  }, [betType, betDriver])

  const handleSubmit = () => {
    onPlaceBet(betType, betDriver, betAmount, betMultiplier)
    setBetType("")
    setBetDriver("")
    setBetAmount("")
    setBetMultiplier(1)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">Regular Bets</TabsTrigger>
          <TabsTrigger value="nextLap">Next Lap Bets</TabsTrigger>
        </TabsList>
        <TabsContent value="regular">
          <div className="space-y-4">
            <Select 
              value={betType.startsWith('nextLap') ? '' : betType} 
              onValueChange={(value) => {
                setBetType(value)
                setBetDriver('')
                setBetAmount('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bet type" />
              </SelectTrigger>
              <SelectContent>
                {betOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={betDriver} onValueChange={(value) => setBetDriver(value)}>
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
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Bet amount"
              max={userPoints}
            />
          </div>
        </TabsContent>
        <TabsContent value="nextLap">
          <div className="space-y-4">
            <Select 
              value={betType.startsWith('nextLap') ? betType.slice(7) : ''}
              onValueChange={(value) => {
                setBetType(`nextLap${value.charAt(0).toUpperCase() + value.slice(1)}`)
                setBetDriver('')
                setBetAmount('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bet type" />
              </SelectTrigger>
              <SelectContent>
                {nextLapBetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={betDriver} onValueChange={(value) => setBetDriver(value)}>
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
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Bet amount"
              max={userPoints}
            />
          </div>
        </TabsContent>
      </Tabs>
      {betType && betDriver && betAmount && (
        <div className="text-sm text-muted-foreground">
          <p>Potential Win: {(Number(betAmount) * betMultiplier || 0).toFixed(2)} points</p>
          <p>Multiplier: {betMultiplier.toFixed(2)}x</p>
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={!betType || !betDriver || !betAmount || Number(betAmount) <= 0 || Number(betAmount) > userPoints}
        className="w-full"
      >
        Place Bet
      </Button>
    </div>
  )
}