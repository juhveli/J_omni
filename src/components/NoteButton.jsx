import React, { useState, useEffect } from 'react';
import Sparkle from './Sparkle';

const NoteButton = ({ note, label, color, onPlay, forceActive }) => {
  const [isActive, setIsActive] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const addSparkle = () => {
    const id = Date.now();
    const style = {
      left: `${50 + (Math.random() * 40 - 20)}%`,
      top: `${50 + (Math.random() * 40 - 20)}%`,
      fontSize: `${Math.random() + 1}rem`
    };
    setSparkles(prev => [...prev, { id, style }]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 1000);
  };

  const triggerInteraction = (playSound = true) => {
      if (playSound) onPlay(note);
      setIsActive(true);
      addSparkle();
      setTimeout(() => setIsActive(false), 200);
  };

  // Handle external forceActive (keyboard from parent)
  useEffect(() => {
    if (forceActive) {
      triggerInteraction(false); // Don't play sound, parent handled it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceActive]);

  const handlePointerDown = (e) => {
    // Prevents focus and mouse click emission on some browsers, avoiding double-fire
    // while keeping the UI responsive.
    if (e.cancelable) e.preventDefault();
    triggerInteraction(true);
  };

  const handleClick = () => {
     // This handles Keyboard interactions (Enter/Space) where pointer events don't fire.
     // For mouse/touch, handlePointerDown's preventDefault() suppresses this click.
     triggerInteraction(true);
  };

  return (
    <button
      className={`note-btn ${isActive ? 'active' : ''}`}
      style={{ '--note-color': color, borderColor: color }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label={`Play note ${label}`}
    >
      <span className="note-label">{label}</span>
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>
  );
};

export default NoteButton;
