import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [activeBeat, setActiveBeat] = useState(-1);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome((beat) => {
      setActiveBeat(beat);
    });
    return unsubscribe;
  }, []);

  const handleMetronomeToggle = () => {
    const isPlaying = AudioEngine.toggleMetronome();
    setIsMetronomeActive(isPlaying);
    if (!isPlaying) setActiveBeat(-1);
  };

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    setBpm(newBpm);
    AudioEngine.setBpm(newBpm);
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
            <h3>Fun</h3>
            <div className="toggle-group">
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
            </div>
         </div>

         <div className="control-group">
            <h3>Metronome</h3>
            <div className="toggle-group metronome-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`control-btn ${isMetronomeActive ? 'active' : ''}`}
                  onClick={handleMetronomeToggle}
                >
                    ⏱️ {isMetronomeActive ? 'Stop' : 'Start'}
                </button>
                <input
                  type="number"
                  className="bpm-input"
                  value={bpm}
                  onChange={handleBpmChange}
                  min="40"
                  max="240"
                  style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <span className="bpm-label" style={{ fontSize: '0.9rem' }}>BPM</span>

                {/* Visual Indicator */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    {[0, 1, 2, 3].map(beat => (
                      <div
                        key={beat}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: activeBeat === beat ? (beat === 0 ? '#ff4757' : '#2ed573') : '#dfe4ea',
                          transition: 'background-color 0.1s ease'
                        }}
                      />
                    ))}
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Controls;
