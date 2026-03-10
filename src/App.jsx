import { useState, useEffect } from 'react'
import Controls from './components/Controls'
import InstrumentPad from './components/InstrumentPad'
import AudioEngine from './utils/AudioEngine'
import RecordingStudio from './components/RecordingStudio'
import MagicGenerator from './components/MagicGenerator'
import Visualizer from './components/Visualizer'
import { INSTRUMENTS } from './constants'

function App() {
  // TODO: Add a Piano Roll editor view for advanced users
  // TODO: Implement user authentication to save user preferences and recordings.
  // TODO: Add an interactive tutorial mode for first-time users.
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [currentScale, setCurrentScale] = useState('simple')
  const [soundType, setSoundType] = useState('sampled')
  const [isAudioStarted, setIsAudioStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

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
           </header>
           <Controls
             currentInstrument={currentInstrument}
             setInstrument={handleInstrumentChange}
             currentScale={currentScale}
             setScale={setCurrentScale}
             soundType={soundType}
             setSoundType={handleSoundTypeChange}
             onOpenRecording={() => setActiveModal('recording')}
             onOpenMagic={() => setActiveModal('magic')}
           />
           <Visualizer />
           <InstrumentPad
             currentScale={currentScale}
             currentInstrument={currentInstrument}
           />
           {activeModal === 'recording' && (
             <RecordingStudio onClose={() => setActiveModal(null)} />
           )}
           {activeModal === 'magic' && (
             <MagicGenerator onClose={() => setActiveModal(null)} />
           )}
        </div>
      )}
    </div>
  )
}

export default App
