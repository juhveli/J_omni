import React, { useEffect, useRef } from 'react';
import AudioEngine from '../utils/AudioEngine';

const Visualizer = () => {
  // TODO: Add a resize event listener to dynamically resize the canvas and its context
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      const data = AudioEngine.getVisualizerData();

      ctx.fillStyle = '#111'; // Match dark mode somewhat or use transparent
      ctx.fillRect(0, 0, width, height);

      if (!data || data.length === 0) return;

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ffff'; // Unicorn cyan
      ctx.beginPath();

      const sliceWidth = width * 1.0 / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        // data[i] is between -1 and 1
        const v = data[i];
        const y = (v + 1) / 2 * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="visualizer-container" style={{ margin: '1rem auto', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        style={{
          background: '#000',
          borderRadius: '10px',
          border: '2px solid #ff00ff',
          boxShadow: '0 0 10px #ff00ff',
          width: '100%',
          maxWidth: '400px'
        }}
      />
    </div>
  );
};

export default Visualizer;
