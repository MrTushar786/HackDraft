import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = [
  '#00ff88', // Accent Green
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#0ea5e9', // Sky Blue
  '#f59e0b', // Amber
  '#00eeff', // Cyan
  '#ff4488', // Rose
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface LightConfig {
  id: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  waypoints: { left: string; top: string }[];
}

const LIGHT_COUNT = 9;

function buildLight(i: number): LightConfig {
  // Spread waypoints across the full viewport
  const waypoints = Array.from({ length: 5 }, () => ({
    left: `${rand(5, 95)}vw`,
    top: `${rand(5, 90)}vh`,
  }));
  return {
    id: i,
    color: COLORS[i % COLORS.length],
    size: Math.floor(rand(280, 480)),
    // Shorter duration: 15-25s so cycles aren't too slow
    duration: rand(15, 25),
    // Evenly stagger so there are ALWAYS lights visible from frame 1
    // Each light starts (total_range / count) * i seconds apart
    delay: (8 / LIGHT_COUNT) * i,
    waypoints,
  };
}

export const MovingLights = () => {
  const lights = useMemo<LightConfig[]>(
    () => Array.from({ length: LIGHT_COUNT }, (_, i) => buildLight(i)),
    []
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {lights.map((light) => (
        <motion.div
          key={light.id}
          // Start visible immediately at first waypoint
          initial={{
            left: light.waypoints[0].left,
            top: light.waypoints[0].top,
            opacity: 0.45,
            scale: 0.85,
          }}
          animate={{
            left: light.waypoints.map((w) => w.left),
            top: light.waypoints.map((w) => w.top),
            // Never fade to 0 — stays between 0.25 and 0.65 at all times
            opacity: [0.45, 0.65, 0.40, 0.60, 0.30, 0.45],
            scale:   [0.85, 1.10, 0.80, 1.15, 0.90, 0.85],
          }}
          transition={{
            duration: light.duration,
            repeat: Infinity,
            delay: light.delay,
            ease: 'easeInOut',
            // mirror = smooth reversal, no jump cut at end
            repeatType: 'mirror',
          }}
          style={{
            position: 'absolute',
            width: light.size,
            height: light.size,
            borderRadius: '50%',
            // Centre the blob on its waypoint
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${light.color}65 0%, ${light.color}25 45%, transparent 75%)`,
            filter: 'blur(85px)',
            mixBlendMode: 'screen',
            willChange: 'left, top, opacity, transform',
          }}
        />
      ))}
    </div>
  );
};
