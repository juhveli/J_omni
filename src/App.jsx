import { useState, useEffect } from 'react'
import Controls from './components/Controls'
import InstrumentPad from './components/InstrumentPad'
import RecordingControls from './components/RecordingControls'
import LayerManager from './components/LayerManager'
import ComfyUIPanel from './components/ComfyUIPanel'
import AudioEngine from './utils/AudioEngine'
import { INSTRUMENTS } from './constants'

function App() {
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [currentScale, setCurrentScale] = useState('simple')
  const [soundType, setSoundType] = useState('sampled')
  const [isAudioStarted, setIsAudioStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('play') // 'play' or 'studio'

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

  // TODO: Implement user authentication for cloud saves
  const handleStart = async () => {
    await AudioEngine.initialize()
    setIsAudioStarted(true)
  }

  const handleInstrumentChange = (inst) => {
    setCurrentInstrument(inst)
    AudioEngine.setInstrument(inst)
  }

  const handleSoundTypeChange = (type) => {
    setSoundType(type)
    AudioEngine.setSoundType(type)
  }

  const activeInstrumentObj = INSTRUMENTS.find(i => i.id === currentInstrument) || INSTRUMENTS[0];

  return (
    <div className="app-container">
      {!isAudioStarted ? (
        <div className="start-overlay" onClick={handleStart}>
          <div className="start-content">
            <h1>🦄 Unicorn Music 🎵</h1>
            <button className="start-btn">Tap to Start!</button>
          </div>
        </div>
      ) : (
        <div className="main-interface">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner">✨</div>
                <h2>Summoning the {activeInstrumentObj.label}...</h2>
                <div className="loading-icon">{activeInstrumentObj.icon}</div>
              </div>
            </div>
          )}
          <header>
            <h1>🦄 Unicorn Music 🎵</h1>
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'play' ? 'active' : ''}`}
                onClick={() => setActiveTab('play')}
              >
                🎮 Play
              </button>
              <button
                className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
                onClick={() => setActiveTab('studio')}
              >
                🎙️ Studio
              </button>
            </div>
          </header>

          {activeTab === 'play' ? (
            <div className="play-view">
              <Controls
                currentInstrument={currentInstrument}
                setInstrument={handleInstrumentChange}
                currentScale={currentScale}
                setScale={setCurrentScale}
                soundType={soundType}
                setSoundType={handleSoundTypeChange}
              />
              <InstrumentPad
                currentScale={currentScale}
                currentInstrument={currentInstrument}
              />
            </div>
          ) : (
            <div className="studio-view">
              <div className="studio-sidebar">
                <RecordingControls isAudioStarted={isAudioStarted} />
                <ComfyUIPanel isAudioStarted={isAudioStarted} />
              </div>
              <div className="studio-main">
                <LayerManager isAudioStarted={isAudioStarted} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
