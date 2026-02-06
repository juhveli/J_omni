import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { AIService } from '../services/aiService';

const RecordingStudio = ({ onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [polishStyle, setPolishStyle] = useState('orchestral');

    // Pro Mode State
    const [isProMode, setIsProMode] = useState(false);
    const [editMode, setEditMode] = useState('polish');
    const [customPrompt, setCustomPrompt] = useState('');

    const handleRecordToggle = async () => {
        if (isRecording) {
            const blob = await AudioEngine.stopRecording();
            setRecordedBlob(blob);
            setIsRecording(false);
        } else {
            setRecordedBlob(null);
            setResultUrl(null);
            await AudioEngine.startRecording();
            setIsRecording(true);
        }
    };

    const handlePlayRecording = () => {
        if (recordedBlob) {
            AudioEngine.playBlob(recordedBlob);
        }
    };

    const handleMagicPolish = async () => {
        if (!recordedBlob) return;
        setIsProcessing(true);
        try {
            let prompt = "";
            let mode = "polish";

            if (isProMode) {
                prompt = customPrompt;
                mode = editMode;
            } else {
                // Map simple styles to prompt additions
                const prompts = {
                    orchestral: "Make it sound like a grand orchestra, cinematic, epic",
                    rock: "Add electric guitars and heavy drums, rock style",
                    techno: "Make it electronic, synthesizer, dance beat",
                    spooky: "Make it spooky, halloween style, minor key"
                };
                prompt = prompts[polishStyle] || "Polish this song";
                mode = "polish";
            }

            const result = await AIService.editSong(recordedBlob, prompt, mode);

            if (result.success || result.mock) {
                 setResultUrl(result.audio_url);
            } else {
                 alert("Magic failed: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Magic failed: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="recording-studio-overlay">
            <div className={`studio-panel ${isProMode ? 'pro-mode' : ''}`}>
                <button className="close-btn" onClick={onClose}>×</button>
                 <div className="header-row">
                    <h2>🎙️ Recording Studio</h2>
                    <label className="pro-toggle">
                        <input type="checkbox" checked={isProMode} onChange={(e) => setIsProMode(e.target.checked)} />
                         <span className="label-text">PRO</span>
                    </label>
                </div>

                <div className="controls-area">
                    <button
                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={handleRecordToggle}
                    >
                        {isRecording ? '⬛ Stop' : '🔴 Record'}
                    </button>

                    {recordedBlob && !isRecording && (
                        <button className="play-btn" onClick={handlePlayRecording}>
                            ▶️ Play Back
                        </button>
                    )}
                </div>

                {recordedBlob && !isRecording && (
                    <div className="magic-area">
                        <h3>{isProMode ? '🛠️ Audio Engineering' : '✨ Add Magic ✨'}</h3>

                        {!isProMode ? (
                            <div className="magic-controls">
                                <select value={polishStyle} onChange={(e) => setPolishStyle(e.target.value)}>
                                    <option value="orchestral">🎻 Orchestral</option>
                                    <option value="rock">🎸 Rock Star</option>
                                    <option value="techno">🤖 Robot Dance</option>
                                    <option value="spooky">👻 Spooky</option>
                                </select>
                            </div>
                        ) : (
                            <div className="pro-controls">
                                <div className="pro-group">
                                    <label>Operation Mode</label>
                                    <select value={editMode} onChange={(e) => setEditMode(e.target.value)}>
                                        <option value="polish">Polish (Enhance)</option>
                                        <option value="repaint">Repaint (Edit)</option>
                                        <option value="cover">Cover (Remix)</option>
                                        <option value="vocal2bgm">Vocal to BGM</option>
                                    </select>
                                </div>
                                <div className="pro-group full-width">
                                    <label>Custom Instructions</label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Describe exactly what you want..."
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            className="magic-btn"
                            onClick={handleMagicPolish}
                            disabled={isProcessing}
                        >
                            {isProcessing ? '✨ Processing...' : (isProMode ? '🚀 Execute' : '✨ Polish My Song')}
                        </button>
                    </div>
                )}

                {resultUrl && (
                    <div className="result-area">
                        <h3>🎉 Result!</h3>
                        <audio controls src={resultUrl} style={{ width: '100%' }} />
                    </div>
                )}
            </div>
            <style>{`
                .recording-studio-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                    color: white;
                }
                .studio-panel {
                    background: #2a1b3e;
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #ff00ff;
                    max-width: 90%;
                    width: 400px;
                    position: relative;
                    transition: all 0.3s;
                }
                .studio-panel.pro-mode {
                    width: 500px;
                    background: #150f20;
                    border-color: #ffaa00;
                    box-shadow: 0 0 25px #ffaa00;
                }
                .header-row {
                    display: flex; justify-content: center; align-items: center;
                    gap: 1rem; position: relative;
                    margin-bottom: 1rem;
                }
                .pro-toggle {
                    display: flex; align-items: center; gap: 5px; cursor: pointer;
                    position: absolute; right: 40px; top: 0;
                }
                .label-text { font-size: 0.8rem; font-weight: bold; color: #ffaa00; }

                .close-btn {
                    position: absolute; top: 10px; right: 10px;
                    background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
                }
                .record-btn {
                    font-size: 1.5rem; padding: 1rem 2rem; border-radius: 50px;
                    border: none; cursor: pointer; margin: 1rem;
                    background: #ff4444; color: white;
                    transition: all 0.2s;
                }
                .record-btn:hover {
                    transform: scale(1.05);
                }
                .record-btn.recording {
                    background: #ff0000; animation: pulse 1s infinite;
                }
                .play-btn {
                    background: #44ff44; color: black; padding: 0.5rem 1rem; border-radius: 10px; border: none; cursor: pointer;
                    font-weight: bold;
                }
                .magic-area {
                    margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #444;
                }
                .magic-controls {
                    display: flex; flex-direction: column; gap: 10px; align-items: center;
                }
                .magic-btn {
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    border: none; padding: 0.8rem 1.5rem; color: white;
                    border-radius: 10px; cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    margin-top: 1rem;
                }
                .magic-btn:disabled {
                    opacity: 0.7; cursor: not-allowed;
                }
                select {
                    padding: 0.5rem; border-radius: 5px; width: 100%;
                    font-size: 1rem;
                }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
                }
                .result-area {
                    margin-top: 1.5rem;
                    background: rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 10px;
                }

                /* Pro Controls */
                .pro-controls {
                     background: rgba(255, 170, 0, 0.1);
                     padding: 10px; border-radius: 10px;
                     text-align: left;
                }
                .pro-group { margin-bottom: 10px; }
                .pro-group label { display: block; font-size: 0.8rem; color: #ffaa00; margin-bottom: 3px; }
                .pro-group.full-width textarea { width: 100%; height: 60px; border-radius: 5px; padding: 5px; }
            `}</style>
        </div>
    );
};

export default RecordingStudio;
