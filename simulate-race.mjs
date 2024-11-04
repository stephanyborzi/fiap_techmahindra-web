import admin from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };

// Initialize Firebase Admin SDK with Firestore and Realtime Database
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://challenge-mahindra-default-rtdb.firebaseio.com/', // Replace with your database URL
});

const firestore = admin.firestore();
const db = admin.database();

async function startRaceSimulation() {
  // Fetch drivers from Firestore
  const driversSnapshot = await firestore.collection('drivers').get();
  const drivers = driversSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Fetch initial race status from Firestore
  const initialRaceStatusDoc = await firestore.collection('initialRaceStatus').doc('default').get();
  const initialRaceStatus = initialRaceStatusDoc.exists
    ? initialRaceStatusDoc.data()
    : { lapsCompleted: 0, totalLaps: 45, timeElapsed: '00:00:00' };

  // Check if there's an ongoing race in the Realtime Database
  const ongoingRace = await findOngoingRace();

  let raceRef;
  let raceData;
  let raceId;

  if (ongoingRace) {
    console.log(`Continuing existing race with ID: ${ongoingRace.id}`);
    raceId = ongoingRace.id;
    raceRef = db.ref(`races/${raceId}`);
    const raceSnapshot = await raceRef.once('value');
    raceData = raceSnapshot.val();

    raceData.elapsedTimeSeconds ??= 0;
    raceData.lapAccumulatedTime ??= 0;
    raceData.lapCompletedFlag = false;
    raceData.extraLapAdded ??= false;

    raceData.drivers = raceData.drivers?.length
      ? raceData.drivers.map(initializeDriverDefaults)
      : initializeDrivers(drivers);
  } else {
    // Start a new race if no ongoing race is found
    console.log('Starting a new race');
    raceData = {
      startTime: Date.now(),
      status: 'in_progress',
      raceStatus: initialRaceStatus,
      drivers: initializeDrivers(drivers),
      elapsedTimeSeconds: 0,
      lapAccumulatedTime: 0,
      lapCompletedFlag: false,
      extraLapAdded: false,
      latestLapData: { lap: 0, leader: '', gap: '0.000s', drivers: [] },
    };

    // Create a new race entry in Realtime Database
    raceRef = db.ref('races').push();
    raceId = raceRef.key;
    console.log(`New race created with ID: ${raceId}`);
    await raceRef.set(raceData);
  }

  console.log(`Race ID being used: ${raceId}`);

  const deltaTime = 0.1; // 100 milliseconds in seconds

  const interval = setInterval(async () => {
    updateRaceData(raceData, deltaTime);
    await updateRealtimeDatabase(raceRef, raceData);

    if (raceData.lapCompletedFlag) {
      await validateNextLapBets(raceId, raceData);
      raceData.lapCompletedFlag = false;
    }

    // Check if the race should end
    console.log(`Current lap: ${raceData.raceStatus.lapsCompleted}/${raceData.raceStatus.totalLaps}`);
    if (raceData.raceStatus.lapsCompleted >= raceData.raceStatus.totalLaps) {
      console.log(`Race ${raceId} is ending. Clearing interval...`);
      clearInterval(interval);
      try {
        await completeRace(raceId, raceData);
      } catch (error) {
        console.error(`Error completing race ${raceId}:`, error);
      } finally {
        console.log(`Race ${raceId} simulation completed. Exiting in 5 seconds...`);
        setTimeout(() => {
          console.log(`Exiting process for race ${raceId}`);
          process.exit(0);
        }, 5000); // Wait for 5 seconds before exiting
      }
    }
  }, 100); // Update every 100 milliseconds

  // Add this line to keep the Node.js process running
  await new Promise(resolve => {}); 
}

function initializeDrivers(drivers) {
  return drivers.map((driver) => ({
    name: driver.name,
    position: null,
    lapTime: null,
    speed: null,
    battery: 100, // 100% battery at start
    energy: 52,   // Starting with 52 kWh
    performance: { averageSpeed: 200, consistency: 80, racecraft: 80 },
    energyManagement: { efficiency: 90 + Math.random() * 10 },
    overtakingData: { overtakes: 0, defensiveActions: 0 },
    bettingTrends: { bets: 0 },
    betMultipliers: {
      winner: null, fastestLap: null, podiumFinish: null,
      topFive: null, nextLapFastestLap: null,
      nextLapOvertakes: null, nextLapEnergyEfficiency: null,
    },
  }));
}

