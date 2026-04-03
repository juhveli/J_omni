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
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'A', isSharp: false },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 'S', isSharp: false },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'D', isSharp: false },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'F', isSharp: false },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'G', isSharp: false },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'H', isSharp: false },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'J', isSharp: false },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'K', isSharp: false }
  ],
  full: [
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'A', isSharp: false },
    { note: 'C#4', color: COLORS.black, label: 'C#', shortcut: 'W', isSharp: true },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 'S', isSharp: false },
    { note: 'D#4', color: COLORS.black, label: 'D#', shortcut: 'E', isSharp: true },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'D', isSharp: false },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'F', isSharp: false },
    { note: 'F#4', color: COLORS.black, label: 'F#', shortcut: 'T', isSharp: true },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'G', isSharp: false },
    { note: 'G#4', color: COLORS.black, label: 'G#', shortcut: 'Y', isSharp: true },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'H', isSharp: false },
    { note: 'A#4', color: COLORS.black, label: 'A#', shortcut: 'U', isSharp: true },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'J', isSharp: false },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'K', isSharp: false }
  ]
};

const DRUMS = [
  { note: 'C2', color: COLORS.C, label: '🥁', shortcut: 'A', isSharp: false }, // Kick
  { note: 'D2', color: COLORS.D, label: '💥', shortcut: 'S', isSharp: false }, // Snare
  { note: 'E2', color: COLORS.E, label: '🎩', shortcut: 'D', isSharp: false }, // HiHat
  { note: 'F2', color: COLORS.F, label: '✨', shortcut: 'F', isSharp: false }, // Crash
  { note: 'G2', color: COLORS.G, label: '🥢', shortcut: 'G', isSharp: false }  // Tom/Sticks
];

const SIMPLE_KEYS_MAP = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const FULL_KEYS_MAP = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12
};

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  // TODO: Implement multi-touch support

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

      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toLowerCase();
      let index = -1;

      if (currentInstrument === 'drums' || currentScale === 'simple') {
        index = SIMPLE_KEYS_MAP.indexOf(key);
      } else if (currentScale === 'full') {
        index = FULL_KEYS_MAP[key] !== undefined ? FULL_KEYS_MAP[key] : -1;
      }

      if (index >= 0 && index < notes.length) {
        const note = notes[index].note;
        setActiveNotes(prev => new Set(prev).add(note));
        handleStart(note);
      }
    };

    const handleKeyUp = (e) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toLowerCase();
      let index = -1;

      if (currentInstrument === 'drums' || currentScale === 'simple') {
        index = SIMPLE_KEYS_MAP.indexOf(key);
      } else if (currentScale === 'full') {
        index = FULL_KEYS_MAP[key] !== undefined ? FULL_KEYS_MAP[key] : -1;
      }

      if (index >= 0 && index < notes.length) {
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
          isSharp={n.isSharp}
          shortcut={n.shortcut}
          onStart={handleStart}
          onStop={handleStop}
          forceActive={activeNotes.has(n.note)}
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
