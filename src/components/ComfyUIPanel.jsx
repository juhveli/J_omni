import React, { useState, useEffect, useRef } from 'react';
import ComfyUIClient from '../utils/ComfyUIClient';
import RecordingEngine from '../utils/RecordingEngine';

const ComfyUIPanel = ({ isAudioStarted }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [serverUrl, setServerUrl] = useState('http://localhost:8188');
    const [selectedPreset, setSelectedPreset] = useState('ambient');
    const [customTags, setCustomTags] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [duration, setDuration] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ percent: 0, stage: '' });
    const [generatedAudio, setGeneratedAudio] = useState(null);
    const [autoAdd, setAutoAdd] = useState(true);
    const audioRef = useRef(null);

    const presets = ComfyUIClient.getStylePresets();

    useEffect(() => {
        ComfyUIClient.onStatusChange = (status) => {
            setIsConnected(status === 'connected' || status === 'complete');
            if (status === 'generating') setIsGenerating(true);
            if (status === 'complete') setIsGenerating(false);
        };

        ComfyUIClient.onProgress = (prog) => {
            setProgress(prog);
        };

        ComfyUIClient.onComplete = (audioBlob) => {
            const url = URL.createObjectURL(audioBlob);
            setGeneratedAudio({ blob: audioBlob, url });
        };
    }, []);

    const handleConnect = async () => {
        ComfyUIClient.setServerUrl(serverUrl);
        await ComfyUIClient.checkConnection();
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress({ percent: 0, stage: 'Starting...' });

        const preset = presets.find(p => p.id === selectedPreset);
        const tags = customTags || preset?.tags || 'ambient, dreamy';

        try {
            const audioBlob = await ComfyUIClient.generateAudio({
                styleTags: tags,
                lyrics: lyrics,
                duration: duration
            });

            if (autoAdd) {
                await RecordingEngine.addLayer(
                    audioBlob,
                    'comfyui',
                    duration * 1000
                );
            } else {
                const url = URL.createObjectURL(audioBlob);
                setGeneratedAudio({ blob: audioBlob, url });
            }
        } catch (err) {
            console.error('Generation failed:', err);
        }

        setIsGenerating(false);
    };

    const handleAddToLayers = async () => {
        if (!generatedAudio) return;

        await RecordingEngine.addLayer(
            generatedAudio.blob,
            'comfyui',
            duration * 1000
        );

        // Clear generated audio after adding
        URL.revokeObjectURL(generatedAudio.url);
        setGeneratedAudio(null);
    };

    if (!isAudioStarted) return null;

    return (
        <div className="comfyui-panel">
            <div className="comfy-header">
                <h3>🤖 AI Audio Generation</h3>
                <span className="comfy-badge placeholder">PLACEHOLDER</span>
            </div>

            <div className="comfy-connection">
                <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="ComfyUI Server URL"
                    className="comfy-input"
                />
                <button
                    className={`comfy-connect-btn ${isConnected ? 'connected' : ''}`}
                    onClick={handleConnect}
                >
                    {isConnected ? '✓ Connected' : 'Connect'}
                </button>
            </div>

            <div className="comfy-form">
                <div className="form-group">
                    <label>Style Preset</label>
                    <div className="preset-grid">
                        {presets.map(preset => (
                            <button
                                key={preset.id}
                                className={`preset-btn ${selectedPreset === preset.id ? 'active' : ''}`}
                                onClick={() => setSelectedPreset(preset.id)}
                            >
                                {preset.id === 'unicorn' ? '🦄' :
                                    preset.id === 'ambient' ? '🌊' :
                                        preset.id === 'electronic' ? '🎛️' :
                                            preset.id === 'orchestral' ? '🎻' :
                                                preset.id === 'lofi' ? '📻' :
                                                    preset.id === 'rock' ? '🎸' :
                                                        preset.id === 'jazz' ? '🎷' : '🎵'} {preset.id}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Custom Tags (optional)</label>
                    <input
                        type="text"
                        value={customTags}
                        onChange={(e) => setCustomTags(e.target.value)}
                        placeholder="e.g., dreamy, reverb, synth pad"
                        className="comfy-input"
                    />
                </div>

                <div className="form-group">
                    <label>Lyrics (optional)</label>
                    <textarea
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        placeholder="Add lyrics for vocal generation..."
                        className="comfy-textarea"
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label>Duration: {duration}s</label>
                    <input
                        type="range"
                        min={5}
                        max={60}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="comfy-slider"
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={autoAdd}
                            onChange={(e) => setAutoAdd(e.target.checked)}
                        />
                        Auto-add to Layers
                    </label>
                </div>

                <button
                    className="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? `Generating... ${progress.percent}%` : '✨ Generate Audio'}
                </button>

                {isGenerating && (
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress.percent}%` }}
                        />
                        <span className="progress-stage">{progress.stage}</span>
                    </div>
                )}
            </div>

            {generatedAudio && (
                <div className="generated-result">
                    <h4>🎵 Generated Audio</h4>
                    <audio
                        ref={audioRef}
                        src={generatedAudio.url}
                        controls
                        className="audio-player"
                    />
                    <button
                        className="add-layer-btn"
                        onClick={handleAddToLayers}
                    >
                        ➕ Add to Layers
                    </button>
                </div>
            )}

            <div className="comfy-info">
                <p>💡 This is a placeholder for ComfyUI ACE-Step integration.</p>
                <p>When connected to a real ComfyUI server, this will generate AI audio using the selected style and parameters.</p>
            </div>
        </div>
    );
};

export default ComfyUIPanel;
