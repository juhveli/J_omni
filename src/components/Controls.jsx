import React, { useState, useEffect, useRef } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
        setFlash(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setFlash(false);
        }, 100);
    });

    return () => {
        unsubscribe();
        if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, []);

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const handleMetronomeToggle = () => {
      const newState = AudioEngine.toggleMetronome(bpm);
      setIsMetronomeActive(newState);
  };

  const handleBpmChange = (e) => {
      const newBpm = parseInt(e.target.value);
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

      <div className="settings-row" style={{ marginTop: '1rem' }}>
        <div className="control-group full-width">
            <h3>Metronome</h3>
            <div className="toggle-group" style={{ alignItems: 'center', gap: '1rem' }}>
                <button
                    className={`control-btn ${isMetronomeActive ? 'active' : ''}`}
                    onClick={handleMetronomeToggle}
                    style={{ backgroundColor: flash ? '#FFF78A' : undefined, color: flash ? '#333' : undefined }}
                >
                    ⏱️ {isMetronomeActive ? 'Stop' : 'Start'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <input
                        type="range"
                        min="60"
                        max="200"
                        value={bpm}
                        onChange={handleBpmChange}
                        style={{ flex: 1 }}
                    />
                    <span style={{ minWidth: '3rem', color: '#fff', fontWeight: 'bold' }}>{bpm} BPM</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
