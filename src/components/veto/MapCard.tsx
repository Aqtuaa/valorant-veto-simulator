import React from 'react';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, Crown, Compass, Swords, Shield } from 'lucide-react';
import { MapItem, MapVetoState } from '../../types/veto';
import { playHoverSound, playTacticalClick } from '../../utils/sound';

interface MapCardProps {
  map: MapItem;
  state: MapVetoState;
  currentAction?: 'ban' | 'pick';
  currentTeamName?: string;
  gameNumber?: number;
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
  const sideChoice = state.sideChoice;

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
          ? 'cursor-not-allowed border-2 border-val-red/50 opacity-80'
          : isPicked
          ? 'cursor-default border-2 border-val-cyan shadow-val-cyan'
          : isDecider
          ? 'cursor-default border-2 border-val-gold shadow-val-gold'
          : 'border-2 border-val-border/40 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Background Graphic / Map Photo with Custom Filters */}
      <div className="relative h-48 sm:h-56 w-full flex flex-col justify-between p-4 overflow-hidden bg-val-black">
        {map.imageUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={map.imageUrl}
              alt={map.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isAvailable
                  ? 'brightness-90 contrast-110 saturate-105 group-hover:scale-110 group-hover:brightness-105 group-hover:contrast-120'
                  : isBanned
                  ? 'grayscale contrast-150 brightness-[0.35]'
                  : isPicked
                  ? 'contrast-125 brightness-95 saturate-110'
                  : 'contrast-120 brightness-100 saturate-115'
              }`}
            />
            {/* Dark Tactical Vignette Overlay for readability */}
            <div
              className={`absolute inset-0 transition-colors duration-300 ${
                isBanned
                  ? 'bg-gradient-to-t from-black/95 via-red-950/40 to-black/80'
                  : isPicked
                  ? 'bg-gradient-to-t from-black/95 via-teal-950/40 to-black/50'
                  : isDecider
                  ? 'bg-gradient-to-t from-black/95 via-amber-950/40 to-black/50'
                  : 'bg-gradient-to-t from-black/90 via-black/40 to-black/60 group-hover:from-black/85 group-hover:via-black/30'
              }`}
            />
          </div>
        ) : (
          /* Fallback Tactical Gradient */
          <div className={`absolute inset-0 bg-gradient-to-br ${map.theme.bgGradient}`}>
            <div className={`absolute inset-0 bg-gradient-to-t ${map.theme.overlayGradient}`} />
          </div>
        )}

        {/* Scanline on hover (available state) */}
        {isAvailable && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-transparent via-white/10 to-transparent h-12 w-full animate-scanline" />
        )}

        {/* Top Header Row of Card */}
        <div className="relative z-10 flex items-start justify-between">
          <span className="text-[10px] font-mono tracking-widest text-val-white/90 uppercase px-2 py-0.5 bg-val-black/75 backdrop-blur-md border border-white/20 clip-val-tag">
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

        {/* Center Overlay for Banned state */}
        {isBanned && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/75 backdrop-blur-[2px] p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-val-red/25 border-2 border-val-red flex items-center justify-center mb-1 text-val-red shadow-val-red">
              <Ban className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-3xl tracking-widest text-val-red uppercase">
              BANNED
            </span>
            <span className="text-xs font-mono font-semibold text-val-white/90 uppercase tracking-wider mt-1 px-2.5 py-0.5 bg-val-dark/90 border border-val-border/60">
              BY {state.teamName || 'TEAM'}
            </span>
          </div>
        )}

        {/* Center Overlay for Picked state */}
        {isPicked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/60 backdrop-blur-[1px] p-4 text-center">
            <div className="w-11 h-11 rounded-full bg-val-cyan/25 border-2 border-val-cyan flex items-center justify-center mb-1 text-val-cyan shadow-val-cyan">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-2xl tracking-widest text-val-cyan uppercase">
              PICKED BY {state.teamName}
            </span>

            {/* Starting Side Badge */}
            {sideChoice && (
              <div className="mt-2 flex items-center gap-2 px-2.5 py-1 bg-val-black/85 border border-val-border text-[11px] font-mono clip-val-tag">
                <span className="text-val-muted">{sideChoice.chooserTeamName}:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    sideChoice.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'
                  }`}
                >
                  {sideChoice.chosenSide === 'Attack' ? (
                    <Swords className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  {sideChoice.chosenSide.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Center Overlay for Decider state */}
        {isDecider && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-val-black/60 backdrop-blur-[1px] p-4 text-center">
            <div className="w-11 h-11 rounded-full bg-val-gold/25 border-2 border-val-gold flex items-center justify-center mb-1 text-val-gold shadow-val-gold">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-tactical font-black text-2xl tracking-widest text-val-gold uppercase">
              DECIDER MAP
            </span>

            {/* Starting Side Badge */}
            {sideChoice && (
              <div className="mt-2 flex items-center gap-2 px-2.5 py-1 bg-val-black/85 border border-val-border text-[11px] font-mono clip-val-tag">
                <span className="text-val-muted">{sideChoice.chooserTeamName}:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    sideChoice.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'
                  }`}
                >
                  {sideChoice.chosenSide === 'Attack' ? (
                    <Swords className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  {sideChoice.chosenSide.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hover Action Prompt (Available state) */}
        {isAvailable && !disabled && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-val-black/70 backdrop-blur-[1px] p-4 text-center">
            <span
              className={`font-tactical font-black text-2xl tracking-widest uppercase px-5 py-1.5 clip-val-button ${
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
        <div className="relative z-10 drop-shadow-md">
          <h4 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-val-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {map.name}
          </h4>
          {map.location && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-val-white/80 uppercase">
              <Compass className="w-3.5 h-3.5 text-val-red" />
              <span>{map.location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
