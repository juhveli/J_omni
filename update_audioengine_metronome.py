import sys

filepath = 'src/utils/AudioEngine.js'
with open(filepath, 'r') as f:
    content = f.read()

# Add to constructor
constructor_search = """        this.initialized = false;
    }"""
constructor_replace = """        this.initialized = false;

        // Metronome
        this.metronomeSynth = null;
        this.metronomeLoop = null;
        this.onMetronomeTick = null;
    }"""
content = content.replace(constructor_search, constructor_replace)

# Add to initialize
init_search = """        // Lazy load the default instrument
        this._loadPianoSampler();

        this.initialized = true;
    }"""
init_replace = """        // Lazy load the default instrument
        this._loadPianoSampler();

        // Initialize Metronome
        this.metronomeSynth = new Tone.MembraneSynth().toDestination();
        this.metronomeSynth.volume.value = -10;
        this.metronomeLoop = new Tone.Loop((time) => {
            this.metronomeSynth.triggerAttackRelease("C1", "8n", time);
            if (this.onMetronomeTick) {
                Tone.Draw.schedule(() => {
                    this.onMetronomeTick();
                }, time);
            }
        }, "4n");
        Tone.Transport.bpm.value = 120;

        this.initialized = true;
    }"""
content = content.replace(init_search, init_replace)

# Add methods
methods_search = """    subscribeToNotes(callback) {
        this.noteListeners.push(callback);
        return () => {
            this.noteListeners = this.noteListeners.filter(cb => cb !== callback);
        };
    }"""
methods_replace = """    subscribeToNotes(callback) {
        this.noteListeners.push(callback);
        return () => {
            this.noteListeners = this.noteListeners.filter(cb => cb !== callback);
        };
    }

    // --- METRONOME ---
    subscribeToMetronome(callback) {
        this.onMetronomeTick = callback;
        return () => {
            this.onMetronomeTick = null;
        };
    }

    setBPM(bpm) {
        if (!this.initialized) return;
        Tone.Transport.bpm.value = bpm;
    }

    toggleMetronome(isPlaying) {
        if (!this.initialized) return;
        if (isPlaying) {
            Tone.Transport.start();
            this.metronomeLoop.start(0);
        } else {
            this.metronomeLoop.stop();
        }
    }"""
content = content.replace(methods_search, methods_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated AudioEngine.js with Metronome")
