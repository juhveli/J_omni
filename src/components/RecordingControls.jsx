import React, { useState, useEffect, useRef } from 'react';
import RecordingEngine from '../utils/RecordingEngine';

const RecordingControls = ({ isAudioStarted }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSource, setRecordingSource] = useState('instruments');
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasMicPermission, setHasMicPermission] = useState(null);

    useEffect(() => {
        if (isAudioStarted) {
            RecordingEngine.initialize();
            RecordingEngine.onRecordingStateChange = (recording, _source) => {
                setIsRecording(recording);
            };
        }
    }, [isAudioStarted]);

    const wasRecordingRef = useRef(false);

    useEffect(() => {
        let interval;
        if (isRecording) {
            // Only reset time when transitioning from not-recording to recording
            if (!wasRecordingRef.current) {
                // Use interval with initial 0 to avoid synchronous setState
                interval = setInterval(() => {
                    setRecordingTime(t => t + 1);
                }, 1000);
                // Reset time via callback in next tick to avoid sync setState in effect
                Promise.resolve().then(() => setRecordingTime(0));
            } else {
                interval = setInterval(() => {
                    setRecordingTime(t => t + 1);
                }, 1000);
            }
        }
        wasRecordingRef.current = isRecording;
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleRecord = async () => {
        if (isRecording) {
            await RecordingEngine.stopRecording();
        } else {
            const success = await RecordingEngine.startRecording(recordingSource);
            if (!success && recordingSource === 'microphone') {
                setHasMicPermission(false);
            }
        }
    };

    const handleSourceChange = async (source) => {
        if (isRecording) return;
        setRecordingSource(source);

        if (source === 'microphone') {
            const hasAccess = await RecordingEngine.requestMicrophoneAccess();
            setHasMicPermission(hasAccess);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isAudioStarted) return null;

    return (
        <div className="recording-controls">
            <div className="recording-header">
                <h3>🎙️ Recording</h3>
                {isRecording && (
                    <div className="recording-indicator">
                        <span className="rec-dot"></span>
                        <span className="rec-time">{formatTime(recordingTime)}</span>
                    </div>
                )}
            </div>

            <div className="source-toggle">
                <button
                    className={`source-btn ${recordingSource === 'instruments' ? 'active' : ''}`}
                    onClick={() => handleSourceChange('instruments')}
                    disabled={isRecording}
                >
                    🎹 Instruments
                </button>
                <button
                    className={`source-btn ${recordingSource === 'microphone' ? 'active' : ''}`}
                    onClick={() => handleSourceChange('microphone')}
                    disabled={isRecording}
                >
                    🎤 Microphone
                </button>
            </div>

            {hasMicPermission === false && (
                <div className="mic-error">
                    ⚠️ Microphone access denied. Please allow microphone in your browser settings.
                </div>
            )}

            <div className="recording-actions">
                <button
                    className={`rec-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleRecord}
                >
                    {isRecording ? '⏹️ Stop' : '⏺️ Record'}
                </button>
            </div>
        </div>
    );
};

export default RecordingControls;
