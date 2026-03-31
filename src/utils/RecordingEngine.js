import * as Tone from 'tone';
import lamejs from 'lamejs';
import LayerStorage from './LayerStorage';

/**
 * RecordingEngine - Multi-layer recording system
 * 
 * Supports:
 * - Recording instrument output from Tone.js
 * - Recording microphone input
 * - Managing multiple layers
 * - Mixing and exporting
 */
class RecordingEngine {
    constructor() {
        this.layers = [];
        this.isRecording = false;
        this.recordingSource = null; // 'instruments' | 'microphone'
        this.initialized = false; // Prevent double initialization

        // Tone.js recorder for instruments
        this.toneRecorder = null;

        // MediaRecorder for microphone
        this.mediaRecorder = null;
        this.micStream = null;
        this.micChunks = [];

        // Recording start time for syncing
        this.recordingStartTime = null;

        // Callbacks
        this.onLayerAdded = null;
        this.onRecordingStateChange = null;
    }

    /**
     * Initialize the recording engine
     */
    async initialize() {
        // Prevent double initialization (React strict mode)
        if (this.initialized) {
            console.log('RecordingEngine already initialized');
            return;
        }

        // Create Tone.js Recorder connected to master output
        this.toneRecorder = new Tone.Recorder();
        // Connect the global destination to the recorder so we can capture all sound
        Tone.getDestination().connect(this.toneRecorder);

        // Initialize storage and load persisted layers
        await LayerStorage.init();
        await this.loadPersistedLayers();

        this.initialized = true;
        console.log('RecordingEngine initialized');
    }

    /**
     * Load layers from IndexedDB persistence
     */
    async loadPersistedLayers() {
        try {
            const storedLayers = await LayerStorage.loadAllLayers();

            for (const storedLayer of storedLayers) {
                if (storedLayer.blob) {
                    const audioUrl = URL.createObjectURL(storedLayer.blob);

                    // Load into Tone.js buffer for playback
                    let buffer = null;
                    try {
                        buffer = await Tone.ToneAudioBuffer.fromUrl(audioUrl);
                    } catch (err) {
                        console.warn('Could not load persisted audio buffer:', err);
                    }

                    const layer = {
                        id: storedLayer.id,
                        name: storedLayer.name,
                        source: storedLayer.source,
                        blob: storedLayer.blob,
                        url: audioUrl,
                        buffer,
                        duration: storedLayer.duration,
                        muted: storedLayer.muted,
                        volume: storedLayer.volume,
                        player: buffer ? new Tone.Player(buffer).toDestination() : null,
                        createdAt: storedLayer.createdAt
                    };

                    // Apply stored volume
                    if (layer.player) {
                        layer.player.volume.value = Tone.gainToDb(layer.volume);
                        layer.player.mute = layer.muted;
                    }

                    this.layers.push(layer);
                    this.onLayerAdded?.(layer);
                }
            }

            console.log(`Loaded ${storedLayers.length} persisted layers`);
        } catch (err) {
            console.error('Failed to load persisted layers:', err);
        }
    }

