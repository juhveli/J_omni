import React, { useState, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeBPM, setMetronomeBPM] = useState(120);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [metronomeTick, setMetronomeTick] = useState(false);
  const [globalVolume, setGlobalVolume] = useState(100);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
        setMetronomeTick(true);
        setTimeout(() => setMetronomeTick(false), 100);
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
            <h3>Volume</h3>
            <div className="toggle-group" style={{ flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔈</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={globalVolume}
                      onChange={(e) => {
                          const val = Number(e.target.value);
                          setGlobalVolume(val);
                          AudioEngine.setVolume(val);
                      }}
                      style={{ width: '100px' }}
                    />
                    <span style={{ fontSize: '1.2rem' }}>🔊</span>
                </div>
            </div>
         </div>

         <div className="control-group">
            <h3>Metronome</h3>
            <div className="toggle-group" style={{ flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <button
                  className={`control-btn ${isMetronomePlaying ? 'active' : ''}`}
                  onClick={() => setIsMetronomePlaying(AudioEngine.toggleMetronome())}
                  style={{ backgroundColor: metronomeTick ? 'var(--secondary-color)' : '' }}
                >
                    ⏱️ {isMetronomePlaying ? 'Stop' : 'Start'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem' }}>BPM: {metronomeBPM}</span>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={metronomeBPM}
                      onChange={(e) => {
                          const val = Number(e.target.value);
                          setMetronomeBPM(val);
                          AudioEngine.setMetronomeBPM(val);
                      }}
                      style={{ width: '100px' }}
                    />
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Controls;
