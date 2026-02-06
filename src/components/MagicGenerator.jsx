import React, { useState } from 'react';
import { AIService } from '../services/aiService';

const MagicGenerator = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);

    const moods = ["Happy", "Sad", "Fast", "Slow", "Space", "Nature"];

    const addMood = (mood) => {
        setPrompt(prev => prev ? `${prev}, ${mood}` : mood);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setResultUrl(null);
        try {
            const result = await AIService.generateLayer(prompt, duration);
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
            <div className="generator-panel">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>✨ Magic Music Maker ✨</h2>

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
                }
                .close-btn {
                    position: absolute; top: 10px; right: 10px;
                    background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
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
                }
                .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .result-area { margin-top: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default MagicGenerator;
