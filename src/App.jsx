import { useState } from 'react'
import './App.css'
import Controls from './components/Controls'
import InstrumentPad from './components/InstrumentPad'
import AudioEngine from './utils/AudioEngine'

function App() {
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [currentScale, setCurrentScale] = useState('simple')
  const [isAudioStarted, setIsAudioStarted] = useState(false)

  const handleStart = async () => {
    await AudioEngine.initialize()
    setIsAudioStarted(true)
  }

  const handleInstrumentChange = (inst) => {
    setCurrentInstrument(inst)
    AudioEngine.setInstrument(inst)
  }

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
           <header>
             <h1>🦄 Unicorn Music 🎵</h1>
           </header>
           <Controls
             currentInstrument={currentInstrument}
             setInstrument={handleInstrumentChange}
             currentScale={currentScale}
             setScale={setCurrentScale}
           />
           <InstrumentPad currentScale={currentScale} />
        </div>
      )}
    </div>
  )
}

export default App
