import React, { useEffect, useRef } from 'react';
import AudioEngine from '../utils/AudioEngine';

const Visualizer = () => {
  // TODO: Add support for different visualizer styles (e.g., bars, circular).
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = container.clientWidth;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      const data = AudioEngine.getVisualizerData();

      // Fade-out trail effect
      ctx.fillStyle = 'rgba(17, 17, 17, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (!data || data.length === 0) return;

      // Create a gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#ff00cc'); // Unicorn pink
      gradient.addColorStop(1, '#00ffff'); // Unicorn cyan

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="visualizer-container" style={{ margin: '1rem auto', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
      <canvas
        ref={canvasRef}
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
