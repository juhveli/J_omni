# Performance Baseline

## Current Behavior
The `AudioEngine.initialize()` method eagerly instantiates two `Tone.Sampler` objects:
1.  **Piano Sampler**: Loads 19 MP3 files from `tonejs.github.io`.
2.  **Guitar Sampler**: Loads 16 WAV files from `raw.githubusercontent.com`.

## Impact
On application start (when the user clicks "Start"), 35 network requests are fired immediately.
-   **Data Usage**: Significant for mobile users. WAV files for the guitar are particularly large.
-   **Memory**: Both samplers allocate buffers even if the user only plays the piano.
-   **Startup Latency**: While `Tone.Sampler` loads asynchronously, the browser's network queue is flooded, potentially delaying other critical assets.

## Optimization Goal
Implement lazy loading so that the Guitar Sampler (and its associated 16 WAV files) is only loaded if/when the user switches to the Guitar instrument.
-   **Expected Savings**: 16 requests and associated bandwidth/memory on startup.

## InstrumentPad Re-renders
### Issue
The `InstrumentPad` component passes a `handlePlay` callback to each `NoteButton`. This callback is currently redefined on every render of `InstrumentPad`. Additionally, `NoteButton` is not memoized. This causes all `NoteButton` components to re-render whenever the `InstrumentPad` re-renders (e.g., when `activeNote` changes during a melody playback).

### Measurement Rationale
Direct measurement using React DevTools or performance profiling scripts is currently impractical because the sandbox environment lacks the necessary dependencies (`node_modules`) to run the development server, and external connectivity issues prevent their installation.

However, this is a textbook case for React optimization:
1.  **Redundant Renders**: Every time `setActiveNote` is called in `InstrumentPad` (which happens frequently during playback), all 8-13 `NoteButton` components re-render because their `onPlay` prop (the `handlePlay` function) has changed reference.
2.  **Impact**: In a component tree where child components perform visual effects (like the `Sparkle` component in `NoteButton`), these redundant renders can lead to CPU spikes and jank, especially on lower-end devices.

### Optimization Strategy
-   Wrap `handlePlay` in `useCallback` to maintain referential integrity.
-   Wrap `NoteButton` in `React.memo` to prevent re-renders when props haven't changed.
