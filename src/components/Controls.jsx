import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { INSTRUMENTS, MAGIC_MELODY } from '../constants';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType, onOpenRecording, onOpenMagic }) => {
  const [volume, setVolume] = useState(80);

  const handleMagicClick = () => {
    AudioEngine.playMelody(MAGIC_MELODY);
  };

  const [instrumentVolume, setInstrumentVolume] = useState(80);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [reverbWet, setReverbWet] = useState(0);
  const [delayWet, setDelayWet] = useState(0);

  // When instrument changes, update the local instrument volume state
  React.useEffect(() => {
    setInstrumentVolume(AudioEngine.getInstrumentVolume(currentInstrument));
  }, [currentInstrument]);

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    AudioEngine.setVolume(val);
  };

  const handleInstrumentVolumeChange = (e) => {
    const val = Number(e.target.value);
    setInstrumentVolume(val);
    AudioEngine.setInstrumentVolume(currentInstrument, val);
  };

  const toggleMetronome = () => {
    if (isMetronomePlaying) {
      AudioEngine.stopMetronome();
      setIsMetronomePlaying(false);
    } else {
      AudioEngine.startMetronome();
      setIsMetronomePlaying(true);
    }
  };

  const handleBpmChange = (e) => {
    const newBpm = Number(e.target.value);
    setBpm(newBpm);
    AudioEngine.setBpm(newBpm);
  };

  const handleReverbChange = (e) => {
    const val = Number(e.target.value);
    setReverbWet(val);
    AudioEngine.setEffectWetness('reverb', val / 100);
  };

  const handleDelayChange = (e) => {
    const val = Number(e.target.value);
    setDelayWet(val);
    AudioEngine.setEffectWetness('delay', val / 100);
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
                    🪄 Melody
                </button>
                <button className="control-btn" onClick={onOpenRecording}>
                    🎙️ Record
                </button>
                <button className="control-btn" onClick={onOpenMagic}>
                    ✨ AI Maker
                </button>
                <button
                  className={`control-btn ${isMetronomePlaying ? 'active' : ''}`}
                  onClick={toggleMetronome}
                  aria-pressed={isMetronomePlaying}
                >
                  ⏱️ Metronome
                </button>
            </div>
         </div>
      </div>

      {/* TODO: Implement visual beat indicators for the Metronome */}
      <div className="settings-row" style={{ marginTop: '1rem', justifyContent: 'center', gap: '2rem' }}>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3>Tempo ({bpm} BPM)</h3>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={handleBpmChange}
            style={{ width: '150px' }}
          />
        </div>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3>Master Vol</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: '150px' }}
          />
        </div>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3>{INSTRUMENTS.find(i => i.id === currentInstrument)?.label} Vol</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={instrumentVolume}
            onChange={handleInstrumentVolumeChange}
            style={{ width: '150px' }}
          />
        </div>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3>Reverb</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={reverbWet}
            onChange={handleReverbChange}
            style={{ width: '100px' }}
          />
        </div>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3>Delay</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={delayWet}
            onChange={handleDelayChange}
            style={{ width: '100px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;
