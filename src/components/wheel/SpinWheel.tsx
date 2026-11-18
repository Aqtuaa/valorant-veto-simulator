import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Disc, Sparkles } from 'lucide-react';
import { MapItem } from '../../types/veto';
import { MAP_POOL } from '../../config/maps';
import { getRandomInt } from '../../utils/random';
import { playWheelTick, playPickSound } from '../../utils/sound';
import { Button } from '../common/Button';

interface SpinWheelProps {
  teamAName: string;
  teamBName: string;
  onComplete: (winningMap: MapItem) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  teamAName,
  teamBName,
  onComplete,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);

  const currentRotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef<number>(-1);

  const numSegments = MAP_POOL.length; // 7
  const segmentAngle = 360 / numSegments; // ~51.42857 deg

  // Color palette for segments
  const segmentColors = [
    '#1e88e5', // Abyss (Blue)
    '#fb8c00', // Bind (Amber)
    '#00e676', // Corrode (Green)
    '#ff5252', // Haven (Red)
    '#26c6da', // Lotus (Cyan)
    '#80d8ff', // Summit (Light Sky)
    '#e040fb', // Sunset (Purple)
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedMap(null);

    // Uniformly pick winning slice index (0 to 6)
    const winningIndex = getRandomInt(0, numSegments - 1);
    const winningMap = MAP_POOL[winningIndex];

    // Pointer is located at TOP (270 degrees in standard math or 0 degrees top in SVG)
    // To land winningIndex under the top pointer (angle = 0):
    // Slice center angle = (winningIndex + 0.5) * segmentAngle
    // Rotation = TotalSpins * 360 + (360 - Slice center angle)
    const extraSpins = 6 + Math.floor(Math.random() * 3); // 6 to 8 full revolutions
    const sliceCenter = (winningIndex + 0.5) * segmentAngle;
    const targetAngle =
      currentRotationRef.current +
      extraSpins * 360 +
      ((360 - (sliceCenter % 360) + (Math.random() * (segmentAngle * 0.6) - segmentAngle * 0.3)) % 360);

    const startAngle = currentRotationRef.current;
    const duration = 4800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease-out deceleration curve
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const angle = startAngle + (targetAngle - startAngle) * easeOut;

      currentRotationRef.current = angle;
      setCurrentRotation(angle);

      // Tick sound calculation
      const normalizedAngle = (angle % 360 + 360) % 360;
      const currentSegment = Math.floor(normalizedAngle / segmentAngle);
      if (currentSegment !== lastTickSegmentRef.current) {
        playWheelTick();
        lastTickSegmentRef.current = currentSegment;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setSelectedMap(winningMap);
        playPickSound();

        // Notify parent after celebration pause
        setTimeout(() => {
          onComplete(winningMap);
        }, 1500);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-val-surface border border-val-border text-val-cyan text-xs font-mono uppercase tracking-widest mb-2 clip-val-tag">
          <Disc className="w-3.5 h-3.5" />
          BO1 SUDDEN DEATH WHEEL
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-wider text-val-white">
          Map Selector Wheel
        </h2>
        <p className="text-xs sm:text-sm text-val-muted font-sans mt-1">
          {teamAName} vs {teamBName} // Spinning 7 Maps with Uniform Probability
        </p>
      </div>

      {/* Wheel Stage Container */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 my-4 flex items-center justify-center">
        {/* Top Pointer Needle */}
        <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-val-red drop-shadow-[0_2px_8px_rgba(255,70,85,0.8)]" />
          <div className="w-2.5 h-2.5 bg-val-white rounded-full -mt-5" />
        </div>

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-val-border shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-val-dark/40" />

        {/* The SVG Wheel */}
        <svg
          viewBox="-160 -160 320 320"
          className="w-full h-full select-none"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transformOrigin: '50% 50%',
          }}
        >
          {MAP_POOL.map((map, i) => {
            const startAngle = (i * segmentAngle * Math.PI) / 180;
            const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
            const radius = 150;

            const x1 = radius * Math.cos(startAngle);
            const y1 = radius * Math.sin(startAngle);
            const x2 = radius * Math.cos(endAngle);
            const y2 = radius * Math.sin(endAngle);

            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

            // Text placement along segment bisector
            const midAngle = ((i + 0.5) * segmentAngle * Math.PI) / 180;
            const textRadius = 100;
            const textX = textRadius * Math.cos(midAngle);
            const textY = textRadius * Math.sin(midAngle);
            const textRotation = (i + 0.5) * segmentAngle + 90;

            return (
              <g key={map.id}>
                {/* Wedge slice */}
                <path
                  d={pathData}
                  fill={segmentColors[i % segmentColors.length]}
                  stroke="#0f1923"
                  strokeWidth="2.5"
                  className="transition-colors"
                />

                {/* Map label on slice */}
                <text
                  x={textX}
                  y={textY}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="'Rajdhani', sans-serif"
                  letterSpacing="1.5px"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  className="select-none uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                >
                  {map.name}
                </text>
              </g>
            );
          })}

          {/* Center Hub */}
          <circle cx="0" cy="0" r="30" fill="#0f1923" stroke="#323f4b" strokeWidth="4" />
          <circle cx="0" cy="0" r="14" fill="#FF4655" />
          <circle cx="0" cy="0" r="4" fill="#ECE8E1" />
        </svg>
      </div>

      {/* Result Display / Spin CTA */}
      <div className="mt-8 flex flex-col items-center min-h-[90px]">
        {selectedMap ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-val-cyan font-bold block mb-1">
              DECIDER MAP SELECTED
            </span>
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-val-surface border-2 border-val-cyan text-val-white font-display font-black text-2xl uppercase tracking-wider clip-val-button shadow-val-cyan">
              <Sparkles className="w-5 h-5 text-val-cyan" />
              {selectedMap.name}
            </div>
            <p className="text-xs text-val-muted font-mono mt-2">
              Preparing match result summary...
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="cyan"
              size="lg"
              disabled={spinning}
              onClick={spin}
              className="min-w-[240px]"
            >
              {spinning ? 'SPINNING...' : 'SPIN FOR MAP'}
            </Button>
            <p className="text-xs font-mono text-val-muted">
              {spinning ? 'Calculating trajectory...' : 'Uniform 1-in-7 cryptographic randomization'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
