import React from 'react';
import './SparklesAnimation.css';

const SparklesAnimation = () => {
  return (
    <div className="sparkles-animation">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="sparkle"></div>
      ))}
    </div>
  );
};

export default SparklesAnimation;