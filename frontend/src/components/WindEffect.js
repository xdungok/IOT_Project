import React, { useMemo } from 'react';
import { FaWind } from 'react-icons/fa';
import '../App.css';

const NUM_PARTICLES = 15; // Số lượng hạt gió

function WindEffect() {
    // useMemo để đảm bảo các giá trị ngẫu nhiên chỉ được tạo 1 lần
    const particles = useMemo(() => {
        return Array.from({ length: NUM_PARTICLES }).map((_, index) => ({
            id: index,
            top: `${Math.random() * 100}%`, // Vị trí ngẫu nhiên
            duration: `${2 + Math.random() * 2}s`, // Tốc độ ngẫu nhiên từ 2-4s
            delay: `${Math.random() * 2}s`, // Độ trễ ngẫu nhiên
        }));
    }, []);

    return (
        <div className="fullscreen-effect-overlay">
            {particles.map(p => (
                <FaWind 
                    key={p.id}
                    className="wind-particle" 
                    style={{ 
                        top: p.top,
                        animationDuration: p.duration,
                        animationDelay: p.delay
                    }} 
                />
            ))}
        </div>
    );
}
export default WindEffect;