import React, { useEffect } from 'react';
import './EmojiRainAnimation.css';

const EmojiRainAnimation = ({ emoji, containerRef }) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const emojiRainContainer = document.createElement('div');
    emojiRainContainer.className = 'emoji-rain-container';
    containerRef.current.appendChild(emojiRainContainer);

    for (let i = 0; i < 30; i++) {
      const emojiElement = document.createElement('div');
      emojiElement.className = 'emoji';
      emojiElement.innerText = emoji;
      emojiElement.style.left = Math.random() * 100 + 'vw';
      emojiElement.style.animationDelay = Math.random() * 2 + 's';
      emojiRainContainer.appendChild(emojiElement);
    }

    // Remove the container after the animation duration
    const timer = setTimeout(() => {
      if (containerRef.current && containerRef.current.contains(emojiRainContainer)) {
        containerRef.current.removeChild(emojiRainContainer);
      }
    }, 5000); // Set to 5 seconds to ensure all animations complete

    return () => {
      clearTimeout(timer);
      if (containerRef.current && containerRef.current.contains(emojiRainContainer)) {
        containerRef.current.removeChild(emojiRainContainer);
      }
    };
  }, [emoji, containerRef]);

  return null;
};

export default EmojiRainAnimation;
