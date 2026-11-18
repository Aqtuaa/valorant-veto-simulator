import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair } from 'lucide-react';
import { TeamActor } from '../../types/veto';

interface TurnIndicatorProps {
  actor: TeamActor;
  action: 'ban' | 'pick';
  teamName: string;
  stepNumber: number;
  totalSteps: number;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  actor,
  action,
  teamName,
  stepNumber,
  totalSteps,
}) => {
  const isBan = action === 'ban';

  return (
    <div className="w-full relative overflow-hidden bg-val-surface border border-val-border clip-val-card p-4 sm:p-5 shadow-xl mb-6">
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${
          isBan ? 'bg-val-red' : 'bg-val-cyan'
        }`}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Step Counter */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-val-dark border border-val-border flex items-center justify-center font-tactical font-black text-xl text-val-white clip-val-tag">
            {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-val-muted block">
              PHASE {stepNumber} OF {totalSteps}
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-val-white">
              {isBan ? 'ELIMINATION PHASE' : 'SELECTION PHASE'}
            </span>
          </div>
        </div>

        {/* Dynamic Center Banner with Turn Info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${actor}-${action}-${stepNumber}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 text-center sm:text-left"
          >
            <div
              className={`p-2 rounded-full hidden sm:flex items-center justify-center ${
                isBan
                  ? 'bg-val-red/20 text-val-red border border-val-red/50'
                  : 'bg-val-cyan/20 text-val-cyan border border-val-cyan/50'
              }`}
            >
              {isBan ? <Shield className="w-5 h-5" /> : <Crosshair className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`text-[11px] font-mono uppercase px-2 py-0.5 clip-val-tag font-bold ${
                    actor === 'A'
                      ? 'bg-red-950/80 text-val-red border border-red-800'
                      : 'bg-teal-950/80 text-val-cyan border border-teal-800'
                  }`}
                >
                  TEAM {actor}
                </span>
                <span className="font-display font-black text-xl sm:text-2xl text-val-white uppercase tracking-wider">
                  {teamName}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Call to Action Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-val-muted uppercase tracking-wider hidden md:inline">
            REQUIRED ACTION:
          </span>
          <span
            className={`font-tactical font-black text-xl uppercase tracking-widest px-4 py-1.5 clip-val-button shadow-md ${
              isBan
                ? 'bg-val-red text-val-white shadow-val-red'
                : 'bg-val-cyan text-val-black shadow-val-cyan'
            }`}
          >
            {isBan ? 'BAN MAP' : 'PICK MAP'}
          </span>
        </div>
      </div>
    </div>
  );
};
