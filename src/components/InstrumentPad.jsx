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
const FULL_KEYS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'];

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNote, setActiveNote] = useState(null);

  let notes;
  let keys;

  if (currentInstrument === 'drums') {
      notes = DRUMS;
      keys = SIMPLE_KEYS;
  } else if (currentScale === 'full') {
      notes = SCALES.full;
      keys = FULL_KEYS;
  } else {
      notes = SCALES.simple;
      keys = SIMPLE_KEYS;
  }

  const handlePlay = (note) => {
    AudioEngine.playNote(note);
  };

  useEffect(() => {
    // Subscribe to AudioEngine note events (visual feedback for Magic Melody)
    const unsubscribe = AudioEngine.subscribeToNotes((note) => {
        setActiveNote(note);
        // Reset after short delay to simulate press release
        setTimeout(() => {
            setActiveNote(prev => prev === note ? null : prev);
        }, 300);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const index = keys.indexOf(key);

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
  }, [notes, keys]);

  return (
    <div className={`instrument-pad ${currentInstrument === 'drums' ? 'simple' : currentScale}`}>
      {notes.map((n, i) => (
        <NoteButton
          key={n.note}
          note={n.note}
          color={n.color}
          label={n.label}
          shortcut={keys[i] ? keys[i].toUpperCase() : ''}
          isSharp={n.note.includes('#')}
          onPlay={handlePlay}
          forceActive={activeNote === n.note}
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
