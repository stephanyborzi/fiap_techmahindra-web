import React from 'react';
import Confetti from 'react-confetti';

const ConfettiAnimation = () => {
  return (
    <Confetti
      numberOfPieces={200}
      recycle={false}
      gravity={0.2}
    />
  );
};

export default ConfettiAnimation;