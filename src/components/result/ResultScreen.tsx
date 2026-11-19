import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Copy, Check, RotateCcw, Ban, Sparkles, Swords, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  VetoConfig,
  PlayedMapOrder,
  VetoHistoryEntry,
  MapVetoState,
} from '../../types/veto';
import { MAP_POOL } from '../../config/maps';
import { formatVetoSummary } from '../../utils/formatters';
import { Button } from '../common/Button';

interface ResultScreenProps {
  config: VetoConfig;
  playedMaps: PlayedMapOrder[];
  history: VetoHistoryEntry[];
  mapStates: Record<string, MapVetoState>;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  config,
  playedMaps,
  history,
  mapStates,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4655', '#00F5D4', '#FFB800', '#ECE8E1'],
      });
    } catch {
      // Ignore if canvas-confetti fails in restricted environments
    }
  }, []);

  const handleCopy = async () => {
    const summary = formatVetoSummary(config, playedMaps, history);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const bannedMaps = MAP_POOL.filter((m) => mapStates[m.id]?.status === 'banned');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-val-surface border border-val-border text-val-gold text-xs font-mono uppercase tracking-widest mb-3 clip-val-tag">
          <Trophy className="w-4 h-4 text-val-gold" />
          VETO COMPLETE // OFFICIAL MATCH SCHEDULE
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-wider text-val-white">
          {config.teamAName} <span className="text-val-red">vs</span> {config.teamBName}
        </h2>
        <p className="text-sm text-val-muted font-sans mt-2">
          {config.format.toUpperCase()} Series • {playedMaps.length} {playedMaps.length === 1 ? 'Map' : 'Maps'} to be played
        </p>
      </div>

      {/* Final Played Map Order */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 border-b border-val-border/60 pb-2">
          <span className="text-xs font-mono tracking-widest uppercase text-val-white font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-val-cyan" />
            SCHEDULED MAP ORDER & STARTING SIDES
          </span>
          <span className="text-xs font-mono tracking-wider text-val-muted uppercase">
            {playedMaps.length} MAPS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playedMaps.map((item, index) => {
            const isDecider = item.type === 'decider';
            const side = item.sideChoice;

            return (
              <motion.div
                key={item.map.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden clip-val-card border-2 flex flex-col justify-between min-h-[260px] shadow-2xl ${
                  isDecider
                    ? 'border-val-gold shadow-val-gold'
                    : 'border-val-cyan shadow-val-cyan'
                }`}
              >
                {/* Background Map Image with Vignette Filter */}
                {item.map.imageUrl ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={item.map.imageUrl}
                      alt={item.map.name}
                      className="w-full h-full object-cover brightness-[0.75] contrast-125 saturate-110"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        isDecider
                          ? 'from-val-black via-val-black/80 to-amber-950/40'
                          : 'from-val-black via-val-black/80 to-teal-950/40'
                      }`}
                    />
                  </div>
                ) : (
                  <div className={`absolute inset-0 z-0 bg-gradient-to-br ${item.map.theme.bgGradient}`} />
                )}

                {/* Content Overlay */}
                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-tactical font-black text-xs uppercase px-2.5 py-0.5 clip-val-tag tracking-wider shadow-md ${
                        isDecider
                          ? 'bg-val-gold text-val-black'
                          : 'bg-val-cyan text-val-black'
                      }`}
                    >
                      MAP {item.gameNumber}
                    </span>
                    <span
                      className={`text-[11px] font-mono tracking-wider uppercase font-bold px-2 py-0.5 bg-val-black/80 border border-white/10 clip-val-tag ${
                        isDecider ? 'text-val-gold' : 'text-val-cyan'
                      }`}
                    >
                      {isDecider ? 'DECIDER MAP' : `PICKED BY ${item.teamName}`}
                    </span>
                  </div>

                  {/* Center Map Title */}
                  <div className="my-3">
                    <h3 className="font-display font-black text-3xl uppercase tracking-wider text-val-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {item.map.name}
                    </h3>
                    {item.map.location && (
                      <p className="text-xs font-mono text-val-white/80 uppercase mt-0.5">
                        {item.map.location}
                      </p>
                    )}
                  </div>

                  {/* Starting Sides Breakdown */}
                  {side && (
                    <div className="mt-3 pt-3 border-t border-val-border/60 bg-val-black/85 backdrop-blur-sm p-3 clip-val-tag space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-val-white font-semibold truncate max-w-[120px]">
                          {side.chooserTeamName}
                        </span>
                        <span
                          className={`font-bold flex items-center gap-1 uppercase ${
                            side.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'
                          }`}
                        >
                          {side.chosenSide === 'Attack' ? (
                            <Swords className="w-3.5 h-3.5" />
                          ) : (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                          {side.chosenSide}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-val-muted truncate max-w-[120px]">
                          {side.opponentTeamName}
                        </span>
                        <span
                          className={`font-bold flex items-center gap-1 uppercase ${
                            side.opponentSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'
                          }`}
                        >
                          {side.opponentSide === 'Attack' ? (
                            <Swords className="w-3.5 h-3.5" />
                          ) : (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                          {side.opponentSide}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Banned Maps Summary */}
      {bannedMaps.length > 0 && (
        <div className="mb-10 bg-val-surface/70 border border-val-border/60 p-6 clip-val-card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-val-border/40">
            <Ban className="w-4 h-4 text-val-red" />
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-val-white">
              Eliminated Maps ({bannedMaps.length})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bannedMaps.map((map) => {
              const state = mapStates[map.id];
              return (
                <div
                  key={map.id}
                  className="bg-val-dark/80 border border-val-red/30 p-2.5 clip-val-tag flex flex-col justify-between"
                >
                  <span className="font-display font-bold text-base uppercase text-val-white">
                    {map.name}
                  </span>
                  <span className="text-[10px] font-mono text-val-red uppercase mt-1">
                    Banned by {state?.teamName || 'Team'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-val-border/60">
        <Button
          variant="secondary"
          size="lg"
          onClick={onReset}
          icon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto min-w-[200px]"
        >
          START NEW VETO
        </Button>

        <Button
          variant="cyan"
          size="lg"
          onClick={handleCopy}
          icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          className="w-full sm:w-auto min-w-[220px]"
        >
          {copied ? 'COPIED TO CLIPBOARD!' : 'COPY RESULT'}
        </Button>
      </div>
    </div>
  );
};
