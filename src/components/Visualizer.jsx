import React, { useRef, useEffect } from 'react';
import AudioEngine from '../utils/AudioEngine';

const Visualizer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            const values = AudioEngine.getWaveform();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00ffff';

            const sliceWidth = canvas.width / values.length;
            let x = 0;

            for (let i = 0; i < values.length; i++) {
                const v = values[i];
                const y = (v + 1) / 2 * canvas.height;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.stroke();

            // Add a little glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div className="visualizer-container">
            <canvas ref={canvasRef} width="600" height="100" />
            <style>{`
                .visualizer-container {
                    width: 100%;
                    max-width: 600px;
                    height: 100px;
                    margin: 1rem 0;
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                    overflow: hidden;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                }
            `}</style>
        </div>
    );
};

export default Visualizer;
