import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import '../App.css';

function LightBulbEffect() {
    return (
        <div className="fullscreen-effect-overlay">
            <FaLightbulb className="light-bulb-effect" />
        </div>
    );
}
export default LightBulbEffect;