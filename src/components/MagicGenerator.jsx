import React, { useState } from 'react';
import { AIService } from '../services/aiService';

const MagicGenerator = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [isProMode, setIsProMode] = useState(false);

    // Pro Mode State
    const [bpm, setBpm] = useState(100);
    const [keyNote, setKeyNote] = useState('C');
    const [scaleType, setScaleType] = useState('Major');
    const [timeSig, setTimeSig] = useState('4/4');

    const moods = ["Happy", "Sad", "Fast", "Slow", "Space", "Nature"];
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const addMood = (mood) => {
        setPrompt(prev => prev ? `${prev}, ${mood}` : mood);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setResultUrl(null);

        const params = {
            prompt,
            duration,
        };

        if (isProMode) {
            params.bpm = bpm;
            params.key_signature = `${keyNote} ${scaleType}`;
            params.time_signature = timeSig;
        }

        try {
            const result = await AIService.generateLayer(params);
            if (result.success || result.mock) {
                setResultUrl(result.audio_url);
            } else {
                alert("Generation failed: " + result.message);
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="magic-generator-overlay">
            <div className={`generator-panel ${isProMode ? 'pro-mode' : ''}`}>
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="header-row">
                    <h2>✨ Magic Music Maker ✨</h2>
                    <label className="pro-toggle">
                        <input type="checkbox" checked={isProMode} onChange={(e) => setIsProMode(e.target.checked)} />
                        <span className="slider round"></span>
                        <span className="label-text">PRO</span>
                    </label>
                </div>

                <div className="input-area">
                    <p>What kind of music should I make?</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A happy unicorn running in space..."
                    />
                    <div className="mood-chips">
                        {moods.map(m => (
                            <button key={m} onClick={() => addMood(m)}>{m}</button>
                        ))}
                    </div>
                </div>

                <div className="settings-area">
                    <label>Length: {duration} seconds</label>
                    <input
                        type="range" min="10" max="60" step="10"
                        value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                    />
                </div>

                {isProMode && (
                    <div className="pro-controls">
                        <div className="pro-group">
                            <label>BPM: {bpm}</label>
                            <input
                                type="range" min="60" max="180" step="1"
                                value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
                            />
                        </div>
                        <div className="pro-group">
                            <label>Key</label>
                            <div className="key-selector">
                                <select value={keyNote} onChange={(e) => setKeyNote(e.target.value)}>
                                    {notes.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <select value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
                                    <option value="Major">Major</option>
                                    <option value="Minor">Minor</option>
                                </select>
                            </div>
                        </div>
                         <div className="pro-group">
                            <label>Time Sig</label>
                            <select value={timeSig} onChange={(e) => setTimeSig(e.target.value)}>
                                <option value="4/4">4/4</option>
                                <option value="3/4">3/4</option>
                                <option value="6/8">6/8</option>
                            </select>
                        </div>
                    </div>
                )}

                <button
                    className="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                >
                    {isGenerating ? '🔮 Creating Magic...' : '🎵 Create Music!'}
                </button>

                {resultUrl && (
                    <div className="result-area">
                        <h3>Here is your song!</h3>
                        <audio controls src={resultUrl} style={{ width: '100%' }} />
                    </div>
                )}
            </div>
            <style>{`
                .magic-generator-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                    color: white;
                }
                .generator-panel {
                    background: #1a2b3e; /* Blue-ish for generator */
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    border: 2px solid #00ffff;
                    box-shadow: 0 0 20px #00ffff;
                    max-width: 90%;
                    width: 450px;
                    position: relative;
                    transition: all 0.3s;
                }
                .generator-panel.pro-mode {
                    width: 550px;
                    background: #0d1620;
                    border-color: #ffaa00;
                    box-shadow: 0 0 25px #ffaa00;
                }
                .header-row {
                    display: flex; justify-content: center; align-items: center;
                    gap: 1rem; position: relative;
                    margin-bottom: 1rem;
                }
                .close-btn {
                    position: absolute; top: 10px; right: 10px;
                    background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
                    z-index: 10;
                }
                textarea {
                    width: 100%; height: 80px; padding: 10px; border-radius: 10px;
                    margin: 10px 0; font-size: 1rem;
                }
                .mood-chips {
                    display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
                }
                .mood-chips button {
                    background: rgba(255,255,255,0.2); border: 1px solid white;
                    color: white; padding: 5px 10px; border-radius: 15px; cursor: pointer;
                }
                .mood-chips button:hover { background: white; color: black; }
                .settings-area {
                    margin: 1rem 0;
                    color: #ccc;
                }
                .generate-btn {
                    background: linear-gradient(45deg, #00ffff, #ff00ff);
                    border: none; padding: 1rem 2rem; color: white;
                    font-size: 1.2rem; border-radius: 50px; cursor: pointer;
                    width: 100%; font-weight: bold;
                    margin-top: 1rem;
                }
                .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .result-area { margin-top: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; }

                /* Pro Toggle */
                .pro-toggle {
                    display: flex; align-items: center; gap: 5px; cursor: pointer;
                    position: absolute; right: 40px; top: 0;
                }
                .label-text { font-size: 0.8rem; font-weight: bold; color: #ffaa00; }

                /* Pro Controls */
                .pro-controls {
                    display: flex; justify-content: space-between; gap: 10px;
                    background: rgba(255, 170, 0, 0.1);
                    padding: 10px; border-radius: 10px;
                    margin-top: 10px;
                    border: 1px solid rgba(255, 170, 0, 0.3);
                }
                .pro-group {
                    display: flex; flex-direction: column; gap: 5px; flex: 1;
                }
                .pro-group label { font-size: 0.8rem; color: #ffaa00; }
                .key-selector { display: flex; gap: 2px; }
                select { background: #333; color: white; border: 1px solid #555; border-radius: 4px; padding: 2px; width: 100%; }
            `}</style>
        </div>
    );
};

export default MagicGenerator;
