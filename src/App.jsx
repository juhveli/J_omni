import { useState, useEffect } from 'react'
import Controls from './components/Controls'
import InstrumentPad from './components/InstrumentPad'
import Recorder from './components/Recorder'
import AudioEngine from './utils/AudioEngine'
import { INSTRUMENTS } from './constants'

function App() {
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [currentScale, setCurrentScale] = useState('simple')
  const [soundType, setSoundType] = useState('sampled')
  const [isAudioStarted, setIsAudioStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

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
            <button
              className="start-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              autoFocus
            >
              Tap to Start!
            </button>
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
           </header>
           <Controls
             currentInstrument={currentInstrument}
             setInstrument={handleInstrumentChange}
             currentScale={currentScale}
             setScale={setCurrentScale}
             soundType={soundType}
             setSoundType={handleSoundTypeChange}
           />
           <Recorder />
           <InstrumentPad
             currentScale={currentScale}
             currentInstrument={currentInstrument}
           />
        </div>
      )}
    </div>
  )
}

export default App
