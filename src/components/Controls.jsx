import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
        setTick(true);
        setTimeout(() => setTick(false), 100);
    });
    return unsubscribe;
  }, []);

  const handleMetronomeToggle = () => {
    const newState = !metronomeActive;
    setMetronomeActive(newState);
    AudioEngine.toggleMetronome(newState);
  };

  const handleBpmChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setBpm(val);
    AudioEngine.setBPM(val);
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
            <div className="toggle-group">
                <button
                  className={`control-btn ${metronomeActive ? 'active' : ''}`}
                  onClick={handleMetronomeToggle}
                  aria-pressed={metronomeActive}
                  style={{ backgroundColor: tick ? '#FF6B97' : '' }}
                >
                    ⏱️ Metronome
                </button>
                <input
                  type="number"
                  className="bpm-input control-btn"
                  value={bpm}
                  onChange={handleBpmChange}
                  min="40"
                  max="240"
                  style={{ width: '80px', textAlign: 'center' }}
                  aria-label="BPM"
                />
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
