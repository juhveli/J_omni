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

export const KEY_MAPPINGS = {
  simple: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  full: {
    0: 'a', 1: 'w', 2: 's', 3: 'e', 4: 'd', 5: 'f', 6: 't', 7: 'g', 8: 'y', 9: 'h', 10: 'u', 11: 'j', 12: 'k'
  }
};

const InstrumentPad = ({ currentScale, currentInstrument }) => {
  const [activeNote, setActiveNote] = useState(null);

  let notes;
  if (currentInstrument === 'drums') {
      notes = DRUMS;
  } else {
      notes = SCALES[currentScale] || SCALES.simple;
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
      let index = -1;

      // Map keys to note indices
      // Simple/Drums: A, S, D, F...
      // Full: Specific mapping to mimic piano

      if (currentInstrument === 'drums' || currentScale === 'simple') {
          index = KEY_MAPPINGS.simple.indexOf(key);
      } else if (currentScale === 'full') {
          // Find index by value in the object
          const entry = Object.entries(KEY_MAPPINGS.full).find(([idx, k]) => k === key);
          if (entry) {
              index = parseInt(entry[0], 10);
          }
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
  }, [notes, currentInstrument, currentScale]);

  return (
    <div className={`instrument-pad ${currentInstrument === 'drums' ? 'simple' : currentScale}`}>
      {notes.map((n, i) => {
        let shortcut = '';
        if (currentInstrument === 'drums' || currentScale === 'simple') {
            shortcut = KEY_MAPPINGS.simple[i];
        } else if (currentScale === 'full') {
            shortcut = KEY_MAPPINGS.full[i];
        }

        return (
          <NoteButton
            key={n.note}
            note={n.note}
            color={n.color}
            label={n.label}
            shortcut={shortcut ? shortcut.toUpperCase() : ''}
            onPlay={handlePlay}
            forceActive={activeNote === n.note}
          />
        );
      })}
    </div>
  );
};

export default InstrumentPad;
