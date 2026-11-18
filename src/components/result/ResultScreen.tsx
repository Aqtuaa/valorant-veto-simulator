import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Copy, Check, RotateCcw, Ban, Sparkles } from 'lucide-react';
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

  // Trigger celebratory confetti on mount
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
      // Fallback for older browsers
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

  // Find banned maps
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
            SCHEDULED MAP ORDER
          </span>
          <span className="text-xs font-mono tracking-wider text-val-muted uppercase">
            {playedMaps.length} MAPS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playedMaps.map((item, index) => {
            const isDecider = item.type === 'decider';
            return (
              <motion.div
                key={item.map.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden clip-val-card border-2 p-5 flex flex-col justify-between min-h-[160px] shadow-xl ${
                  isDecider
                    ? 'bg-gradient-to-br from-amber-950/40 via-val-surface to-val-dark border-val-gold shadow-val-gold'
                    : 'bg-gradient-to-br from-teal-950/40 via-val-surface to-val-dark border-val-cyan shadow-val-cyan'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`font-tactical font-black text-xs uppercase px-2.5 py-0.5 clip-val-tag tracking-wider ${
                      isDecider
                        ? 'bg-val-gold text-val-black'
                        : 'bg-val-cyan text-val-black'
                    }`}
                  >
                    MAP {item.gameNumber}
                  </span>
                  <span
                    className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                      isDecider ? 'text-val-gold' : 'text-val-cyan'
                    }`}
                  >
                    {isDecider ? 'DECIDER MAP' : `PICKED BY ${item.teamName}`}
                  </span>
                </div>

                {/* Map Name & Location */}
                <div>
                  <h3 className="font-display font-extrabold text-3xl uppercase tracking-wider text-val-white">
                    {item.map.name}
                  </h3>
                  {item.map.location && (
                    <p className="text-xs font-mono text-val-muted uppercase mt-0.5">
                      {item.map.location}
                    </p>
                  )}
                </div>

                {/* Corner Accent */}
                <div
                  className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-15 ${
                    isDecider ? 'bg-val-gold' : 'bg-val-cyan'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Banned Maps Summary (Bo3 & Bo5) */}
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
