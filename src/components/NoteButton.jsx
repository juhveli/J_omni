import React, { useState, useEffect } from 'react';
import Sparkle from './Sparkle';

const NoteButton = ({ note, label, color, onPlay, forceActive, keyboardShortcut, isSharp }) => {
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

  const handleInteraction = () => {
    if (!forceActive) onPlay(note); // Only play if not already playing via prop
    setIsActive(true);
    addSparkle();
    setTimeout(() => setIsActive(false), 200);
  };

  // Handle external forceActive (keyboard)
  useEffect(() => {
    if (forceActive) {
      handleInteraction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceActive]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    onPlay(note);
    setIsActive(true);
    addSparkle();
    setTimeout(() => setIsActive(false), 200);
  };

  // For mouse click fallbacks if pointer events fail (though pointerdown covers both)
  const handleClick = () => {
     // Usually covered by pointerdown, but good for a11y keyboard triggering if we separate handlers
     // Keyboard 'Enter' triggers onClick
     onPlay(note);
     setIsActive(true);
     addSparkle();
     setTimeout(() => setIsActive(false), 200);
  };

  return (
    <button
      className={`note-btn ${isActive ? 'active' : ''} ${isSharp ? 'sharp' : ''}`}
      style={{ '--note-color': color, borderColor: color }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label={`Play note ${label}`}
    >
      <span className="note-label">{label}</span>
      {keyboardShortcut && <span className="keyboard-hint">{keyboardShortcut}</span>}
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>
  );
};

export default NoteButton;
