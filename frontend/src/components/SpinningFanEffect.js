import React from 'react';
import { FaFan } from 'react-icons/fa';
import '../App.css';

function SpinningFanEffect() {
    return (
        <div className="fullscreen-effect-overlay">
            <FaFan className="spinning-fan-effect" />
        </div>
    );
}
export default SpinningFanEffect;