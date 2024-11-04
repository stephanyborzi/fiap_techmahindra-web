import { useState, useEffect } from 'react';
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
} from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

export function useRaceViewers(raceId) {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!raceId) {
      console.warn('No raceId provided to useRaceViewers hook');
      return;
    }

    const db = getDatabase();

    const setupPresence = (uid) => {
      const userStatusRTDBRef = ref(db, `/status/${raceId}/${uid}`);

      const isOfflineForRTDB = {
        state: 'offline',
        last_changed: serverTimestamp(),
      };

      const isOnlineForRTDB = {
        state: 'online',
        last_changed: serverTimestamp(),
      };

      const connectedRef = ref(db, '.info/connected');

      const unsubscribeConnection = onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          console.log('Connected to RTDB');

          // When we disconnect, remove this device
          onDisconnect(userStatusRTDBRef)
            .set(isOfflineForRTDB)
            .then(() => {
              // Set the status to online
              set(userStatusRTDBRef, isOnlineForRTDB);
              console.log('Set online status in RTDB');
            })
            .catch((error) => {
              console.error('Error setting online status:', error);
            });
        } else {
          console.log('Disconnected from RTDB');
        }
      });

      return () => {
        unsubscribeConnection();
        // Clean up on unmount
        set(userStatusRTDBRef, isOfflineForRTDB);
        console.log('Set offline status in RTDB');
      };
    };

    let unsubscribePresence;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribePresence) {
        unsubscribePresence();
      }
      if (user) {
        console.log('User authenticated, setting up presence');
        unsubscribePresence = setupPresence(user.uid);
      } else {
        console.log('User not authenticated, setting up presence with anonymous ID');
        const anonymousId = 'anonymous_' + Math.random().toString(36).substr(2, 9);
        unsubscribePresence = setupPresence(anonymousId);
      }
    });

    const viewersRef = ref(db, `/status/${raceId}`);
    const unsubscribeViewerCount = onValue(viewersRef, (snapshot) => {
      if (snapshot.exists()) {
        const viewers = snapshot.val();
        const viewerIds = Object.keys(viewers);
        const onlineViewers = viewerIds.filter((id) => viewers[id].state === 'online');
        setViewerCount(onlineViewers.length);
        console.log('Updated viewer count:', onlineViewers.length);
      } else {
        setViewerCount(0);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeViewerCount();
      if (unsubscribePresence) {
        unsubscribePresence();
      }
    };
  }, [raceId]);

  return viewerCount;
}