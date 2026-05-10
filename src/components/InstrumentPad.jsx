import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    { note: 'C4', color: COLORS.C, label: 'C' },
    { note: 'D4', color: COLORS.D, label: 'D' },
    { note: 'E4', color: COLORS.E, label: 'E' },
    { note: 'F4', color: COLORS.F, label: 'F' },
    { note: 'G4', color: COLORS.G, label: 'G' },
    { note: 'A4', color: COLORS.A, label: 'A' },
    { note: 'B4', color: COLORS.B, label: 'B' },
    { note: 'C5', color: COLORS.C, label: 'C' }
  ],
  full: [
    { note: 'C4', color: COLORS.C, label: 'C' },
    { note: 'C#4', color: COLORS.black, label: 'C#' },
    { note: 'D4', color: COLORS.D, label: 'D' },
    { note: 'D#4', color: COLORS.black, label: 'D#' },
    { note: 'E4', color: COLORS.E, label: 'E' },
    { note: 'F4', color: COLORS.F, label: 'F' },
    { note: 'F#4', color: COLORS.black, label: 'F#' },
    { note: 'G4', color: COLORS.G, label: 'G' },
    { note: 'G#4', color: COLORS.black, label: 'G#' },
    { note: 'A4', color: COLORS.A, label: 'A' },
    { note: 'A#4', color: COLORS.black, label: 'A#' },
    { note: 'B4', color: COLORS.B, label: 'B' },
    { note: 'C5', color: COLORS.C, label: 'C' }
  ]
};

const DRUMS = [
  { note: 'C2', color: COLORS.C, label: '🥁' }, // Kick
  { note: 'D2', color: COLORS.D, label: '💥' }, // Snare
  { note: 'E2', color: COLORS.E, label: '🎩' }, // HiHat
  { note: 'F2', color: COLORS.F, label: '✨' }, // Crash
  { note: 'G2', color: COLORS.G, label: '🥢' }  // Tom/Sticks
];

const SIMPLE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const FULL_KEY_MAP = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12
};

// TODO: [Feature] custom key mappings

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNotes, setActiveNotes] = useState(new Set());

  const notes = useMemo(() => {
    if (currentInstrument === 'drums') {
      return DRUMS;
    }
    return SCALES[currentScale] || SCALES.simple;
  }, [currentInstrument, currentScale]);

  const handleStart = useCallback((note) => {
    AudioEngine.startNote(note);
  }, []);

  const handleStop = useCallback((note) => {
    AudioEngine.stopNote(note);
  }, []);

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

      const key = e.key.toLowerCase();
      let index = -1;

      if (currentInstrument === 'drums' || currentScale === 'simple') {
        index = SIMPLE_KEYS.indexOf(key);
      } else if (currentScale === 'full') {
        index = FULL_KEY_MAP[key] !== undefined ? FULL_KEY_MAP[key] : -1;
      }

      if (index >= 0 && index < notes.length) {
        const note = notes[index].note;
        setActiveNotes(prev => new Set(prev).add(note));
        handleStart(note);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      let index = -1;

      if (currentInstrument === 'drums' || currentScale === 'simple') {
        index = SIMPLE_KEYS.indexOf(key);
      } else if (currentScale === 'full') {
        index = FULL_KEY_MAP[key] !== undefined ? FULL_KEY_MAP[key] : -1;
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
  }, [notes, currentInstrument, currentScale, handleStart, handleStop]);

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
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