    /**
     * Request microphone access
     */
    async requestMicrophoneAccess() {
        if (this.micStream) return true;

        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            console.log('Microphone access granted');
            return true;
        } catch (err) {
            console.error('Microphone access denied:', err);
            return false;
        }
    }

    /**
     * Start recording from specified source
     * @param {'instruments' | 'microphone'} source
     */
    async startRecording(source = 'instruments') {
        if (this.isRecording) {
            console.warn('Already recording');
            return false;
        }

        this.recordingSource = source;
        this.recordingStartTime = Date.now();

        if (source === 'instruments') {
            this.toneRecorder.start();
        } else if (source === 'microphone') {
            const hasAccess = await this.requestMicrophoneAccess();
            if (!hasAccess) return false;

            this.micChunks = [];
            this.mediaRecorder = new MediaRecorder(this.micStream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.micChunks.push(e.data);
                }
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
        }

        this.isRecording = true;
        this.onRecordingStateChange?.(true, source);
        console.log(`Recording started: ${source}`);
        return true;
    }

    /**
     * Stop recording and save to layer
     * @returns {Promise<Object>} The created layer
     */
    async stopRecording() {
        if (!this.isRecording) {
            console.warn('Not recording');
            return null;
        }

        const duration = Date.now() - this.recordingStartTime;
        let audioBlob = null;

        if (this.recordingSource === 'instruments') {
            audioBlob = await this.toneRecorder.stop();
        } else if (this.recordingSource === 'microphone') {
            await new Promise((resolve) => {
                this.mediaRecorder.onstop = resolve;
                this.mediaRecorder.stop();
            });
            audioBlob = new Blob(this.micChunks, { type: 'audio/webm' });
        }

        this.isRecording = false;
        this.onRecordingStateChange?.(false, null);

        if (audioBlob && audioBlob.size > 0) {
            const layer = await this.addLayer(audioBlob, this.recordingSource, duration);
            console.log(`Recording stopped. Layer created: ${layer.id}`);
            return layer;
        }

        console.log('Recording stopped. No audio data.');
        return null;
    }

    /**
     * Add a layer from audio blob
     * @param {Blob} audioBlob 
     * @param {string} source 
     * @param {number} duration 
     */
    async addLayer(audioBlob, source = 'imported', duration = 0) {
        const audioUrl = URL.createObjectURL(audioBlob);

        // Load into Tone.js buffer for playback
        let buffer = null;
        try {
            buffer = await Tone.ToneAudioBuffer.fromUrl(audioUrl);
        } catch (err) {
            console.warn('Could not load audio buffer:', err);
        }

        const layer = {
            id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${source === 'instruments' ? '🎹' : source === 'microphone' ? '🎤' : '📁'} Layer ${this.layers.length + 1}`,
            source,
            blob: audioBlob,
            url: audioUrl,
            buffer,
            duration: duration || (buffer?.duration * 1000) || 0,
            muted: false,
            volume: 1.0,
            player: buffer ? new Tone.Player(buffer).toDestination() : null,
            createdAt: Date.now()
        };

        this.layers.push(layer);
        this.onLayerAdded?.(layer);

        // Persist to IndexedDB
        try {
            await LayerStorage.saveLayer(layer);
        } catch (err) {
            console.warn('Failed to persist layer:', err);
        }

        return layer;
    }

    /**
     * Remove a layer
     * @param {string} layerId 
     */
    async removeLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index !== -1) {
            const layer = this.layers[index];
            layer.player?.dispose();
            URL.revokeObjectURL(layer.url);
            this.layers.splice(index, 1);

            // Remove from persistence
            try {
                await LayerStorage.deleteLayer(layerId);
            } catch (err) {
                console.warn('Failed to delete layer from storage:', err);
            }

            return true;
        }
        return false;
    }

    /**
     * Toggle layer mute
     * @param {string} layerId 
     */
    toggleLayerMute(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.muted = !layer.muted;
            if (layer.player) {
                layer.player.mute = layer.muted;
            }

            // Update persistence
            LayerStorage.updateLayer(layerId, { muted: layer.muted }).catch(console.warn);

            return layer.muted;
        }
        return null;
    }

    /**
     * Set layer volume
     * @param {string} layerId 
     * @param {number} volume - 0 to 1.5 (150%)
     */
    setLayerVolume(layerId, volume) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.volume = Math.max(0, Math.min(1.5, volume));
            if (layer.player) {
                layer.player.volume.value = Tone.gainToDb(layer.volume);
            }

            // Update persistence
            LayerStorage.updateLayer(layerId, { volume: layer.volume }).catch(console.warn);

            return layer.volume;
        }
        return null;
    }

    /**
     * Play a specific layer
     * @param {string} layerId 
     */
    playLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer?.player && !layer.muted) {
            layer.player.start();
        }
    }

    /**
     * Stop a specific layer
     * @param {string} layerId 
     */
    stopLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer?.player) {
            layer.player.stop();
        }
    }

    /**
     * Play all layers together
     */
    playAllLayers() {
        const now = Tone.now();
        this.layers.forEach(layer => {
            if (layer.player && !layer.muted) {
                layer.player.start(now);
            }
        });
    }

    /**
     * Stop all layers
     */
    stopAllLayers() {
        this.layers.forEach(layer => {
            if (layer.player) {
                layer.player.stop();
            }
        });
    }

    /**
     * Mix all layers into single audio file using Web Audio API
     * @returns {Promise<AudioBuffer>} Mixed audio buffer
     */
    async mixdown() {
        if (this.layers.length === 0) return null;

        const activeLayers = this.layers.filter(l => l.buffer && !l.muted);
        if (activeLayers.length === 0) return null;

        // Find the longest layer duration
        const sampleRate = 44100;
        const maxDuration = Math.max(...activeLayers.map(l => l.buffer.duration || 0));
        if (maxDuration === 0) return null;

        const numSamples = Math.ceil(maxDuration * sampleRate);
        const numChannels = 2;

        // Create offline audio context for mixing
        const offlineCtx = new OfflineAudioContext(numChannels, numSamples, sampleRate);

        // Create and connect sources for each layer
        const sourcePromises = activeLayers.map(async (layer) => {
            // Convert ToneAudioBuffer to native AudioBuffer
            const audioBuffer = layer.buffer.get();
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;

            // Apply volume via gain node
            const gainNode = offlineCtx.createGain();
            gainNode.gain.value = layer.volume;

            source.connect(gainNode);
            gainNode.connect(offlineCtx.destination);
            source.start(0);
        });

        await Promise.all(sourcePromises);

        // Render the mix
        const renderedBuffer = await offlineCtx.startRendering();
        return renderedBuffer;
    }

    /**
     * Convert AudioBuffer to MP3 using lamejs
     * @private
     */
    _bufferToMp3(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const kbps = 128;

        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
        const mp3Data = [];

        const left = buffer.getChannelData(0);
        const right = numChannels > 1 ? buffer.getChannelData(1) : left;

        const sampleBlockSize = 1152;
        const numSamples = left.length;

        // Convert float samples to int16
        const leftInt = new Int16Array(numSamples);
        const rightInt = new Int16Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            leftInt[i] = Math.max(-32768, Math.min(32767, Math.floor(left[i] * 32767)));
            rightInt[i] = Math.max(-32768, Math.min(32767, Math.floor(right[i] * 32767)));
        }

        // Encode in blocks
        for (let i = 0; i < numSamples; i += sampleBlockSize) {
            const leftChunk = leftInt.subarray(i, i + sampleBlockSize);
            const rightChunk = rightInt.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        // Flush remaining
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    /**
     * Export mixed audio as downloadable file
     * @param {string} filename 
     * @param {'mp3' | 'wav'} format - Output format (default: mp3)
     */
    async exportMixdown(filename = 'unicorn-music-mix', format = 'mp3') {
        try {
            const buffer = await this.mixdown();
            if (!buffer) {
                console.warn('No audio to export');
                return null;
            }

            let blob;
            let extension;

            if (format === 'mp3') {
                blob = this._bufferToMp3(buffer);
                extension = 'mp3';
            } else {
                const wav = this._bufferToWav(buffer);
                blob = new Blob([wav], { type: 'audio/wav' });
                extension = 'wav';
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Exported ${extension.toUpperCase()}: ${filename}.${extension}`);
            return blob;
        } catch (error) {
            console.error('Export failed:', error);
            return null;
        }
    }

    /**
     * Get recording state
     */
    getState() {
        return {
            isRecording: this.isRecording,
            recordingSource: this.recordingSource,
            layerCount: this.layers.length,
            layers: this.layers.map(l => ({
                id: l.id,
                name: l.name,
                source: l.source,
                duration: l.duration,
                muted: l.muted,
                volume: l.volume
            }))
        };
    }

    /**
     * Convert AudioBuffer to WAV format
     * @private
     */
    _bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const samples = buffer.length;
        const dataSize = samples * blockAlign;
        const bufferSize = 44 + dataSize;

        const arrayBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(arrayBuffer);

        // WAV header
        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, bufferSize - 8, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Write audio data
        const channels = [];
        for (let i = 0; i < numChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        let offset = 44;
        for (let i = 0; i < samples; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, channels[ch][i]));
                const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, int16, true);
                offset += 2;
            }
        }

        return arrayBuffer;
    }

    /**
     * Write string to DataView
     * @private
     */
    _writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

export default new RecordingEngine();
