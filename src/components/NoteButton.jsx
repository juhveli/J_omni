import React, { useState, useEffect, memo } from 'react';
import Sparkle from './Sparkle';

const NoteButton = memo(({ note, label, color, onPlay, forceActive, shortcut, isSharp }) => {
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
    // If this is called from forceActive (keyboard/auto), we assume onPlay was already called or isn't needed here
    // But if called from UI interaction, we need to call onPlay.
    setIsActive(true);
    addSparkle();
    setTimeout(() => setIsActive(false), 200);
  };

  // Handle external forceActive (keyboard / magic melody)
  useEffect(() => {
    if (forceActive) {
      handleInteraction();
    }
  }, [forceActive]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    onPlay(note);
    handleInteraction();
  };

  const handleClick = (e) => {
     // Only trigger if it's a keyboard 'click' (detail === 0)
     // mouse/touch clicks are handled by pointerdown + preventDefault
     if (e.detail === 0) {
        onPlay(note);
        handleInteraction();
     }
  };

  return (
    <button
      className={`note-btn ${isActive ? 'active' : ''} ${isSharp ? 'sharp' : ''}`}
      style={{ '--note-color': color, borderColor: color }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label={`Play note ${label}${shortcut ? ` (Key: ${shortcut.toUpperCase()})` : ''}`}
    >
      <span className="note-label">{label}</span>
      {shortcut && <span className="keyboard-hint">{shortcut.toUpperCase()}</span>}
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>
  );
});

export default NoteButton;