function initializeDriverDefaults(driver) {
  return {
    ...driver,
    performance: driver.performance || { averageSpeed: 200, consistency: 80, racecraft: 80 },
    energyManagement: driver.energyManagement || { efficiency: 90 + Math.random() * 10 },
    overtakingData: driver.overtakingData || { overtakes: 0, defensiveActions: 0 },
    bettingTrends: driver.bettingTrends || { bets: 0 },
    battery: driver.battery ?? 100,
    energy: driver.energy ?? 52,
  };
}

async function findOngoingRace() {
  const racesRef = db.ref('races');
  const snapshot = await racesRef.orderByChild('status').equalTo('in_progress').once('value');

  if (snapshot.exists()) {
    const races = snapshot.val();
    const raceIds = Object.keys(races);
    const raceId = raceIds[0];
    return { id: raceId, ...races[raceId] };
  }
  return null;
}

function updateRaceData(raceData, deltaTime) {
  const { raceStatus, drivers } = raceData;

  raceData.elapsedTimeSeconds += deltaTime;
  raceData.lapAccumulatedTime += deltaTime;
  raceStatus.timeElapsed = secondsToTimeString(raceData.elapsedTimeSeconds);

  drivers.forEach((driver) => {
    // Calculate lap time based on driver performance and consistency
    const baseLapTime = 90; // Base lap time in seconds
    const lapSpeedFactor = (220 - driver.performance.averageSpeed) / 20;
    const consistencyFactor = (100 - driver.performance.consistency) / 100;
    const randomVariation = (Math.random() - 0.5) * 0.2; // Reduced randomness for consistency
    const lapTimeSeconds =
      baseLapTime + lapSpeedFactor * 2 + consistencyFactor * 2 + randomVariation;

    driver.lapTime = secondsToLapTime(lapTimeSeconds);
    driver.speed =
      driver.performance.averageSpeed + (Math.random() - 0.5) * 0.5;

    // Energy calculations remain the same
    const totalRaceEnergy = 52;
    const baseEnergyUsagePerLap = totalRaceEnergy / raceStatus.totalLaps;
    const efficiencyFactor = (100 - driver.energyManagement.efficiency) / 100;
    const speedFactor = (driver.speed - 180) / 40;
    const energyUsedThisLap =
      baseEnergyUsagePerLap * (1 + efficiencyFactor + speedFactor * 0.05);
    const regenerationThisLap = baseEnergyUsagePerLap * 0.1;

    driver.energy = Math.max(
      0,
      driver.energy - energyUsedThisLap + regenerationThisLap
    );
    driver.battery = Math.min((driver.energy / totalRaceEnergy) * 100, 100);

    // Update performance parameters slightly over time
    driver.performance.averageSpeed = Math.max(
      180,
      Math.min(220, driver.performance.averageSpeed + (Math.random() - 0.5) * 0.1)
    );
    driver.performance.consistency = Math.max(
      70,
      Math.min(100, driver.performance.consistency + (Math.random() - 0.5) * 0.1)
    );
    driver.performance.racecraft = Math.max(
      70,
      Math.min(100, driver.performance.racecraft + (Math.random() - 0.5) * 0.1)
    );
  });

  // Simulate overtakes between drivers
  for (let i = drivers.length - 1; i > 0; i--) {
    const driver = drivers[i];
    const driverAhead = drivers[i - 1];

    // Calculate overtake probability based on performance and speed difference
    const performanceDifference =
      driver.performance.racecraft - driverAhead.performance.racecraft;
    const speedDifference = driver.speed - driverAhead.speed;
    const baseOvertakeProbability = 0.02; // Base 2% chance
    const performanceFactor = performanceDifference / 500; // Adjust for performance difference
    const speedFactor = speedDifference / 100; // Adjust for speed difference
    const overtakeProbability =
      baseOvertakeProbability + performanceFactor + speedFactor;

    if (Math.random() < overtakeProbability) {
      // Overtake occurs
      // Swap positions in the array
      [drivers[i], drivers[i - 1]] = [drivers[i - 1], drivers[i]];

      // Update overtaking data
      driver.overtakingData.overtakes += 1;
      driverAhead.overtakingData.defensiveActions += 1;
    }
  }

  // Update positions based on the new order
  drivers.forEach((driver, index) => {
    driver.position = index + 1;
  });

  // Update latest lap data
  raceData.latestLapData = {
    lap: raceStatus.lapsCompleted,
    leader: drivers[0].name,
    gap:
      lapTimeDifference(
        drivers[0].lapTime,
        drivers[1]?.lapTime || drivers[0].lapTime
      ) + 's',
    drivers: drivers.map((driver) => ({
      name: driver.name,
      position: driver.position,
      lapTime: driver.lapTime,
      speed: driver.speed.toFixed(2),
      battery: driver.battery.toFixed(2),
      energy: driver.energy.toFixed(2),
    })),
  };

  // Check if a lap has been completed
  if (raceData.lapAccumulatedTime >= lapTimeToSeconds('1:30')) {
    // Assuming average lap time of 1 minute 30 seconds
    raceStatus.lapsCompleted += 1;
    raceData.lapAccumulatedTime -= lapTimeToSeconds('1:30');
    raceData.lapCompletedFlag = true;
  } else {
    raceData.lapCompletedFlag = false;
  }
}

