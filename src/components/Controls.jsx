import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronome, setMetronome] = useState(AudioEngine.getMetronomeStatus());

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(setMetronome);
    return unsubscribe;
  }, []);

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const toggleMetronome = () => {
    AudioEngine.toggleMetronome();
  };

  const handleBpmChange = (e) => {
    AudioEngine.setBpm(Number(e.target.value));
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

        <div className="control-group">
          <h3>Metronome</h3>
          <div className="toggle-group">
            <button
              className={`control-btn ${metronome.isOn ? 'active' : ''}`}
              onClick={toggleMetronome}
              aria-pressed={metronome.isOn}
            >
              ⏱️ {metronome.isOn ? 'Stop' : 'Start'}
            </button>
            <input
              type="range"
              min="60"
              max="240"
              value={metronome.bpm}
              onChange={handleBpmChange}
              title={`BPM: ${metronome.bpm}`}
              style={{ width: '100px', marginLeft: '10px' }}
            />
            <span style={{ marginLeft: '10px' }}>{metronome.bpm} BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
