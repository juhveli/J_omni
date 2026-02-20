import React, { useState } from 'react';
import AudioEngine from '../utils/AudioEngine';

const EffectsRack = () => {
    const [values, setValues] = useState({
        reverb: 0,
        delay: 0,
        filter: 1,
        volume: 80
    });

    const handleChange = (effect, val) => {
        const numVal = parseFloat(val);
        setValues(prev => ({ ...prev, [effect]: numVal }));

        if (effect === 'volume') {
            AudioEngine.setVolume(numVal);
        } else {
            AudioEngine.setEffectValue(effect, numVal);
        }
    };

    return (
        <div className="effects-rack">
            <div className="effect-control">
                <label>✨ Reverb</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={values.reverb}
                    onChange={(e) => handleChange('reverb', e.target.value)}
                />
            </div>
            <div className="effect-control">
                <label>🔁 Delay</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={values.delay}
                    onChange={(e) => handleChange('delay', e.target.value)}
                />
            </div>
            <div className="effect-control">
                <label>🌈 Filter</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={values.filter}
                    onChange={(e) => handleChange('filter', e.target.value)}
                />
            </div>
            <div className="effect-control">
                <label>🔊 Volume</label>
                <input
                    type="range" min="0" max="100" step="1"
                    value={values.volume}
                    onChange={(e) => handleChange('volume', e.target.value)}
                />
            </div>
            <style>{`
                .effects-rack {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1rem;
                    background: rgba(0,0,0,0.4);
                    border-radius: 15px;
                    border: 1px solid var(--secondary-color);
                    margin-top: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .effect-control {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                .effect-control label {
                    font-size: 0.8rem;
                    color: var(--secondary-color);
                    font-weight: bold;
                }
                input[type=range] {
                    width: 100px;
                }
            `}</style>
        </div>
    );
};

export default EffectsRack;
