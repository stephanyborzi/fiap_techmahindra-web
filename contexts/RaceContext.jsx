"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebase"; // Firestore instance

const RaceContext = createContext(undefined);

export const useRace = () => {
  const context = useContext(RaceContext);
  if (context === undefined) {
    throw new Error("useRace must be used within a RaceProvider");
  }
  return context;
};

export const RaceProvider = ({ children }) => {
  const [currentRaceId, setCurrentRaceId] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [betOptions, setBetOptions] = useState([]);
  const [nextLapBetOptions, setNextLapBetOptions] = useState([]);
  const [isRaceFinished, setIsRaceFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Fetch bet options from Firestore
    const fetchInitialData = async () => {
      try {
        const [betOptionsSnapshot, nextLapBetOptionsSnapshot] = await Promise.all([
          getDocs(collection(firestoreDb, "betOptions")),
          getDocs(collection(firestoreDb, "nextLapBetOptions")),
        ]);

        setBetOptions(betOptionsSnapshot.docs.map((doc) => doc.data()));
        setNextLapBetOptions(nextLapBetOptionsSnapshot.docs.map((doc) => doc.data()));
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("An error occurred while fetching initial data")
        );
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const racesRef = ref(db, "races");
    const racesQuery = query(racesRef, orderByChild("startTime"), limitToLast(1));

    const unsubscribe = onValue(
      racesQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const racesData = snapshot.val();
          const raceIds = Object.keys(racesData);
          const raceId = raceIds[0];
          const race = racesData[raceId];

          setCurrentRaceId(raceId);
          setRaceData((prevData) => ({ ...prevData, ...race }));
          setIsRaceFinished(race.status === "finished");
          setDrivers(race.drivers ? Object.values(race.drivers) : []);
        } else {
          // No races found
          setCurrentRaceId(null);
          setRaceData(null);
          setDrivers([]);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentRaceId) return;

    const db = getDatabase();
    const raceRef = ref(db, `races/${currentRaceId}`);

    // Subscribe to raceStatus
    const raceStatusRef = ref(db, `races/${currentRaceId}/raceStatus`);
    const unsubscribeRaceStatus = onValue(
      raceStatusRef,
      (snapshot) => {
        const raceStatus = snapshot.val();
        setRaceData((prevData) => ({ ...prevData, raceStatus }));
        setIsRaceFinished(raceStatus?.status === "finished");
      },
      (err) => {
        setError(err);
      }
    );

    // Subscribe to drivers
    const driversRef = ref(db, `races/${currentRaceId}/drivers`);
    const unsubscribeDrivers = onValue(
      driversRef,
      (snapshot) => {
        const driversData = snapshot.val();
        const driversList = driversData ? Object.values(driversData) : [];
        setDrivers(driversList);
        setRaceData((prevData) => ({ ...prevData, drivers: driversList }));
      },
      (err) => {
        setError(err);
      }
    );

    // Subscribe to latestLapData
    const latestLapDataRef = ref(db, `races/${currentRaceId}/latestLapData`);
    const unsubscribeLatestLapData = onValue(
      latestLapDataRef,
      (snapshot) => {
        const latestLapData = snapshot.val();
        setRaceData((prevData) => ({ ...prevData, latestLapData }));
      },
      (err) => {
        setError(err);
      }
    );

    // Subscribe to viewerCount
    const viewersRef = ref(db, `/status/${currentRaceId}`);
    const unsubscribeViewerCount = onValue(
      viewersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const viewers = snapshot.val();
          const viewerIds = Object.keys(viewers);
          const onlineViewers = viewerIds.filter((id) => viewers[id].state === 'online');
          setViewerCount(onlineViewers.length);
        } else {
          setViewerCount(0);
        }
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsubscribeRaceStatus();
      unsubscribeDrivers();
      unsubscribeLatestLapData();
      unsubscribeViewerCount();
    };
  }, [currentRaceId]);

  const value = {
    currentRaceId,
    raceData,
    drivers,
    betOptions,
    nextLapBetOptions,
    isRaceFinished,
    isLoading,
    error,
    viewerCount,
  };

  return <RaceContext.Provider value={value}>{children}</RaceContext.Provider>;
};