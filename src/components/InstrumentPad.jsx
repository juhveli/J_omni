import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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

// Key Mappings
const KEY_MAPPINGS = {
    simple: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    full: {
        'a': 0, // C
        'w': 1, // C#
        's': 2, // D
        'e': 3, // D#
        'd': 4, // E
        'f': 5, // F
        't': 6, // F#
        'g': 7, // G
        'y': 8, // G#
        'h': 9, // A
        'u': 10, // A#
        'j': 11, // B
        'k': 12  // C5
    }
};

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNote, setActiveNote] = useState(null);
  const timersRef = useRef([]);

  const notes = useMemo(() => {
    if (currentInstrument === 'drums') {
        return DRUMS;
    }
    return SCALES[currentScale] || SCALES.simple;
  }, [currentInstrument, currentScale]);

  const handlePlay = useCallback((note) => {
    AudioEngine.playNote(note);
  }, []);

  useEffect(() => {
    // Subscribe to AudioEngine note events (visual feedback for Magic Melody / Tone.Draw)
    const unsubscribe = AudioEngine.subscribeToNotes((note) => {
        setActiveNote(note);
        // Reset after short delay to simulate press release
        const timer = setTimeout(() => {
            setActiveNote(prev => prev === note ? null : prev);
        }, 300);
        timersRef.current.push(timer);
    });

    return () => {
        unsubscribe();
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };
  }, []);

  const getShortcut = useCallback((index) => {
      if (currentInstrument === 'drums' || currentScale === 'simple') {
          return KEY_MAPPINGS.simple[index];
      } else if (currentScale === 'full') {
           return Object.keys(KEY_MAPPINGS.full).find(key => KEY_MAPPINGS.full[key] === index);
      }
      return null;
  }, [currentInstrument, currentScale]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      let index = -1;

      if (currentInstrument === 'drums' || currentScale === 'simple') {
          index = KEY_MAPPINGS.simple.indexOf(key);
      } else if (currentScale === 'full') {
          index = KEY_MAPPINGS.full[key] !== undefined ? KEY_MAPPINGS.full[key] : -1;
      }

      if (index >= 0 && index < notes.length) {
          const note = notes[index].note;
          setActiveNote(note);
          handlePlay(note);
      }
    };

    const handleKeyUp = () => {
        setActiveNote(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [notes, handlePlay, currentInstrument, currentScale]);

  return (
    <div className={`instrument-pad ${currentInstrument === 'drums' ? 'simple' : currentScale}`}>
      {notes.map((n, index) => (
        <NoteButton
          key={n.note}
          note={n.note}
          color={n.color}
          label={n.label}
          onPlay={handlePlay}
          forceActive={activeNote === n.note}
          shortcut={getShortcut(index)}
          isSharp={n.note.includes('#')}
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
