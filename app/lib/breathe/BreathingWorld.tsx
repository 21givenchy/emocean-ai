"use client";

import React, { useMemo } from 'react';
import { WorldState } from './stateMachine';

interface BreathingWorldProps {
  state: WorldState;
  breathRate: number | null;
  isFrozen: boolean;
}

export const BreathingWorld: React.FC<BreathingWorldProps> = ({ state, breathRate, isFrozen }) => {
  // Cloud positions (deterministic based on count)
  const clouds = useMemo(() => {
    return Array.from({ length: Math.min(state.clouds.count, 8) }, (_, i) => ({
      x: 10 + (i * 12) % 80,
      y: state.clouds.y + (i % 3) * 5,
      width: 15 + (i % 3) * 8,
      opacity: state.clouds.opacity * (0.7 + (i % 3) * 0.1),
    }));
  }, [state.clouds.count, state.clouds.y, state.clouds.opacity]);

  // Water wave path
  const waterPath = useMemo(() => {
    const h = 300 - state.water.height * 2;
    const r = state.water.roughness;
    const points: string[] = [`M 0 ${h}`];
    for (let x = 0; x <= 400; x += 20) {
      const waveY = h + Math.sin(x * 0.02 + r * 5) * (r * 15) + Math.sin(x * 0.05) * (r * 8);
      points.push(`L ${x} ${waveY}`);
    }
    points.push('L 400 300 L 0 300 Z');
    return points.join(' ');
  }, [state.water.roughness, state.water.height]);

  // Rain drops
  const rainDrops = useMemo(() => {
    if (state.particles.type !== 'rain' && state.particles.type !== 'snow') return [];
    const count = Math.round(state.particles.density * 30);
    return Array.from({ length: count }, (_, i) => ({
      x: (i * 13.7 + 5) % 100,
      delay: (i * 0.3) % 2,
      speed: 0.5 + (i % 3) * 0.3,
    }));
  }, [state.particles.type, state.particles.density]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden" style={{ maxWidth: '500px' }}>
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={state.sky.top} />
            <stop offset="100%" stopColor={state.sky.bottom} />
          </linearGradient>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffee88" stopOpacity={state.sky.sunOpacity} />
            <stop offset="100%" stopColor="#ffee88" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={state.water.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={state.water.color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="300" fill="url(#sky)" />

        {/* Sun */}
        <circle cx="200" cy={state.sky.sunY} r="40" fill="url(#sun)" />

        {/* Clouds */}
        {clouds.map((cloud, i) => (
          <g key={i} opacity={cloud.opacity}>
            <ellipse cx={cloud.x + 5} cy={cloud.y} rx={cloud.width * 0.6} ry={8} fill="white" opacity="0.6" />
            <ellipse cx={cloud.x} cy={cloud.y - 3} rx={cloud.width * 0.4} ry={6} fill="white" opacity="0.8" />
            <ellipse cx={cloud.x + 8} cy={cloud.y + 2} rx={cloud.width * 0.5} ry={7} fill="white" opacity="0.5" />
          </g>
        ))}

        {/* Lightning */}
        {state.threats.visible && state.threats.opacity > 0.1 && (
          <g opacity={state.threats.opacity}>
            <path
              d="M 180 60 L 175 90 L 185 90 L 170 130"
              stroke="#ffee88"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M 250 50 L 245 85 L 255 85 L 240 120"
              stroke="#ffee88"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </g>
        )}

        {/* Water */}
        <path d={waterPath} fill="url(#waterGrad)" />

        {/* Wave highlights */}
        {state.water.roughness > 0.1 && (
          <g opacity={state.water.roughness * 0.5}>
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={30 + i * 70}
                y1={300 - state.water.height * 2 + i * 3}
                x2={50 + i * 70}
                y2={300 - state.water.height * 2 + i * 3}
                stroke="white"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
          </g>
        )}

        {/* Rain */}
        {rainDrops.map((drop, i) => (
          <line
            key={i}
            x1={`${drop.x}%`}
            y1={`${10 + drop.delay * 20}%`}
            x2={`${drop.x - 1}%`}
            y2={`${15 + drop.delay * 20}%`}
            stroke={state.particles.type === 'snow' ? 'white' : '#aaccee'}
            strokeWidth={state.particles.type === 'snow' ? '2' : '1'}
            opacity={state.particles.density * 0.6}
          />
        ))}
      </svg>

      {/* Frozen indicator */}
      {isFrozen && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#F5F7F2' }}>
          Signal low — paused
        </div>
      )}

      {/* State label */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl text-sm font-medium"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#F5F7F2' }}>
        {state.label}
        {breathRate !== null && (
          <span className="ml-2 opacity-70">{breathRate.toFixed(1)} bpm</span>
        )}
      </div>
    </div>
  );
};
