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
