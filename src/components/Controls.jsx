// TODO: Add custom user theme selection
import React from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';
import { useState, useEffect } from 'react';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeState, setMetronomeState] = useState(AudioEngine.getMetronomeStatus ? AudioEngine.getMetronomeStatus() : { isPlaying: false, bpm: 120 });

  useEffect(() => {
    if (AudioEngine.subscribeToMetronome) {
        const unsubscribe = AudioEngine.subscribeToMetronome(setMetronomeState);
        return unsubscribe;
    }
  }, []);

  const handleMetronomeToggle = () => {
    if (AudioEngine.toggleMetronome) {
        AudioEngine.toggleMetronome();
    }
  };

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    if (AudioEngine.setBpm) {
        AudioEngine.setBpm(newBpm);
    } else {
        setMetronomeState(prev => ({ ...prev, bpm: newBpm }));
    }
  };

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
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
            <h3>Metronome</h3>
            <div className="toggle-group metronome-control">
                <button
                  className={`control-btn ${metronomeState.isPlaying ? 'active' : ''}`}
                  onClick={handleMetronomeToggle}
                  aria-pressed={metronomeState.isPlaying}
                >
                    ⏱️ {metronomeState.isPlaying ? 'Stop' : 'Start'}
                </button>
                <div className="bpm-slider-container">
                    <label htmlFor="bpm-slider">{metronomeState.bpm} BPM</label>
                    <input
                      type="range"
                      id="bpm-slider"
                      className="bpm-slider"
                      min="60"
                      max="200"
                      value={metronomeState.bpm}
                      onChange={handleBpmChange}
                    />
                </div>
            </div>
        </div>

        <div className="control-group">
            <h3>Fun</h3>
            <div className="toggle-group">
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Controls;
