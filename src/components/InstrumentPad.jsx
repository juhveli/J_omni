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

  const getShortcut = (index) => {
      if (currentInstrument === 'drums' || currentScale === 'simple') {
          const keys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
          return keys[index] || '';
      } else {
          // Full scale mapping
          // 0:A, 1:W, 2:S, 3:E, 4:D, 5:F, 6:T, 7:G, 8:Y, 9:H, 10:U, 11:J, 12:K
          const map = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K'];
          return map[index] || '';
      }
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
          const keys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
          index = keys.indexOf(key);
      } else if (currentScale === 'full') {
          // Mapping for full scale (chromatic)
          const keyMap = {
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
          };
          index = keyMap[key] !== undefined ? keyMap[key] : -1;
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
      {notes.map((n, i) => (
        <NoteButton
          key={n.note}
          note={n.note}
          color={n.color}
          label={n.label}
          onPlay={handlePlay}
          forceActive={activeNote === n.note}
          shortcut={getShortcut(i)}
        />
      ))}
    </div>
  );
};

export default InstrumentPad;
