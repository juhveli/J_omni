import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';
import { AIService } from '../services/aiService';

const RecordingStudio = ({ onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [polishStyle, setPolishStyle] = useState('orchestral');

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

    const handleDownload = () => {
        // TODO: Implement cloud saving of recorded sessions
        // TODO: Allow trimming/editing of recorded audio before saving.
        if (!recordedBlob) return;
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        // Generate timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');

        a.download = `unicorn_music_recording_${timestamp}.webm`; // Default Tone.Recorder format
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleMagicPolish = async () => {
        if (!recordedBlob) return;
        setIsProcessing(true);
        try {
            // Map simple styles to prompt additions
            const prompts = {
                orchestral: "Make it sound like a grand orchestra, cinematic, epic",
                rock: "Add electric guitars and heavy drums, rock style",
                techno: "Make it electronic, synthesizer, dance beat",
                spooky: "Make it spooky, halloween style, minor key"
            };

            const prompt = prompts[polishStyle] || "Polish this song";

            const result = await AIService.editSong(recordedBlob, prompt, "polish");

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
            <div className="studio-panel">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>🎙️ Recording Studio</h2>

                <div className="controls-area">
                    <button
                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={handleRecordToggle}
                    >
                        {isRecording ? '⬛ Stop' : '🔴 Record'}
                    </button>

                    {recordedBlob && !isRecording && (
                        <>
                            <button className="play-btn" onClick={handlePlayRecording}>
                                ▶️ Play Back
                            </button>
                            <button className="download-btn" onClick={handleDownload}>
                                💾 Save
                            </button>
                        </>
                    )}
                </div>

                {recordedBlob && !isRecording && (
                    <div className="magic-area">
                        <h3>✨ Add Magic ✨</h3>
                        <div className="magic-controls">
                            <select value={polishStyle} onChange={(e) => setPolishStyle(e.target.value)}>
                                <option value="orchestral">🎻 Orchestral</option>
                                <option value="rock">🎸 Rock Star</option>
                                <option value="techno">🤖 Robot Dance</option>
                                <option value="spooky">👻 Spooky</option>
                            </select>
                            <button
                                className="magic-btn"
                                onClick={handleMagicPolish}
                                disabled={isProcessing}
                            >
                                {isProcessing ? '✨ Casting Spell...' : '✨ Polish My Song'}
                            </button>
                        </div>
                    </div>
                )}

                {resultUrl && (
                    <div className="result-area">
                        <h3>🎉 Magic Result!</h3>
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
                }
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
                    font-weight: bold; margin: 0.5rem;
                }
                .download-btn {
                    background: #44aaff; color: white; padding: 0.5rem 1rem; border-radius: 10px; border: none; cursor: pointer;
                    font-weight: bold; margin: 0.5rem;
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
            `}</style>
        </div>
    );
};

export default RecordingStudio;
