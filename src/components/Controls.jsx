import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [flashing, setFlashing] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
      setFlashing(true);
      setTimeout(() => setFlashing(false), 100);
    });
    return unsubscribe;
  }, []);

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
            <div className="toggle-group" style={{ alignItems: 'center', flexDirection: 'column' }}>
                <button
                  className={`control-btn ${metronomeOn ? 'active' : ''}`}
                  onClick={() => {
                      const isOn = AudioEngine.toggleMetronome();
                      setMetronomeOn(isOn);
                  }}
                  style={{ backgroundColor: flashing ? 'rgba(255, 255, 255, 0.5)' : '' }}
                >
                    ⏱️ Metronome
                </button>
                {metronomeOn && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
                    <input
                      type="range"
                      min="60"
                      max="240"
                      value={bpm}
                      onChange={(e) => {
                        const newBpm = parseInt(e.target.value);
                        setBpm(newBpm);
                        AudioEngine.setBpm(newBpm);
                      }}
                      style={{ width: '100px' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'white' }}>{bpm} BPM</span>
                  </div>
                )}
            </div>
         </div>

         <div className="control-group">
            <h3>Volume</h3>
            <div className="toggle-group" style={{ alignItems: 'center', flexDirection: 'column' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const newVol = parseInt(e.target.value);
                    setVolume(newVol);
                    AudioEngine.setVolume(newVol);
                  }}
                  style={{ width: '100px', marginTop: '10px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'white', marginTop: '5px' }}>{volume}%</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Controls;