function lapTimeToSeconds(lapTime) {
  const [minutes, seconds] = lapTime.split(':');
  return parseInt(minutes) * 60 + parseFloat(seconds);
}

function secondsToLapTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${seconds}`;
}

function lapTimeDifference(lapTime1, lapTime2) {
  const diff = Math.abs(lapTimeToSeconds(lapTime1) - lapTimeToSeconds(lapTime2));
  return diff.toFixed(3);
}

function timeStringToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function secondsToTimeString(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function removeUndefinedAndNull(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedAndNull(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        newObj[key] = removeUndefinedAndNull(value);
      }
    });
    return newObj;
  }
  return obj;
}

async function updateRealtimeDatabase(raceRef, raceData) {
  try {
    const cleanRaceStatus = removeUndefinedAndNull(raceData.raceStatus);
    const cleanLatestLapData = removeUndefinedAndNull(raceData.latestLapData);
    const cleanDrivers = removeUndefinedAndNull(raceData.drivers);

    await raceRef.update({
      'raceStatus/lapsCompleted': cleanRaceStatus.lapsCompleted,
      'raceStatus/timeElapsed': cleanRaceStatus.timeElapsed,
      'elapsedTimeSeconds': raceData.elapsedTimeSeconds,
      'lapAccumulatedTime': raceData.lapAccumulatedTime,
      'latestLapData': cleanLatestLapData,
    });

    await raceRef.child('drivers').set(cleanDrivers);
    console.log(`Updated RTDB for lap ${cleanRaceStatus.lapsCompleted}, timeElapsed: ${cleanRaceStatus.timeElapsed}`);
  } catch (error) {
    console.error('Error updating Realtime Database:', error);
  }
}

function calculateBetMultipliers(drivers) {
  const multipliers = {};
  const totalDrivers = drivers.length || 1;
  drivers.forEach((driver) => {
    const position = driver.position || 1;
    multipliers[driver.name] = {
      winner: calculateMultiplier(10 - (position / totalDrivers) * 5),
      fastestLap: calculateMultiplier(5),
      podiumFinish: calculateMultiplier(7 - (position / totalDrivers) * 3),
      topFive: calculateMultiplier(5 - (position / totalDrivers) * 2),
      nextLapFastestLap: calculateMultiplier(5),
      nextLapOvertakes: calculateMultiplier(4),
      nextLapEnergyEfficiency: calculateMultiplier(3),
    };
  });
  return multipliers;
}

function calculateMultiplier(baseDifficulty) {
  return Math.max(1.1, Math.min(10, baseDifficulty));
}

async function validateNextLapBets(raceId, raceData) {
  const lapNumber = raceData.raceStatus.lapsCompleted;
  const nextLapBetsSnapshot = await firestore.collection('races').doc(raceId).collection('nextLapBets').where('lap', '==', lapNumber).get();

  if (nextLapBetsSnapshot.empty) return;

  for (const betDoc of nextLapBetsSnapshot.docs) {
    const bet = betDoc.data();
    let betResult = 'lost';
    let pointsChange = 0; // Initialize to 0 instead of -bet.amount

    const driver = raceData.drivers.find((d) => d.name === bet.driver);

    if (driver) {
      switch (bet.type) {
        case 'nextLapFastestLap':
          const fastestLapDriver = raceData.latestLapData.drivers.reduce(
            (prev, curr) => lapTimeToSeconds(prev.lapTime) < lapTimeToSeconds(curr.lapTime) ? prev : curr
          );
          if (fastestLapDriver.name === bet.driver) {
            betResult = 'won';
            pointsChange = Math.floor(bet.amount * bet.multiplier);
          }
          break;
        case 'nextLapOvertakes':
          if (driver.overtakingData.overtakes > 0) {
            betResult = 'won';
            pointsChange = Math.floor(bet.amount * bet.multiplier);
          }
          break;
        case 'nextLapEnergyEfficiency':
          if (driver.energyManagement.efficiency > 90) {
            betResult = 'won';
            pointsChange = Math.floor(bet.amount * bet.multiplier);
          }
          break;
        default:
          betResult = 'lost';
      }
    }

    await firestore.runTransaction(async (transaction) => {
      const betRef = betDoc.ref;
      const userRef = firestore.collection('users').doc(bet.userId);
      const userDoc = await transaction.get(userRef);
      let userPoints = userDoc.data().points || 0;

      userPoints += pointsChange; // Only add points if won, don't subtract if lost
      transaction.update(betRef, { status: betResult, points: pointsChange });
      transaction.update(userRef, { points: userPoints });
    });
  }
}

async function completeRace(raceId, raceData) {
  console.log(`Starting to complete race with ID: ${raceId}`);
  try {
    const winner = raceData.drivers.find((driver) => driver.position === 1).name;
    console.log(`Winner of race ${raceId}: ${winner}`);

    const betsSnapshot = await firestore.collection('races').doc(raceId).collection('userBets').get();
    console.log(`Fetched ${betsSnapshot.size} bets for race ${raceId}`);

    if (betsSnapshot.empty) {
      console.log(`No bets found for race ${raceId}`);
    } else {
      // Process bets (existing code)
      for (const betDoc of betsSnapshot.docs) {
        const bet = betDoc.data();
        let betResult = 'lost';
        let pointsChange = 0; // Initialize to 0 instead of -bet.amount

        const driver = raceData.drivers.find((d) => d.name === bet.driver);

        if (driver) {
          switch (bet.type) {
            case 'winner':
              if (driver.name === winner) {
                betResult = 'won';
                pointsChange = Math.floor(bet.amount * bet.multiplier);
              }
              break;
            case 'fastestLap':
              const fastestLapDriver = raceData.drivers.reduce((prev, curr) =>
                lapTimeToSeconds(prev.lapTime) < lapTimeToSeconds(curr.lapTime) ? prev : curr
              );
              if (driver.name === fastestLapDriver.name) {
                betResult = 'won';
                pointsChange = Math.floor(bet.amount * bet.multiplier);
              }
              break;
            case 'podiumFinish':
              if (driver.position <= 3) {
                betResult = 'won';
                pointsChange = Math.floor(bet.amount * bet.multiplier);
              }
              break;
            case 'topFive':
              if (driver.position <= 5) {
                betResult = 'won';
                pointsChange = Math.floor(bet.amount * bet.multiplier);
              }
              break;
            default:
              betResult = 'lost';
          }
        }

        await firestore.runTransaction(async (transaction) => {
          const betRef = betDoc.ref;
          const userRef = firestore.collection('users').doc(bet.userId);
          const userDoc = await transaction.get(userRef);
          let userPoints = userDoc.data().points || 0;

          userPoints += pointsChange; // Only add points if won, don't subtract if lost
          transaction.update(betRef, { status: betResult, points: pointsChange });
          transaction.update(userRef, { points: userPoints });
        });
      }
    }

    console.log(`Updating Realtime Database for race ${raceId}`);
    const raceRef = db.ref(`races/${raceId}`);
    await raceRef.update({
      status: 'finished',
      winner: winner,
      endTime: Date.now(),
    });

    console.log(`Race ${raceId} completed. Winner: ${winner}`);
  } catch (error) {
    console.error(`Error completing race ${raceId}:`, error);
  }
}

// Wrap the startRaceSimulation call in an async function
async function run() {
  try {
    await startRaceSimulation();
  } catch (error) {
    console.error('Error in race simulation:', error);
    process.exit(1);
  }
}

run();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Place this at the end of your file, after the `run()` call

