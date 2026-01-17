import React from 'react';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  return (
    <div className="controls-container">
      <div className="control-group">
        <h3>Instrument</h3>
        <div className="toggle-group">
          <button
            className={`control-btn ${currentInstrument === 'piano' ? 'active' : ''}`}
            onClick={() => setInstrument('piano')}
            aria-pressed={currentInstrument === 'piano'}
          >
            🎹 Piano
          </button>
          <button
            className={`control-btn ${currentInstrument === 'guitar' ? 'active' : ''}`}
            onClick={() => setInstrument('guitar')}
            aria-pressed={currentInstrument === 'guitar'}
          >
            🎸 Guitar
          </button>
          <button
            className={`control-btn ${currentInstrument === 'clarinet' ? 'active' : ''}`}
            onClick={() => setInstrument('clarinet')}
            aria-pressed={currentInstrument === 'clarinet'}
          >
            🎷 Clarinet
          </button>
          <button
            className={`control-btn ${currentInstrument === 'oboe' ? 'active' : ''}`}
            onClick={() => setInstrument('oboe')}
            aria-pressed={currentInstrument === 'oboe'}
          >
            🐍 Oboe
          </button>
          <button
            className={`control-btn ${currentInstrument === 'doubleBass' ? 'active' : ''}`}
            onClick={() => setInstrument('doubleBass')}
            aria-pressed={currentInstrument === 'doubleBass'}
          >
            🎻 Bass
          </button>
          <button
            className={`control-btn ${currentInstrument === 'electricGuitar' ? 'active' : ''}`}
            onClick={() => setInstrument('electricGuitar')}
            aria-pressed={currentInstrument === 'electricGuitar'}
          >
            🎸⚡ E. Guitar
          </button>
          <button
            className={`control-btn ${currentInstrument === 'drums' ? 'active' : ''}`}
            onClick={() => setInstrument('drums')}
            aria-pressed={currentInstrument === 'drums'}
          >
            🥁 Drums
          </button>
        </div>
      </div>

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
              Simple (C Major)
            </button>
            <button
              className={`control-btn ${currentScale === 'full' ? 'active' : ''}`}
              onClick={() => setScale('full')}
              aria-pressed={currentScale === 'full'}
            >
              Full (Chromatic)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
