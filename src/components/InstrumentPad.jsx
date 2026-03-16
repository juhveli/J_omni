import React, { useEffect, useState } from 'react';
import NoteButton from './NoteButton';
import AudioEngine from '../utils/AudioEngine';

// Rainbow/Unicorn Palette
const COLORS = {
  C: '#FF6B97', // Pinkish Red
  D: '#FFAA5C', // Orange
  E: '#FFF78A', // Yellow
  F: '#6BCB77', // Green
  G: '#4D96FF', // Blue
  A: '#8D72E1', // Purple
  B: '#E668FF', // Violet
  black: '#444444' // Sharps/Flats
};

const SCALES = {
  simple: [
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'a' },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 's' },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'd' },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'f' },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'g' },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'h' },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'j' },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'k' }
  ],
  full: [
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'a' },
    { note: 'C#4', color: COLORS.black, label: 'C#', shortcut: 'w', isSharp: true },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 's' },
    { note: 'D#4', color: COLORS.black, label: 'D#', shortcut: 'e', isSharp: true },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'd' },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'f' },
    { note: 'F#4', color: COLORS.black, label: 'F#', shortcut: 't', isSharp: true },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'g' },
    { note: 'G#4', color: COLORS.black, label: 'G#', shortcut: 'y', isSharp: true },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'h' },
    { note: 'A#4', color: COLORS.black, label: 'A#', shortcut: 'u', isSharp: true },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'j' },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'k' }
  ]
};

const DRUMS = [
  { note: 'C2', color: COLORS.C, label: '🥁', shortcut: 'a' }, // Kick
  { note: 'D2', color: COLORS.D, label: '💥', shortcut: 's' }, // Snare
  { note: 'E2', color: COLORS.E, label: '🎩', shortcut: 'd' }, // HiHat
  { note: 'F2', color: COLORS.F, label: '✨', shortcut: 'f' }, // Crash
  { note: 'G2', color: COLORS.G, label: '🥢', shortcut: 'g' }  // Tom/Sticks
];

const KEY_MAPPINGS = {
  simple: { 'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7 },
  full: { 'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12 },
  drums: { 'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4 }
};

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNotes, setActiveNotes] = useState(new Set());

  let notes;
  if (currentInstrument === 'drums') {
    notes = DRUMS;
  } else {
    notes = SCALES[currentScale] || SCALES.simple;
  }

  const handleStart = (note) => {
    AudioEngine.startNote(note);
  };

  const handleStop = (note) => {
    AudioEngine.stopNote(note);
  };

  useEffect(() => {
    // Subscribe to AudioEngine note events (visual feedback for Magic Melody)
    const unsubscribe = AudioEngine.subscribeToNotes((note) => {
      setActiveNotes(prev => new Set(prev).add(note));
      // Reset after short delay to simulate press release for discrete melody events
      setTimeout(() => {
        setActiveNotes(prev => {
          const updated = new Set(prev);
          updated.delete(note);
          return updated;
        });
      }, 300);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const mode = currentInstrument === 'drums' ? 'drums' : currentScale;
      const index = KEY_MAPPINGS[mode]?.[key];

      if (index !== undefined && index >= 0 && index < notes.length) {
        const note = notes[index].note;
        setActiveNotes(prev => new Set(prev).add(note));
        handleStart(note);
      }
    };

    const handleKeyUp = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const mode = currentInstrument === 'drums' ? 'drums' : currentScale;
      const index = KEY_MAPPINGS[mode]?.[key];

      if (index !== undefined && index >= 0 && index < notes.length) {
        const note = notes[index].note;
        setActiveNotes(prev => {
          const updated = new Set(prev);
          updated.delete(note);
          return updated;
        });
        handleStop(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [notes, currentInstrument, currentScale]);

  return (
    <div className={`instrument-pad ${currentInstrument === 'drums' ? 'simple' : currentScale}`}>
      {notes.map((n) => (
        <NoteButton
          key={n.note}
          note={n.note}
          color={n.color}
          label={n.label}
          onStart={handleStart}
          onStop={handleStop}
          forceActive={activeNotes.has(n.note)}
          shortcut={n.shortcut}
          isSharp={n.isSharp}
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
