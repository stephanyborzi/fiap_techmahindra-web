import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, increment } from 'firebase/firestore'

export const useUser = () => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        await createOrUpdateUserProfile(user)
        subscribeToUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribeAuth()
  }, [])

  const createOrUpdateUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const newProfile = {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        points: 3000,
        createdAt: serverTimestamp(),
      }
      await setDoc(userRef, newProfile)
      setUserProfile(newProfile)
    } else {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      })
      setUserProfile(userSnap.data())
    }
  }

  const subscribeToUserProfile = (userId) => {
    const userRef = doc(db, "users", userId)
    return onSnapshot(userRef, (doc) => {
      setUserProfile(doc.data())
    })
  }

  const updateUserPoints = async (userId, points) => {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      points: increment(points),
    })
  }

  return { user, userProfile, loading, updateUserPoints }
}
