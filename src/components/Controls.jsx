import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeStatus, setMetronomeStatus] = useState(AudioEngine.getMetronomeStatus ? AudioEngine.getMetronomeStatus() : { isPlaying: false, bpm: 120 });

  useEffect(() => {
    if (!AudioEngine.subscribeToMetronome) return;

    const unsubscribe = AudioEngine.subscribeToMetronome((isPlaying) => {
        setMetronomeStatus(prev => ({ ...prev, isPlaying }));
    });
    return unsubscribe;
  }, []);

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const handleToggleMetronome = () => {
    if (AudioEngine.toggleMetronome) {
        AudioEngine.toggleMetronome();
    }
  };

  const handleBPMChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    setMetronomeStatus(prev => ({ ...prev, bpm: newBpm }));
    if (AudioEngine.setBPM) {
        AudioEngine.setBPM(newBpm);
    }
  };

  return (
    <div className="controls-container">
      <div className="control-group full-width">
        <h3>Instrument</h3>
        <div className="toggle-group instrument-group">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              className={`control-btn instrument-btn ${currentInstrument === inst.id ? 'active' : ''}`}
              onClick={() => setInstrument(inst.id)}
              aria-pressed={currentInstrument === inst.id}
            >
              <span className="btn-icon">{inst.icon}</span>
              <span className="btn-label">{inst.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <div className="control-group">
          <h3>Sound Mode</h3>
          <div className="toggle-group">
            <button
              className={`control-btn ${soundType === 'sampled' ? 'active' : ''}`}
              onClick={() => setSoundType('sampled')}
              aria-pressed={soundType === 'sampled'}
            >
              🎧 Real
            </button>
            <button
              className={`control-btn ${soundType === 'synthesized' ? 'active' : ''}`}
              onClick={() => setSoundType('synthesized')}
              aria-pressed={soundType === 'synthesized'}
            >
              🤖 Computer
            </button>
          </div>
        </div>

        {currentInstrument !== 'drums' && (
          <div className="control-group">
            <h3>Scale</h3>
            <div className="toggle-group">
              <button
                className={`control-btn ${currentScale === 'simple' ? 'active' : ''}`}
                onClick={() => setScale('simple')}
                aria-pressed={currentScale === 'simple'}
              >
                🌈 Simple
              </button>
              <button
                className={`control-btn ${currentScale === 'full' ? 'active' : ''}`}
                onClick={() => setScale('full')}
                aria-pressed={currentScale === 'full'}
              >
                🎹 Full
              </button>
            </div>
          </div>
        )}

        <div className="control-group">
            <h3>Fun</h3>
            <div className="toggle-group">
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
            </div>
         </div>

         <div className="control-group metronome-group">
            <h3>Metronome</h3>
            <div className="metronome-controls">
                <button
                  className={`control-btn ${metronomeStatus.isPlaying ? 'active' : ''}`}
                  onClick={handleToggleMetronome}
                >
                    {metronomeStatus.isPlaying ? '⏹️ Stop' : '▶️ Start'}
                </button>
                <div className="bpm-control">
                    <label>BPM: {metronomeStatus.bpm}</label>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={metronomeStatus.bpm}
                      onChange={handleBPMChange}
                    />
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Controls;
