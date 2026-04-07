import React, { useState, useEffect } from 'react';
import RecordingEngine from '../utils/RecordingEngine';

const LayerManager = ({ isAudioStarted }) => {
    const [layers, setLayers] = useState([]);
    const [playingAll, setPlayingAll] = useState(false);
    const [exportFormat, setExportFormat] = useState('mp3');
    const [exporting, setExporting] = useState(false);
    const [soloLayerId, setSoloLayerId] = useState(null);

    useEffect(() => {
        if (isAudioStarted) {
            // Sync layers from RecordingEngine on mount (for persisted layers)
            setLayers(RecordingEngine.layers.map(l => ({
                id: l.id,
                name: l.name,
                source: l.source,
                duration: l.duration,
                muted: l.muted,
                volume: l.volume
            })));

            RecordingEngine.onLayerAdded = () => {
                setLayers(RecordingEngine.layers.map(l => ({
                    id: l.id,
                    name: l.name,
                    source: l.source,
                    duration: l.duration,
                    muted: l.muted,
                    volume: l.volume
                })));
            };
        }
    }, [isAudioStarted]);

    const refreshLayers = () => {
        setLayers(RecordingEngine.layers.map(l => ({
            id: l.id,
            name: l.name,
            source: l.source,
            duration: l.duration,
            muted: l.muted,
            volume: l.volume
        })));
    };

    const handlePlayLayer = (layerId) => {
        RecordingEngine.playLayer(layerId);
    };

    const handleStopLayer = (layerId) => {
        RecordingEngine.stopLayer(layerId);
    };

    const handleToggleMute = (layerId) => {
        RecordingEngine.toggleLayerMute(layerId);
        refreshLayers();
    };

    const handleToggleSolo = (layerId) => {
        if (soloLayerId === layerId) {
            setSoloLayerId(null);
        } else {
            setSoloLayerId(layerId);
        }
    };

    const handleDeleteLayer = (layerId) => {
        RecordingEngine.removeLayer(layerId);
        if (soloLayerId === layerId) setSoloLayerId(null);
        refreshLayers();
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all layers?')) {
            layers.forEach(l => RecordingEngine.removeLayer(l.id));
            setSoloLayerId(null);
            setPlayingAll(false);
            refreshLayers();
        }
    };

    const handleVolumeChange = (layerId, volume) => {
        RecordingEngine.setLayerVolume(layerId, volume);
        refreshLayers();
    };

    const handlePlayAll = () => {
        if (playingAll) {
            if (soloLayerId) {
                RecordingEngine.stopLayer(soloLayerId);
            } else {
                RecordingEngine.stopAllLayers();
            }
            setPlayingAll(false);
        } else {
            if (soloLayerId) {
                RecordingEngine.playLayer(soloLayerId);
            } else {
                RecordingEngine.playAllLayers();
            }
            setPlayingAll(true);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await RecordingEngine.exportMixdown('unicorn-music-mix', exportFormat);
        } finally {
            setExporting(false);
        }
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isAudioStarted) return null;

    // TODO: Implement individual layer waveform visualizers
    return (
        <div className="layer-manager">
            <div className="layer-header">
                <h3>🎚️ Layers ({layers.length})</h3>
                <div className="layer-actions">
                    <button
                        className="layer-action-btn clear-all"
                        onClick={handleClearAll}
                        disabled={layers.length === 0}
                    >
                        🗑️ Clear All
                    </button>
                    <button
                        className="layer-action-btn play-all"
                        onClick={handlePlayAll}
                        disabled={layers.length === 0}
                    >
                        {playingAll ? '⏹️ Stop All' : '▶️ Play All'}
                    </button>
                    <div className="export-controls">
                        <select
                            className="export-format-select"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                        >
                            <option value="mp3">MP3</option>
                            <option value="wav">WAV</option>
                        </select>
                        <button
                            className="layer-action-btn export"
                            onClick={handleExport}
                            disabled={layers.length === 0 || exporting}
                        >
                            {exporting ? '⏳ Exporting...' : '💾 Export'}
                        </button>
                    </div>
                </div>
            </div>

            {layers.length === 0 ? (
                <div className="no-layers">
                    <p>No layers yet. Record something to get started!</p>
                </div>
            ) : (
                <div className="layers-list">
                    {layers.map((layer, index) => {
                        const isSolo = soloLayerId === layer.id;
                        const isMutedBySolo = soloLayerId !== null && !isSolo;
                        const effectiveMuted = layer.muted || isMutedBySolo;

                        return (
                            <div key={layer.id} className={`layer-item ${effectiveMuted ? 'muted' : ''} ${isSolo ? 'soloed' : ''}`}>
                                <div className="layer-info">
                                    <span className="layer-number">{index + 1}</span>
                                    <span className="layer-name">{layer.name}</span>
                                    <span className="layer-duration">{formatDuration(layer.duration)}</span>
                                </div>

                                <div className="layer-volume-section">
                                    <div className="volume-bar-container">
                                        <div
                                            className="volume-bar"
                                            style={{ width: `${Math.min(100, layer.volume * 100)}%` }}
                                        />
                                        {layer.volume > 1 && (
                                            <div
                                                className="volume-bar-boost"
                                                style={{ width: `${(layer.volume - 1) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                    <input
                                        type="range"
                                        className="volume-slider"
                                        min="0"
                                        max="1.5"
                                        step="0.01"
                                        value={layer.volume}
                                        onChange={(e) => handleVolumeChange(layer.id, parseFloat(e.target.value))}
                                        title={`Volume: ${Math.round(layer.volume * 100)}%`}
                                    />
                                    <span className="volume-label">{Math.round(layer.volume * 100)}%</span>
                                </div>

                                <div className="layer-controls">
                                    <button
                                        className="layer-btn play"
                                        onClick={() => handlePlayLayer(layer.id)}
                                        title="Play"
                                    >
                                        ▶️
                                    </button>
                                    <button
                                        className="layer-btn stop"
                                        onClick={() => handleStopLayer(layer.id)}
                                        title="Stop"
                                    >
                                        ⏹️
                                    </button>
                                    <button
                                        className={`layer-btn mute ${effectiveMuted ? 'active' : ''}`}
                                        onClick={() => handleToggleMute(layer.id)}
                                        title={layer.muted ? 'Unmute' : 'Mute'}
                                    >
                                        {layer.muted ? '🔇' : '🔊'}
                                    </button>
                                    <button
                                        className={`layer-btn solo ${isSolo ? 'active' : ''}`}
                                        onClick={() => handleToggleSolo(layer.id)}
                                        title={isSolo ? 'Unsolo' : 'Solo'}
                                    >
                                        🎧
                                    </button>
                                    <button
                                        className="layer-btn delete"
                                        onClick={() => handleDeleteLayer(layer.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LayerManager;

