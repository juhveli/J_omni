import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeState, setMetronomeState] = useState(AudioEngine.getMetronomeStatus ? AudioEngine.getMetronomeStatus() : { isPlaying: false, bpm: 120 });

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  return (
    // TODO: Implement custom theming support
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
            <div className="toggle-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className={`control-btn ${metronomeState.isPlaying ? 'active' : ''}`}
                        onClick={() => {
                            if (AudioEngine.toggleMetronome) {
                                setMetronomeState(AudioEngine.toggleMetronome());
                            }
                        }}
                    >
                        ⏱️ Metronome
                    </button>
                    <input
                        type="range"
                        min="40"
                        max="240"
                        value={metronomeState.bpm}
                        onChange={(e) => {
                            const newBpm = parseInt(e.target.value);
                            if (AudioEngine.setBpm) {
                                AudioEngine.setBpm(newBpm);
                                setMetronomeState(prev => ({ ...prev, bpm: newBpm }));
                            }
                        }}
                        style={{ width: '80px' }}
                    />
                    <span style={{ color: 'white', fontSize: '0.8rem' }}>{metronomeState.bpm} BPM</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Controls;
