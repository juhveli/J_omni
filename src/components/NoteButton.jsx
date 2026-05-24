import React, { useState, useEffect, useRef } from 'react';
import Sparkle from './Sparkle';

const NoteButton = ({ note, label, color, onStart, onStop, forceActive }) => {
  const [isActive, setIsActive] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const timeoutRef = useRef(null);

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

  const startPlaying = () => {
    if (isActive) return;
    setIsActive(true);
    addSparkle();
    onStart(note);
  };

  const stopPlaying = () => {
    if (!isActive) return;
    setIsActive(false);
    onStop(note);
  };

  // Handle external forceActive (keyboard or magic melody)
  useEffect(() => {
    if (forceActive) {
      if (!isActive) {
        setIsActive(true);
        addSparkle();
      }
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
    } else {
      timeoutRef.current = setTimeout(() => {
         setIsActive(false);
      }, 50); // Small debounce to prevent stuttering
    }
    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceActive]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startPlaying();
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    stopPlaying();
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

export default React.memo(NoteButton);
