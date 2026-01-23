import * as Tone from 'tone';

const INSTRUMENT_CONFIG = {
    piano: {
        sampler: {
            urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/"
        },
        createSynth: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination()
    },
    guitar: {
        sampler: {
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/acoustic_guitar_nylon/"
        },
        createSynth: () => {
            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 1 }
            });
            const filter = new Tone.Filter(2000, "lowpass").toDestination();
            synth.connect(filter);
            synth.volume.value = -5;
            return synth;
        }
    },
    clarinet: {
        sampler: {
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/clarinet/"
        },
        createSynth: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 }
        }).toDestination()
    },
    doubleBass: {
        sampler: {
            urls: { "C2": "C2.wav", "E2": "E2.wav", "A2": "A2.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/contrabass/"
        },
        createSynth: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 1 }
        }).toDestination()
    },
    oboe: {
        sampler: {
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/bassoon/"
        },
        createSynth: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.5 }
        }).toDestination()
    },
    electricGuitar: {
        sampler: {
            urls: { "C3": "C3.wav", "E3": "E3.wav", "A3": "A3.wav", "C4": "C4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-electric/"
        },
        createSynth: () => {
             const synth = new Tone.PolySynth(Tone.Synth, {
                 oscillator: { type: "sawtooth" },
                 envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 }
            });
            const dist = new Tone.Distortion(0.4).toDestination();
            synth.connect(dist);
            return synth;
        }
    }
};

class AudioEngine {
    constructor() {
        this.isLoading = false;
        this.listeners = [];
        this.noteListeners = [];

        this.samplers = {};
        this.synths = {};
        this.drumSynths = {
            kick: null,
            snare: null,
            hihat: null,
            crash: null,
            tom: null
        };

        this.currentInstrument = 'piano'; // 'piano' | 'guitar' | 'clarinet' | 'doubleBass' | 'drums' | 'oboe' | 'electricGuitar'
        this.soundType = 'sampled'; // 'sampled' | 'synthesized'
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        await Tone.start();
        console.log("Audio Engine Started");

        // Initialize Synths from Config
        Object.keys(INSTRUMENT_CONFIG).forEach(key => {
            this.synths[key] = INSTRUMENT_CONFIG[key].createSynth();
        });

        // Initialize Drum Synths
        this._initDrumSynths();

        // Lazy load the default instrument
        this._loadSampler('piano');

        this.initialized = true;
    }

    _initDrumSynths() {
        this.drumSynths.kick = new Tone.MembraneSynth().toDestination();
        this.drumSynths.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
        }).toDestination();
        this.drumSynths.hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
        this.drumSynths.crash = new Tone.MetalSynth({
             envelope: { attack: 0.001, decay: 1, release: 0.01 },
             harmonicity: 5.1,
             modulationIndex: 64,
             resonance: 3000,
             octaves: 1.5
        }).toDestination();
        this.drumSynths.tom = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" }
        }).toDestination();
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
        const now = Tone.now();
        const delay = time ? Math.max(0, (time - now) * 1000) : 0;

        if (delay === 0) {
            this.noteListeners.forEach(cb => cb(note));
        } else {
            setTimeout(() => {
                this.noteListeners.forEach(cb => cb(note));
            }, delay);
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

        this._loadSampler(type);
    }

    _loadSampler(instrumentId) {
        if (this.samplers[instrumentId]) {
            if (!this.samplers[instrumentId].loaded) {
                this._setLoading(true);
            } else {
                this._setLoading(false);
            }
            return;
        }

        const config = INSTRUMENT_CONFIG[instrumentId];
        if (!config || !config.sampler) {
            this._setLoading(false);
            return;
        }

        this._setLoading(true);
        this.samplers[instrumentId] = new Tone.Sampler({
            ...config.sampler,
            onload: () => {
                if (this.currentInstrument === instrumentId && this.soundType === 'sampled') {
                    this._setLoading(false);
                }
            },
            onerror: (err) => {
                console.warn(`Failed to load samples for ${instrumentId}`, err);
                if (this.currentInstrument === instrumentId && this.soundType === 'sampled') {
                    this._setLoading(false);
                }
            }
        }).toDestination();
    }

    playMelody(melody) {
        if (!this.initialized) return;

        const now = Tone.now();
        let cumulativeTime = 0;

        melody.forEach(item => {
             const duration = item.duration || "8n";
             const note = item.note;

             this.playNote(note, duration, now + cumulativeTime);

             cumulativeTime += Tone.Time(duration).toSeconds();
        });
    }

    playNote(note, duration = "8n", time = undefined) {
        if (!this.initialized) return;

        this._emitNoteEvent(note, time);

        if (this.currentInstrument === 'drums') {
            this._playDrum(note, time);
            return;
        }

        if (this.soundType === 'sampled') {
            this._playSampled(note, duration, time);
        } else {
            this._playSynthesized(note, duration, time);
        }
    }

    _playDrum(note, time) {
        // note can be "Kick", "Snare" etc. or mapped note "C2", "D2"
        const drum = note.toLowerCase();
        let type = drum;
        if (note === 'C2') type = 'kick';
        if (note === 'D2') type = 'snare';
        if (note === 'E2') type = 'hihat';
        if (note === 'F2') type = 'crash';
        if (note === 'G2') type = 'tom';

        const synths = this.drumSynths;

        switch (type) {
            case 'kick': synths.kick.triggerAttackRelease("C2", "8n", time); break;
            case 'snare': synths.snare.triggerAttackRelease("8n", time); break;
            case 'hihat': synths.hihat.triggerAttackRelease("32n", time); break;
            case 'crash': synths.crash.triggerAttackRelease("8n", time); break;
            case 'tom': synths.tom.triggerAttackRelease("G2", "8n", time); break;
            default:
                synths.kick.triggerAttackRelease("C2", "8n", time);
        }
    }

    _playSampled(note, duration, time) {
        const sampler = this.samplers[this.currentInstrument];

        if (sampler && sampler.loaded) {
            sampler.triggerAttackRelease(note, duration, time);
        } else {
            this._playSynthesized(note, duration, time);
        }
    }

    _playSynthesized(note, duration, time) {
        const synth = this.synths[this.currentInstrument];
        // Fallback if synth not found (e.g. if we add new instruments without synths later)
        if (synth) {
            synth.triggerAttackRelease(note, duration, time);
        }
    }
}

export default new AudioEngine();
