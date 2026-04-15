import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [metronomeBlink, setMetronomeBlink] = useState(false);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
        setMetronomeBlink(true);
        setTimeout(() => setMetronomeBlink(false), 100);
    });
    return unsubscribe;
  }, []);

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const handleToggleMetronome = () => {
      const isActive = AudioEngine.toggleMetronome();
      setMetronomeActive(isActive);
  };

  const handleBpmChange = (e) => {
      const newBpm = parseInt(e.target.value, 10);
      setBpm(newBpm);
      AudioEngine.setMetronomeBPM(newBpm);
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
      </div>

      <div className="settings-row">
        <div className="control-group">
            <h3>Metronome {metronomeBlink && "🔵"}</h3>
            <div className="toggle-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                    className={`control-btn ${metronomeActive ? 'active' : ''}`}
                    onClick={handleToggleMetronome}
                    aria-pressed={metronomeActive}
                >
                    ⏱️ Metronome
                </button>
                <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={handleBpmChange}
                    style={{ marginTop: '10px' }}
                />
                <label>{bpm} BPM</label>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
