import sys

filepath = 'src/components/Controls.jsx'
with open(filepath, 'r') as f:
    content = f.read()

import1 = """import React from 'react';"""
import2 = """import React, { useState, useEffect } from 'react';"""
content = content.replace(import1, import2)

comp_start = """const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {

  const handleMagicClick = () => {"""
comp_start_replace = """const Controls = ({ currentInstrument, setInstrument, currentScale, setScale, soundType, setSoundType }) => {
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const unsubscribe = AudioEngine.subscribeToMetronome(() => {
        setTick(true);
        setTimeout(() => setTick(false), 100);
    });
    return unsubscribe;
  }, []);

  const handleMetronomeToggle = () => {
    const newState = !metronomeActive;
    setMetronomeActive(newState);
    AudioEngine.toggleMetronome(newState);
  };

  const handleBpmChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setBpm(val);
    AudioEngine.setBPM(val);
  };

  const handleMagicClick = () => {"""
content = content.replace(comp_start, comp_start_replace)

fun_group = """        <div className="control-group">
            <h3>Fun</h3>
            <div className="toggle-group">
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
            </div>
         </div>"""
fun_group_replace = """        <div className="control-group">
            <h3>Metronome</h3>
            <div className="toggle-group">
                <button
                  className={`control-btn ${metronomeActive ? 'active' : ''}`}
                  onClick={handleMetronomeToggle}
                  aria-pressed={metronomeActive}
                  style={{ backgroundColor: tick ? '#FF6B97' : '' }}
                >
                    ⏱️ Metronome
                </button>
                <input
                  type="number"
                  className="bpm-input control-btn"
                  value={bpm}
                  onChange={handleBpmChange}
                  min="40"
                  max="240"
                  style={{ width: '80px', textAlign: 'center' }}
                  aria-label="BPM"
                />
            </div>
        </div>

        <div className="control-group">
            <h3>Fun</h3>
            <div className="toggle-group">
                <button className="control-btn" onClick={handleMagicClick}>
                    🪄 Magic Melody
                </button>
            </div>
         </div>"""
content = content.replace(fun_group, fun_group_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated Controls.jsx with Metronome")
