1. **New Implementation**: Add "Metronome" feature as requested in TODO.md.
    - We will add a simple visual and audio metronome with adjustable BPM to `AudioEngine` and a new `Metronome` component, and control it from `Controls.jsx`.
2. **Improvement 1**: Fix Double-Triggering bug in `NoteButton.jsx`.
    - In `NoteButton.jsx`, `forceActive` triggers `startPlaying()` which calls `onStart(note)`. But `InstrumentPad.jsx` also calls `handleStart(note)` when setting the state that turns `forceActive` to true. This causes double triggers when using the keyboard.
    - We will modify `NoteButton.jsx` to separate the visual state (triggered by `forceActive`) from the audio trigger (which should be called directly by the parent for keyboard events).
3. **Improvement 2**: Pre-compute keyboard mappings in `InstrumentPad.jsx`.
    - `handleKeyDown` and `handleKeyUp` in `InstrumentPad.jsx` use `indexOf` on arrays/objects repeatedly. We will pre-compute these into an O(1) lookup object outside the component for better performance, as suggested by the project memory.
4. **New TODOs**: Add 3 new TODO ideas to `TODO.md`.
    - [Feature] Cloud saves: Allow users to save their layered tracks to a cloud account.
    - [Feature] Piano Roll: Add a visual piano roll editor for recorded layers.
    - [Feature] Custom SoundFonts: Allow users to upload or link their own `.sf2` files for custom instruments.

5. **Pre-commit**:
    - Run `pre_commit_instructions` and verify frontend.
6. **Submit**:
    - Push changes.
