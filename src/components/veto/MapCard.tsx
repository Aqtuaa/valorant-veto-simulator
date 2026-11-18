import React from 'react';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, Crown, Compass } from 'lucide-react';
import { MapItem, MapVetoState } from '../../types/veto';
import { playHoverSound, playTacticalClick } from '../../utils/sound';

interface MapCardProps {
  map: MapItem;
  state: MapVetoState;
  currentAction?: 'ban' | 'pick';
  currentTeamName?: string;
  gameNumber?: number; // Map 1, Map 2, etc. if picked/decider
  onClick?: () => void;
  disabled?: boolean;
}

export const MapCard: React.FC<MapCardProps> = ({
  map,
  state,
  currentAction = 'ban',
  gameNumber,
  onClick,
  disabled = false,
}) => {
  const isAvailable = state.status === 'available';
  const isBanned = state.status === 'banned';
  const isPicked = state.status === 'picked';
  const isDecider = state.status === 'decider';

  const handleClick = () => {
    if (!isAvailable || disabled) return;
    playTacticalClick();
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isAvailable || disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleMouseEnter = () => {
    if (isAvailable && !disabled) {
      playHoverSound();
    }
  };

  return (
    <motion.div
      layout
      tabIndex={isAvailable && !disabled ? 0 : -1}
      role="button"
      aria-label={`${map.name} - ${
        isAvailable
          ? `Available, click to ${currentAction}`
          : isBanned
          ? `Banned by ${state.teamName}`
          : isPicked
          ? `Picked by ${state.teamName} for Map ${gameNumber}`
          : 'Decider Map'
      }`}
      aria-disabled={!isAvailable || disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      whileHover={isAvailable && !disabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={isAvailable && !disabled ? { scale: 0.98 } : {}}
      className={`group relative overflow-hidden clip-val-card transition-all duration-200 select-none ${
        isAvailable && !disabled
          ? 'cursor-pointer border-2 border-val-border hover:border-val-white shadow-lg focus:outline-none focus:border-val-red'
          : isBanned
          ? 'cursor-not-allowed border-2 border-val-red/50 opacity-75'
          : isPicked
          ? 'cursor-default border-2 border-val-cyan shadow-val-cyan'
          : isDecider
          ? 'cursor-default border-2 border-val-gold shadow-val-gold'
          : 'border-2 border-val-border/40 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Background Graphic / Fallback Gradient */}
      <div
        className={`relative h-44 sm:h-52 w-full flex flex-col justify-between p-4 overflow-hidden ${
          isBanned ? 'grayscale contrast-125' : ''
        }`}
      >
        {map.imageUrl ? (
          <img
            src={map.imageUrl}
            alt={map.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity Tactical Vector Background */
          <div
            className={`absolute inset-0 bg-gradient-to-br ${map.theme.bgGradient} transition-transform duration-500 ${
              isAvailable ? 'group-hover:scale-105' : ''
            }`}
          >
            {/* Geometric Lines & Patterns */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id={`grid-${map.id}`}
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="#fff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${map.id})`} />
              <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>
            <div className={`absolute inset-0 bg-gradient-to-t ${map.theme.overlayGradient}`} />
          </div>
        )}

        {/* Tactical Scanline on hover (available only) */}
        {isAvailable && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-transparent via-white/5 to-transparent h-12 w-full animate-scanline" />
        )}

        {/* Top Header Row of Card */}
        <div className="relative z-10 flex items-start justify-between">
          <span className="text-[10px] font-mono tracking-widest text-val-white/80 uppercase px-2 py-0.5 bg-val-black/60 backdrop-blur-sm border border-white/10 clip-val-tag">
            {map.theme.iconSymbol}
          </span>

          {/* Game Number Badge (Map 1, Map 2, etc.) */}
          {gameNumber && (isPicked || isDecider) && (
            <span
              className={`text-xs font-tactical font-black uppercase tracking-wider px-2.5 py-0.5 clip-val-tag shadow-md ${
                isDecider ? 'bg-val-gold text-val-black' : 'bg-val-cyan text-val-black'
              }`}
            >
              MAP {gameNumber}
            </span>
          )}
        </div>

        {/* Center Overlay for Banned / Picked / Decider states */}
        {isBanned && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/75 backdrop-blur-[2px] p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-val-red/20 border-2 border-val-red flex items-center justify-center mb-1 text-val-red">
              <Ban className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-3xl tracking-widest text-val-red uppercase">
              BANNED
            </span>
            <span className="text-xs font-mono font-semibold text-val-white/90 uppercase tracking-wider mt-1 px-2 py-0.5 bg-val-dark/90 border border-val-border/60">
              BY {state.teamName || 'TEAM'}
            </span>
          </div>
        )}

        {isPicked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/60 backdrop-blur-[1px] p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-val-cyan/20 border-2 border-val-cyan flex items-center justify-center mb-1 text-val-cyan">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-3xl tracking-widest text-val-cyan uppercase">
              PICKED
            </span>
            <span className="text-xs font-mono font-semibold text-val-white uppercase tracking-wider mt-1 px-2 py-0.5 bg-val-dark/90 border border-val-border/60">
              BY {state.teamName}
            </span>
          </div>
        )}

        {isDecider && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/60 backdrop-blur-[1px] p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-val-gold/20 border-2 border-val-gold flex items-center justify-center mb-1 text-val-gold">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-3xl tracking-widest text-val-gold uppercase">
              DECIDER
            </span>
            <span className="text-xs font-mono font-semibold text-val-white uppercase tracking-wider mt-1 px-2 py-0.5 bg-val-dark/90 border border-val-border/60">
              REMAINING MAP
            </span>
          </div>
        )}

        {/* Hover Action Prompt (Available state) */}
        {isAvailable && !disabled && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-val-black/60 backdrop-blur-[1px] p-4 text-center">
            <span
              className={`font-tactical font-black text-2xl tracking-widest uppercase px-4 py-1 clip-val-button ${
                currentAction === 'ban'
                  ? 'bg-val-red text-val-white shadow-val-red'
                  : 'bg-val-cyan text-val-black shadow-val-cyan'
              }`}
            >
              CLICK TO {currentAction.toUpperCase()}
            </span>
          </div>
        )}

        {/* Bottom Info Bar of Card */}
        <div className="relative z-10">
          <h4 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wider text-val-white drop-shadow-md">
            {map.name}
          </h4>
          {map.location && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-val-white/70 uppercase">
              <Compass className="w-3 h-3 text-val-red" />
              <span>{map.location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
