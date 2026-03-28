import sys

filepath = 'src/components/InstrumentPad.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Update SCALES
scales_search = """const SCALES = {
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
];"""
scales_replace = """const SCALES = {
  simple: [
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'A' },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 'S' },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'D' },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'F' },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'G' },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'H' },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'J' },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'K' }
  ],
  full: [
    { note: 'C4', color: COLORS.C, label: 'C', shortcut: 'A' },
    { note: 'C#4', color: COLORS.black, label: 'C#', shortcut: 'W' },
    { note: 'D4', color: COLORS.D, label: 'D', shortcut: 'S' },
    { note: 'D#4', color: COLORS.black, label: 'D#', shortcut: 'E' },
    { note: 'E4', color: COLORS.E, label: 'E', shortcut: 'D' },
    { note: 'F4', color: COLORS.F, label: 'F', shortcut: 'F' },
    { note: 'F#4', color: COLORS.black, label: 'F#', shortcut: 'T' },
    { note: 'G4', color: COLORS.G, label: 'G', shortcut: 'G' },
    { note: 'G#4', color: COLORS.black, label: 'G#', shortcut: 'Y' },
    { note: 'A4', color: COLORS.A, label: 'A', shortcut: 'H' },
    { note: 'A#4', color: COLORS.black, label: 'A#', shortcut: 'U' },
    { note: 'B4', color: COLORS.B, label: 'B', shortcut: 'J' },
    { note: 'C5', color: COLORS.C, label: 'C', shortcut: 'K' }
  ]
};

const DRUMS = [
  { note: 'C2', color: COLORS.C, label: '🥁', shortcut: 'A' }, // Kick
  { note: 'D2', color: COLORS.D, label: '💥', shortcut: 'S' }, // Snare
  { note: 'E2', color: COLORS.E, label: '🎩', shortcut: 'D' }, // HiHat
  { note: 'F2', color: COLORS.F, label: '✨', shortcut: 'F' }, // Crash
  { note: 'G2', color: COLORS.G, label: '🥢', shortcut: 'G' }  // Tom/Sticks
];

const SIMPLE_KEYS_MAP = {
  'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7, 'l': 8
};
const FULL_KEYS_MAP = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12
};"""
content = content.replace(scales_search, scales_replace)

# Update KeyDown/KeyUp mappings
key_search = """      if (currentInstrument === 'drums' || currentScale === 'simple') {
        const keys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
        index = keys.indexOf(key);
      } else if (currentScale === 'full') {
        const keyMap = {
          'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12
        };
        index = keyMap[key] !== undefined ? keyMap[key] : -1;
      }"""
key_replace = """      if (currentInstrument === 'drums' || currentScale === 'simple') {
        index = SIMPLE_KEYS_MAP[key] !== undefined ? SIMPLE_KEYS_MAP[key] : -1;
      } else if (currentScale === 'full') {
        index = FULL_KEYS_MAP[key] !== undefined ? FULL_KEYS_MAP[key] : -1;
      }"""
content = content.replace(key_search, key_replace)
content = content.replace(key_search, key_replace) # for handleKeyUp as well

# Pass shortcut prop
render_search = """          return (
            <NoteButton
              key={item.note}
              note={item.note}
              color={item.color}
              label={item.label}"""
render_replace = """          return (
            <NoteButton
              key={item.note}
              note={item.note}
              color={item.color}
              label={item.label}
              shortcut={item.shortcut}"""
content = content.replace(render_search, render_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated InstrumentPad.jsx")
