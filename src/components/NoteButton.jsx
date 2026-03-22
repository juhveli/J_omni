import React, { useState, useEffect } from 'react';
import Sparkle from './Sparkle';

const NoteButton = ({ note, label, color, onStart, onStop, forceActive }) => {
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

  const startPlaying = (fromPointer) => {
    if (isActive) return;
    setIsActive(true);
    addSparkle();
    if (fromPointer) {
      onStart(note);
    }
  };

  const stopPlaying = (fromPointer) => {
    if (!isActive) return;
    setIsActive(false);
    if (fromPointer) {
      onStop(note);
    }
  };

  // Handle external forceActive (keyboard or magic melody)
  // This only triggers visual changes, as the parent handles audio for these
  useEffect(() => {
    if (forceActive) {
      startPlaying(false);
    } else {
      stopPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceActive]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startPlaying(true);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    stopPlaying(true);
  };

  return (
    <button
      className={`note-btn ${isActive ? 'active' : ''}`}
      style={{ '--note-color': color, borderColor: color }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={`Play note ${label}`}
    >
      <span className="note-label">{label}</span>
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>
  );
};

export default NoteButton;
