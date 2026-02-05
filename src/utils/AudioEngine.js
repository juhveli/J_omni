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

        // --- SYNTHESIZERS ---

        // Piano Synth (Triangle wave)
        this.instruments.synthPiano = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();

        // Acoustic Guitar Synth
        this.instruments.synthGuitar = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 1 }
        });
        const guitarFilter = new Tone.Filter(2000, "lowpass").toDestination();
        this.instruments.synthGuitar.connect(guitarFilter);
        this.instruments.synthGuitar.volume.value = -5;

        // Clarinet Synth (Square-ish)
        this.instruments.synthClarinet = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 }
        }).toDestination();

        // Double Bass Synth (Sine/Triangle, Low)
        this.instruments.synthDoubleBass = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 1 }
        }).toDestination();

        // Oboe Synth (Sawtooth with vibrato)
        this.instruments.synthOboe = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.5 }
        }).toDestination();

        // Electric Guitar Synth (Distorted)
        this.instruments.synthElectricGuitar = new Tone.PolySynth(Tone.Synth, {
             oscillator: { type: "sawtooth" },
             envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 }
        });
        const dist = new Tone.Distortion(0.4).toDestination();
        this.instruments.synthElectricGuitar.connect(dist);

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
        // Lazy load the default instrument
        this._loadPianoSampler();

        this.initialized = true;
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
        // Calculate delay in milliseconds
        // If time is undefined, delay is 0
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

    setVolume(value) {
        // value is 0-100
        const gain = Math.max(0, Math.min(100, value)) / 100;
        const db = gain <= 0 ? -60 : 20 * Math.log10(gain);
        // We use -60 as effectively mute because -Infinity can sometimes behave oddly with rampTo if not careful,
        // but Tone.Destination handles it. Let's stick to -60 for "mute" to be safe or -Infinity.
        // Actually, let's just use a simple mapping that feels good.
        // Tone.Destination.volume is in decibels.

        if (gain === 0) {
            Tone.Destination.volume.rampTo(-Infinity, 0.1);
        } else {
            Tone.Destination.volume.rampTo(db, 0.1);
        }
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
        }).toDestination());
    }

    _loadGuitarSampler() {
        this._handleSamplerLoad('guitarSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/acoustic_guitar_nylon/",
            onload: onload,
            onerror: onerror
        }).toDestination());
    }

    _loadClarinetSampler() {
        this._handleSamplerLoad('clarinetSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/clarinet/",
            onload: onload,
            onerror: onerror
        }).toDestination());
    }

    _loadDoubleBassSampler() {
        this._handleSamplerLoad('doubleBassSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C2": "C2.wav", "E2": "E2.wav", "A2": "A2.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/contrabass/",
            onload: onload,
            onerror: onerror
        }).toDestination());
    }

    _loadOboeSampler() {
        this._handleSamplerLoad('oboeSampler', (onload, onerror) => new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/bassoon/",
            onload: onload,
            onerror: onerror
        }).toDestination());
    }

    _loadElectricGuitarSampler() {
        this._handleSamplerLoad('electricGuitarSampler', (onload, onerror) => new Tone.Sampler({
             urls: { "C3": "C3.wav", "E3": "E3.wav", "A3": "A3.wav", "C4": "C4.wav" },
             baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-electric/",
             onload: onload,
            onerror: onerror
        }).toDestination());
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
        const inst = this.instruments;
        let sampler = null;

        switch (this.currentInstrument) {
            case 'piano': sampler = inst.pianoSampler; break;
            case 'guitar': sampler = inst.guitarSampler; break;
            case 'clarinet': sampler = inst.clarinetSampler; break;
            case 'doubleBass': sampler = inst.doubleBassSampler; break;
            case 'oboe': sampler = inst.oboeSampler; break;
            case 'electricGuitar': sampler = inst.electricGuitarSampler; break;
        }

        if (sampler && sampler.loaded) {
            sampler.triggerAttackRelease(note, duration, time);
        } else {
            // Fallback to synth if sampler not loaded/ready
            this._playSynthesized(note, duration, time);
        }
    }

    _playSynthesized(note, duration, time) {
        const inst = this.instruments;
        let synth = null;

        switch (this.currentInstrument) {
            case 'piano': synth = inst.synthPiano; break;
            case 'guitar': synth = inst.synthGuitar; break;
            case 'clarinet': synth = inst.synthClarinet; break;
            case 'doubleBass': synth = inst.synthDoubleBass; break;
            case 'oboe': synth = inst.synthOboe; break;
            case 'electricGuitar': synth = inst.synthElectricGuitar; break;
            default: synth = inst.synthPiano;
        }

        if (synth) {
            synth.triggerAttackRelease(note, duration, time);
        }
    }
}

export default new AudioEngine();
