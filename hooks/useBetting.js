import { useState, useEffect, useCallback } from 'react'
import { collection, doc, addDoc, updateDoc, increment, query, where, onSnapshot } from 'firebase/firestore'
import { getDatabase, ref, get } from 'firebase/database'
import { db } from '@/lib/firebase'
import { useToastContext } from '@/contexts/ToastContext'
import { useUser } from '@/hooks/useUser'
import { useRace } from '@/contexts/RaceContext'

export const useBetting = () => {
  const { showToast } = useToastContext()
  const { user, userProfile } = useUser()
  const { currentRaceId, raceStatus } = useRace()
  const [userBets, setUserBets] = useState([])

  useEffect(() => {
    if (!user || !currentRaceId) return

    const userBetsRef = collection(db, "races", currentRaceId, "userBets")
    const userBetsQuery = query(userBetsRef, where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(userBetsQuery, (snapshot) => {
      const bets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUserBets(bets)
    }, (error) => {
      console.error('Error in userBets listener:', error)
    })

    return () => unsubscribe()
  }, [user, currentRaceId])

  const fetchBetMultiplier = useCallback(async (raceId, betType, driverName) => {
    const database = getDatabase()
    try {
      const driverRef = ref(database, `races/${raceId}/drivers`)
      const snapshot = await get(driverRef)
      if (snapshot.exists()) {
        const driversData = snapshot.val()
        const driverData = Object.values(driversData).find(driver => driver.name === driverName)
        if (!driverData) {
          console.error(`Driver ${driverName} not found in race ${raceId}`)
          return 1
        }
        const multiplier = driverData.betMultipliers?.[betType]
        if (multiplier) {
          return multiplier
        } else {
          console.error(`Multiplier for betType ${betType} not found for driver ${driverName}`)
          return 1
        }
      }
    } catch (error) {
      console.error('Error fetching bet multiplier:', error)
    }
    return 1 // Default multiplier if fetching fails
  }, [])

  const placeBet = useCallback(async (betType, betDriver, betAmount) => {
    if (!user) throw new Error('User is not authenticated')
    if (!userProfile) throw new Error('User profile not loaded')
    if (!currentRaceId) throw new Error('Race not available')

    const amount = parseInt(betAmount, 10)
    if (isNaN(amount) || amount <= 0) {
      showToast('Invalid bet amount', 'error')
      throw new Error('Invalid bet amount')
    }

    if (amount > userProfile.points) {
      showToast('Insufficient points', 'error')
      throw new Error('Insufficient points')
    }

    const betMultiplier = await fetchBetMultiplier(currentRaceId, betType, betDriver)

    const newBet = {
      userId: user.uid,
      type: betType,           // Ensure this matches the expected type field
      driver: betDriver,       // Driver's name
      amount: amount,
      multiplier: betMultiplier,
      status: 'pending',       // Set initial status to 'pending'
      points: 0,
      timestamp: new Date(),
    }

    if (betType.startsWith('nextLap')) {
      newBet.lap = raceStatus.lapsCompleted + 1
    }

    try {
      await addDoc(collection(db, "races", currentRaceId, "userBets"), newBet)
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { points: increment(-amount) })
      showToast('Bet placed successfully', 'success')
    } catch (error) {
      console.error("Error placing bet:", error)
      showToast('Failed to place bet. Please try again.', 'error')
      throw error
    }
  }, [user, userProfile, currentRaceId, raceStatus, fetchBetMultiplier, showToast])

  return { userBets, placeBet, fetchBetMultiplier }
}