import './FireworksAnimation.css';
import React, { useEffect, useRef } from 'react';
import { Fireworks } from 'fireworks-js';

const FireworksAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const fireworks = new Fireworks(containerRef.current, {
      rocketsPoint: 50,
      speed: 3,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 200,
      trace: 3,
      explosion: 5,
      brightness: {
        min: 50,
        max: 80,
      },
      decay: {
        min: 0.015,
        max: 0.03,
      },
      delay: {
        min: 10,
        max: 15,
      },
    });

    fireworks.start();

    return () => fireworks.stop();
  }, []);

  return <div ref={containerRef} className="fireworks-animation"></div>;
};

export default FireworksAnimation;