import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeStatus, setMetronomeStatus] = useState(() => AudioEngine.getMetronomeStatus());

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const handleToggleMetronome = () => {
    const isPlaying = AudioEngine.toggleMetronome();
    setMetronomeStatus(prev => ({ ...prev, isPlaying }));
  };

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    AudioEngine.setBpm(newBpm);
    setMetronomeStatus(prev => ({ ...prev, bpm: newBpm }));
  };

  return (
    <div className="controls-container">
      {/* TODO: [Enhancement] Add volume/pan controls per instrument */}
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
            <div className="toggle-group" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <button
                  className={`control-btn ${metronomeStatus.isPlaying ? 'active' : ''}`}
                  onClick={handleToggleMetronome}
                >
                    {metronomeStatus.isPlaying ? '⏹️ Stop' : '⏱️ Start'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'white' }}>
                  <input
                    type="range"
                    min="60"
                    max="240"
                    value={metronomeStatus.bpm}
                    onChange={handleBpmChange}
                  />
                  <span>{metronomeStatus.bpm} BPM</span>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Controls;
