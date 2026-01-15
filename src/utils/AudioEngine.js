import * as Tone from 'tone';

class AudioEngine {
    constructor() {
        this.instruments = {
            pianoSampler: null,
            guitarSampler: null,
            synthPiano: null,
            synthGuitar: null
        };
        this.currentInstrument = 'piano'; // 'piano' | 'guitar'
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        await Tone.start();
        console.log("Audio Engine Started");

        // --- SYNTHESIZERS (Fallback & Primary) ---

        // Piano Synth (Triangle wave with specific envelope)
        this.instruments.synthPiano = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();

        // Guitar Synth (Synthesized Guitar - using Synth with Pluck envelope)
        this.instruments.synthGuitar = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 1 }
        });

        // Add a filter to make it warmer (like a guitar body)
        const filter = new Tone.Filter(2000, "lowpass").toDestination();
        this.instruments.synthGuitar.connect(filter);
        this.instruments.synthGuitar.volume.value = -5;

        // --- SAMPLERS ---
        // Lazy load the default instrument (piano)
        this._loadPianoSampler();

        this.initialized = true;
    }

    _loadPianoSampler() {
        if (this.instruments.pianoSampler) return;
        console.log("Initializing Piano Sampler...");
        // Piano Sampler (Salamander Grand)
        this.instruments.pianoSampler = new Tone.Sampler({
            urls: {
                "A0": "A0.mp3",
                "C1": "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                "A1": "A1.mp3",
                "C2": "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                "A2": "A2.mp3",
                "C3": "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                "A3": "A3.mp3",
                "C4": "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                "A4": "A4.mp3",
                "C5": "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                "A5": "A5.mp3",
                "C6": "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                "A6": "A6.mp3",
                "C7": "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                "A7": "A7.mp3",
                "C8": "C8.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
        }).toDestination();
    }

    _loadGuitarSampler() {
        if (this.instruments.guitarSampler) return;
        console.log("Initializing Guitar Sampler...");
        // Guitar Sampler (Acoustic Guitar)
        // Note: Using a public repo for guitar samples. If this fails, we fall back to PluckSynth.
        // Source: https://github.com/nbrosowsky/tonejs-instruments
        this.instruments.guitarSampler = new Tone.Sampler({
            urls: {
                "A2": "A2.wav",
                "B2": "B2.wav",
                "C3": "C3.wav",
                "D3": "D3.wav",
                "E3": "E3.wav",
                "F3": "F3.wav",
                "G3": "G3.wav",
                "A3": "A3.wav",
                "B3": "B3.wav",
                "C4": "C4.wav",
                "D4": "D4.wav",
                "E4": "E4.wav",
                "F4": "F4.wav",
                "G4": "G4.wav",
                "A4": "A4.wav",
                "C5": "C5.wav"
            },
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/acoustic_guitar_nylon/",
            onload: () => console.log("Guitar Sampler Loaded"),
        }).toDestination();
    }

    setInstrument(type) {
        // type: 'piano' | 'guitar'
        this.currentInstrument = type;
        if (type === 'piano') {
            this._loadPianoSampler();
        } else if (type === 'guitar') {
            this._loadGuitarSampler();
        }
    }

    playNote(note) {
        if (!this.initialized) return;

        if (this.currentInstrument === 'piano') {
            if (this.instruments.pianoSampler && this.instruments.pianoSampler.loaded) {
                this.instruments.pianoSampler.triggerAttackRelease(note, "8n");
            } else {
                this.instruments.synthPiano.triggerAttackRelease(note, "8n");
            }
        } else if (this.currentInstrument === 'guitar') {
            if (this.instruments.guitarSampler && this.instruments.guitarSampler.loaded) {
                this.instruments.guitarSampler.triggerAttackRelease(note, "8n");
            } else {
                this.instruments.synthGuitar.triggerAttackRelease(note, "8n");
            }
        }
    }
}

export default new AudioEngine();
