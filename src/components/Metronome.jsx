import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';

const Metronome = () => {
    const [status, setStatus] = useState({ active: false, bpm: 120 });

    useEffect(() => {
        const unsubscribe = AudioEngine.subscribeToMetronome((newStatus) => {
            setStatus(newStatus);
        });
        return unsubscribe;
    }, []);

    const handleToggle = () => {
        AudioEngine.toggleMetronome();
    };

    const handleBpmChange = (e) => {
        AudioEngine.setBPM(parseInt(e.target.value, 10));
    };

    return (
        <div className="control-group">
            <h3>Metronome</h3>
            <div className="metronome-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <button
                    className={`control-btn ${status.active ? 'active' : ''}`}
                    onClick={handleToggle}
                    aria-pressed={status.active}
                >
                    {status.active ? '⏹️ Stop' : '⏱️ Start'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="range"
                        min="40"
                        max="240"
                        value={status.bpm}
                        onChange={handleBpmChange}
                    />
                    <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{status.bpm} BPM</span>
                </div>
            </div>
        </div>
    );
};

export default Metronome;
