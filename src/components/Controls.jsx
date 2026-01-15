import React from 'react';

const Controls = ({ currentInstrument, setInstrument, currentScale, setScale }) => {
  return (
    <div className="controls-container">
      <div className="control-group">
        <h3>Instrument</h3>
        <div className="toggle-group">
          <button
            className={`control-btn ${currentInstrument === 'piano' ? 'active' : ''}`}
            onClick={() => setInstrument('piano')}
          >
            🎹 Piano
          </button>
          <button
            className={`control-btn ${currentInstrument === 'guitar' ? 'active' : ''}`}
            onClick={() => setInstrument('guitar')}
          >
            🎸 Guitar
          </button>
        </div>
      </div>

      <div className="control-group">
        <h3>Scale</h3>
        <div className="toggle-group">
          <button
            className={`control-btn ${currentScale === 'simple' ? 'active' : ''}`}
            onClick={() => setScale('simple')}
          >
            Simple (C Major)
          </button>
          <button
            className={`control-btn ${currentScale === 'full' ? 'active' : ''}`}
            onClick={() => setScale('full')}
          >
            Full (Chromatic)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
