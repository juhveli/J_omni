import * as Tone from 'tone';

class AudioEngine {
    constructor() {
        this.isLoading = false;
        this.listeners = [];
        this.noteListeners = [];

        this.instruments = {
            // Samplers
            pianoSampler: null,
            guitarSampler: null,
            clarinetSampler: null,
            doubleBassSampler: null,
            oboeSampler: null,
            electricGuitarSampler: null,

            // Synths
            synthPiano: null,
            synthGuitar: null,
            synthClarinet: null,
            synthDoubleBass: null,
            synthOboe: null,
            synthElectricGuitar: null,

            // Drums (Synth only for now as primary, samples can be added later)
            drumSynths: {
                kick: null,
                snare: null,
                hihat: null,
                crash: null,
                tom: null
            }
        };
        this.currentInstrument = 'piano'; // 'piano' | 'guitar' | 'clarinet' | 'doubleBass' | 'drums' | 'oboe' | 'electricGuitar'
        this.soundType = 'sampled'; // 'sampled' | 'synthesized'
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        await Tone.start();
        console.log("Audio Engine Started");

        // Create Master Limiter to prevent crackling/clipping
        this.masterLimiter = new Tone.Limiter(-1).toDestination();

        // --- SYNTHESIZERS ---

        // Piano Synth (Triangle wave)
        this.instruments.synthPiano = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(this.masterLimiter);
        this.instruments.synthPiano.volume.value = -6;

        // Acoustic Guitar Synth
        this.instruments.synthGuitar = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1 }
        });
        const guitarFilter = new Tone.Filter(1500, "lowpass").connect(this.masterLimiter);
        this.instruments.synthGuitar.connect(guitarFilter);
        this.instruments.synthGuitar.volume.value = -12;

        // Clarinet Synth (Square-ish)
        this.instruments.synthClarinet = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
        }).connect(this.masterLimiter);
        this.instruments.synthClarinet.volume.value = -10;

        // Double Bass Synth (Sine/Triangle, Low)
        this.instruments.synthDoubleBass = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 1 }
        }).connect(this.masterLimiter);
        this.instruments.synthDoubleBass.volume.value = -3;

        // Oboe Synth (Sawtooth with vibrato)
        this.instruments.synthOboe = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 1 }
        }).connect(this.masterLimiter);
        this.instruments.synthOboe.volume.value = -10;

        // Electric Guitar Synth (Distorted)
        this.instruments.synthElectricGuitar = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 }
        });
        const dist = new Tone.Distortion(0.3).connect(this.masterLimiter);
        this.instruments.synthElectricGuitar.connect(dist);
        this.instruments.synthElectricGuitar.volume.value = -12;
        this.instruments.synthElectricGuitar.volume.value = -10;

        // Drum Synths
        this.instruments.drumSynths.kick = new Tone.MembraneSynth().toDestination();
        this.instruments.drumSynths.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
        }).toDestination();
        this.instruments.drumSynths.hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
        this.instruments.drumSynths.crash = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 64,
            resonance: 3000,
            octaves: 1.5
        }).toDestination();
        this.instruments.drumSynths.tom = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" }
        }).toDestination();


        // --- SAMPLERS ---
        // TODO: Custom SoundFonts - Add support for loading custom sf2/sfz files
        // Lazy load the default instrument
        this._loadPianoSampler();

        this.enableMIDI();

        this.initialized = true;
    }

    enableMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(
                (midiAccess) => {
                    console.log("MIDI Access Granted");
                    const inputs = midiAccess.inputs.values();
                    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
                        input.value.onmidimessage = this._handleMIDIMessage.bind(this);
                    }
                    midiAccess.onstatechange = (e) => {
                        if (e.port.type === "input" && e.port.state === "connected") {
                            e.port.onmidimessage = this._handleMIDIMessage.bind(this);
                        }
                    };
                },
                () => console.warn("MIDI Access Denied")
            );
        } else {
            console.warn("Web MIDI API not supported in this browser.");
        }
    }

    _handleMIDIMessage(message) {
        const [command, note, velocity] = message.data;
        // Command 144 (0x90) is Note On, 128 (0x80) is Note Off.
        // Some devices send Note On with 0 velocity for Note Off.
        if (command === 144 && velocity > 0) {
            const frequency = Tone.Frequency(note, "midi").toNote();
            this.startNote(frequency);
        } else if (command === 128 || (command === 144 && velocity === 0)) {
            const frequency = Tone.Frequency(note, "midi").toNote();
            this.stopNote(frequency);
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.isLoading);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    subscribeToNotes(callback) {
        this.noteListeners.push(callback);
        return () => {
            this.noteListeners = this.noteListeners.filter(cb => cb !== callback);
        };
    }

    _emitNoteEvent(note, time) {
        // Use Tone.Draw to synchronize UI with Web Audio clock
        if (time) {
            Tone.Draw.schedule(() => {
                this.noteListeners.forEach(cb => cb(note));
            }, time);
        } else {
            this.noteListeners.forEach(cb => cb(note));
        }
    }

    _setLoading(loading) {
        if (this.isLoading === loading) return;
        this.isLoading = loading;
        this.listeners.forEach(cb => cb(this.isLoading));
    }

    setSoundType(type) {
        this.soundType = type;
        console.log(`Sound Type set to: ${type}`);
        if (type === 'sampled') {
            this.setInstrument(this.currentInstrument);
        } else {
            this._setLoading(false);
        }
    }

    setInstrument(type) {
        this.currentInstrument = type;

        if (this.soundType !== 'sampled' || type === 'drums') {
            this._setLoading(false);
            return;
        }

        switch (type) {
            case 'piano': this._loadPianoSampler(); break;
            case 'guitar': this._loadGuitarSampler(); break;
            case 'clarinet': this._loadClarinetSampler(); break;
            case 'doubleBass': this._loadDoubleBassSampler(); break;
            case 'oboe': this._loadOboeSampler(); break;
            case 'electricGuitar': this._loadElectricGuitarSampler(); break;
            default: this._setLoading(false);
        }
    }

    // --- Sampler Loaders ---

    _handleSamplerLoad(instrumentKey, samplerFactory) {
        const sampler = this.instruments[instrumentKey];
        if (sampler) {
            // If already exists, check if loaded. Tone.Sampler.loaded is the flag.
            if (!sampler.loaded) {
                this._setLoading(true);
            } else {
                this._setLoading(false);
            }
            return;
        }

        this._setLoading(true);

        const onLoad = () => {
            if (this.currentInstrument === this._getInstrumentNameFromKey(instrumentKey) && this.soundType === 'sampled') {
                this._setLoading(false);
            }
        };

        const onError = (err) => {
            console.error(`Failed to load sampler for ${instrumentKey}`, err);
            // Ensure loading is stopped so UI doesn't hang
            if (this.currentInstrument === this._getInstrumentNameFromKey(instrumentKey)) {
                this._setLoading(false);
            }
        };

        // Create the sampler, injecting onload and onerror
        this.instruments[instrumentKey] = samplerFactory(onLoad, onError);
    }

    _getInstrumentNameFromKey(key) {
        return key.replace('Sampler', '');
    }

    _loadPianoSampler() {
        this._handleSamplerLoad('pianoSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }

    _loadGuitarSampler() {
        this._handleSamplerLoad('guitarSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            release: 1,
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-nylon/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }

    _loadClarinetSampler() {
        this._handleSamplerLoad('clarinetSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            release: 1,
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/clarinet/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }

    _loadDoubleBassSampler() {
        this._handleSamplerLoad('doubleBassSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C2": "C2.wav", "E2": "E2.wav", "A2": "A2.wav" },
            release: 1,
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/contrabass/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }

    _loadOboeSampler() {
        this._handleSamplerLoad('oboeSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav" },
            release: 1,
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/bassoon/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }

    _loadElectricGuitarSampler() {
        this._handleSamplerLoad('electricGuitarSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C3": "C3.wav", "E3": "E3.wav", "A3": "A3.wav", "C4": "C4.wav" },
            release: 1,
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-electric/",
            onload: onload,
            onerror: onerror
        }).connect(this.masterLimiter));
    }


    playMelody(melody) {
        if (!this.initialized) return;

        const now = Tone.now();
        let cumulativeTime = 0;

        melody.forEach(item => {
            const duration = item.duration || "8n";
            const note = item.note;

            // Schedule note
            this.playNote(note, duration, now + cumulativeTime);

            cumulativeTime += Tone.Time(duration).toSeconds();
        });
    }

    /**
     * Start playing a note (sustained)
     */
    startNote(note) {
        if (!this.initialized) return;

        this._emitNoteEvent(note, undefined);

        if (this.currentInstrument === 'drums') {
            this._playDrum(note);
            return;
        }

        if (this.soundType === 'sampled') {
            const sampler = this._getSampler();
            if (sampler && sampler.loaded) {
                sampler.triggerAttack(note);
            } else {
                this._getSynth()?.triggerAttack(note);
            }
        } else {
            this._getSynth()?.triggerAttack(note);
        }
    }

    /**
     * Stop playing a note (release)
     */
    stopNote(note) {
        if (!this.initialized) return;

        if (this.currentInstrument === 'drums') return;

        if (this.soundType === 'sampled') {
            const sampler = this._getSampler();
            if (sampler && sampler.loaded) {
                sampler.triggerRelease(note);
            } else {
                this._getSynth()?.triggerRelease(note);
            }
        } else {
            this._getSynth()?.triggerRelease(note);
        }
    }

    playNote(note, duration = "8n", time = undefined) {
        if (!this.initialized) return;

        this._emitNoteEvent(note, time);

        // Drums handling
        if (this.currentInstrument === 'drums') {
            this._playDrum(note, time);
            return;
        }

        // Melodic Instruments
        if (this.soundType === 'sampled') {
            this._playSampled(note, duration, time);
        } else {
            this._playSynthesized(note, duration, time);
        }
    }

    _playDrum(note, time) {
        // note can be "Kick", "Snare" etc. or mapped note "C2", "D2"
        const drum = note.toLowerCase(); // simplified

        // Map notes to drum types if needed (C2->Kick)
        let type = drum;
        if (note === 'C2') type = 'kick';
        if (note === 'D2') type = 'snare';
        if (note === 'E2') type = 'hihat';
        if (note === 'F2') type = 'crash';
        if (note === 'G2') type = 'tom';
        // Add more if needed

        const synths = this.instruments.drumSynths;
        // For drums we primarily use Synths as they are reliable.
        // Samples could be added here if valid URLs are found.

        switch (type) {
            case 'kick': synths.kick.triggerAttackRelease("C2", "8n", time); break;
            case 'snare': synths.snare.triggerAttackRelease("8n", time); break;
            case 'hihat': synths.hihat.triggerAttackRelease("32n", time); break;
            case 'crash': synths.crash.triggerAttackRelease("8n", time); break;
            case 'tom': synths.tom.triggerAttackRelease("G2", "8n", time); break;
            default:
                // Fallback for random notes in drum mode
                synths.kick.triggerAttackRelease("C2", "8n", time);
        }
    }

    _playSampled(note, duration, time) {
        const sampler = this._getSampler();

        if (sampler && sampler.loaded) {
            sampler.triggerAttackRelease(note, duration, time);
        } else {
            // Fallback to synth if sampler not loaded/ready
            this._playSynthesized(note, duration, time);
        }
    }

    _playSynthesized(note, duration, time) {
        const synth = this._getSynth();
        if (synth) {
            synth.triggerAttackRelease(note, duration, time);
        }
    }

    _getSampler() {
        const inst = this.instruments;
        switch (this.currentInstrument) {
            case 'piano': return inst.pianoSampler;
            case 'guitar': return inst.guitarSampler;
            case 'clarinet': return inst.clarinetSampler;
            case 'doubleBass': return inst.doubleBassSampler;
            case 'oboe': return inst.oboeSampler;
            case 'electricGuitar': return inst.electricGuitarSampler;
            default: return null;
        }
    }

    _getSynth() {
        const inst = this.instruments;
        switch (this.currentInstrument) {
            case 'piano': return inst.synthPiano;
            case 'guitar': return inst.synthGuitar;
            case 'clarinet': return inst.synthClarinet;
            case 'doubleBass': return inst.synthDoubleBass;
            case 'oboe': return inst.synthOboe;
            case 'electricGuitar': return inst.synthElectricGuitar;
            default: return inst.synthPiano;
        }
    }
}

export default new AudioEngine();
