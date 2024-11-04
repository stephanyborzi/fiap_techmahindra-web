import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Gauge, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Card className="bg-red-50 dark:bg-red-900">
      <CardHeader>
        <CardTitle>Something went wrong:</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm">{error.message}</pre>
        <Button onClick={resetErrorBoundary} className="mt-4">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SelectedDriverCard({
  selectedDriver,
  drivers,
  setSelectedDriver,
  raceData,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Sort drivers by name
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => a.name.localeCompare(b.name));
  }, [drivers]);

  // **Add this useEffect to initialize selectedDriver**
  useEffect(() => {
    if (!selectedDriver && sortedDrivers.length > 0) {
      setSelectedDriver(sortedDrivers[0]);
    }
  }, [selectedDriver, sortedDrivers, setSelectedDriver]);

  const selectNextDriver = useCallback(() => {
    const currentIndex = sortedDrivers.findIndex(
      (d) => d.name === selectedDriver?.name
    );
    const nextIndex = (currentIndex + 1) % sortedDrivers.length;
    setSelectedDriver(sortedDrivers[nextIndex]);
  }, [sortedDrivers, selectedDriver, setSelectedDriver]);

  const selectPreviousDriver = useCallback(() => {
    const currentIndex = sortedDrivers.findIndex(
      (d) => d.name === selectedDriver?.name
    );
    const previousIndex =
      (currentIndex - 1 + sortedDrivers.length) % sortedDrivers.length;
    setSelectedDriver(sortedDrivers[previousIndex]);
  }, [sortedDrivers, selectedDriver, setSelectedDriver]);

  const getDriverData = useCallback(
    (driverName) => {
      if (!raceData || !raceData.drivers)
        return {
          name: driverName,
          speed: 0,
          energyManagement: { efficiency: 0 },
          performance: { consistency: 0, racecraft: 0 },
        };
      const driver = raceData.drivers.find((d) => d.name === driverName);
      return (
        driver || {
          name: driverName,
          speed: 0,
          energyManagement: { efficiency: 0 },
          performance: { consistency: 0, racecraft: 0 },
        }
      );
    },
    [raceData]
  );

  const selectedDriverData = useMemo(
    () => (selectedDriver ? getDriverData(selectedDriver.name) : null),
    [getDriverData, selectedDriver]
  );

  if (!selectedDriverData) {
    return null; // Or render a loading indicator or placeholder
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setSelectedDriver(sortedDrivers[0])}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDriver.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="h-full flex flex-col"
        >
          <Card className="bg-white dark:bg-gray-800 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-2xl font-bold text-primary dark:text-primary-light">
                <div className="flex items-center gap-2">
                  <Gauge className="w-6 h-6" aria-hidden="true" />
                  <span className="truncate max-w-[200px]">
                    {selectedDriver.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={selectPreviousDriver}
                      aria-label="Previous driver"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <Select
                    value={selectedDriver.name}
                    onValueChange={(value) =>
                      setSelectedDriver(
                        sortedDrivers.find((d) => d.name === value) ||
                          sortedDrivers[0]
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedDrivers.map((driver) => (
                        <SelectItem key={driver.name} value={driver.name}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={selectNextDriver}
                      aria-label="Next driver"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-6">
                <DriverStat
                  icon={
                    <Gauge className="w-5 h-5 text-primary dark:text-primary-light" />
                  }
                  label="Speed"
                  value={selectedDriverData.speed}
                  unit="km/h"
                  maxValue={250}
                />
                <DriverStat
                  icon={
                    <Zap className="w-5 h-5 text-primary dark:text-primary-light" />
                  }
                  label="Energy Efficiency"
                  value={selectedDriverData.energyManagement.efficiency}
                  unit="%"
                  maxValue={100}
                />
                <DriverStat
                  icon={
                    <Gauge className="w-5 h-5 text-primary dark:text-primary-light rotate-45" />
                  }
                  label="Consistency"
                  value={selectedDriverData.performance.consistency}
                  unit="%"
                  maxValue={100}
                />
                <DriverStat
                  icon={
                    <ChevronRight className="w-5 h-5 text-primary dark:text-primary-light" />
                  }
                  label="Racecraft"
                  value={selectedDriverData.performance.racecraft}
                  unit="%"
                  maxValue={100}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

function DriverStat({ icon, label, value, unit, maxValue }) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
        <span className="font-bold text-gray-800 dark:text-gray-200">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="bg-primary dark:bg-primary-light h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></motion.div>
      </div>
    </div>
  );
}