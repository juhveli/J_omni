import * as Tone from 'tone';

class AudioEngine {
    constructor() {
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

    setSoundType(type) {
        this.soundType = type;
        console.log(`Sound Type set to: ${type}`);
    }

    setInstrument(type) {
        this.currentInstrument = type;
        switch (type) {
            case 'piano': this._loadPianoSampler(); break;
            case 'guitar': this._loadGuitarSampler(); break;
            case 'clarinet': this._loadClarinetSampler(); break;
            case 'doubleBass': this._loadDoubleBassSampler(); break;
            case 'oboe': this._loadOboeSampler(); break;
            case 'electricGuitar': this._loadElectricGuitarSampler(); break;
            case 'drums': break; // No sampler for drums yet, strictly synth
        }
    }

    // --- Sampler Loaders ---

    _loadPianoSampler() {
        if (this.instruments.pianoSampler) return;
        this.instruments.pianoSampler = new Tone.Sampler({
            urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
        }).toDestination();
    }

    _loadGuitarSampler() {
        if (this.instruments.guitarSampler) return;
        this.instruments.guitarSampler = new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/acoustic_guitar_nylon/",
        }).toDestination();
    }

    _loadClarinetSampler() {
        if (this.instruments.clarinetSampler) return;
        // Approximation of available notes
        this.instruments.clarinetSampler = new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav", "A4": "A4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/clarinet/",
        }).toDestination();
    }

    _loadDoubleBassSampler() {
        if (this.instruments.doubleBassSampler) return;
        this.instruments.doubleBassSampler = new Tone.Sampler({
            urls: { "C2": "C2.wav", "E2": "E2.wav", "A2": "A2.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/contrabass/",
        }).toDestination();
    }

    _loadOboeSampler() {
        if (this.instruments.oboeSampler) return;
        // Using bassoon as fallback or just relying on Synth if it fails to load specific Oboe samples
        // (nbrosowsky has bassoon)
        this.instruments.oboeSampler = new Tone.Sampler({
            urls: { "C4": "C4.wav", "E4": "E4.wav", "G4": "G4.wav" },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/bassoon/",
        }).toDestination();
    }

    _loadElectricGuitarSampler() {
        if (this.instruments.electricGuitarSampler) return;
        this.instruments.electricGuitarSampler = new Tone.Sampler({
             urls: { "C3": "C3.wav", "E3": "E3.wav", "A3": "A3.wav", "C4": "C4.wav" },
             baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-electric/",
        }).toDestination();
    }


    playNote(note) {
        if (!this.initialized) return;

        // Drums handling
        if (this.currentInstrument === 'drums') {
            this._playDrum(note);
            return;
        }

        // Melodic Instruments
        if (this.soundType === 'sampled') {
            this._playSampled(note);
        } else {
            this._playSynthesized(note);
        }
    }

    _playDrum(note) {
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
            case 'kick': synths.kick.triggerAttackRelease("C2", "8n"); break;
            case 'snare': synths.snare.triggerAttackRelease("8n"); break;
            case 'hihat': synths.hihat.triggerAttackRelease("32n"); break;
            case 'crash': synths.crash.triggerAttackRelease("8n"); break;
            case 'tom': synths.tom.triggerAttackRelease("G2", "8n"); break;
            default:
                // Fallback for random notes in drum mode
                synths.kick.triggerAttackRelease("C2", "8n");
        }
    }

    _playSampled(note) {
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
            sampler.triggerAttackRelease(note, "8n");
        } else {
            // Fallback to synth if sampler not loaded/ready
            this._playSynthesized(note);
        }
    }

    _playSynthesized(note) {
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
            synth.triggerAttackRelease(note, "8n");
        }
    }
}

export default new AudioEngine();
