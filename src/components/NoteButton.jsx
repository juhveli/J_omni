import React, { useState } from 'react';

const NoteButton = ({ note, label, color, onPlay }) => {
  const [isActive, setIsActive] = useState(false);

  const handlePointerDown = (e) => {
      e.preventDefault();
      setIsActive(true);
      onPlay(note);
      setTimeout(() => setIsActive(false), 200); // Visual feedback reset
  };

  return (
    <button
      className={`note-btn ${isActive ? 'active' : ''}`}
      style={{ '--note-color': color, borderColor: color }}
      onPointerDown={handlePointerDown}
      aria-label={`Play note ${label}`}
    >
      <span className="note-label">{label}</span>
    </button>
  );
};

export default NoteButton;
