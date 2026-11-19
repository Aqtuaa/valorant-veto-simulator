import React from 'react';
import { motion } from 'framer-motion';
import { History, Undo2, Ban, CheckCircle, Crown, Swords, Shield } from 'lucide-react';
import { VetoHistoryEntry } from '../../types/veto';
import { Button } from '../common/Button';

interface VetoTimelineProps {
  history: VetoHistoryEntry[];
  onUndo: () => void;
  canUndo: boolean;
}

export const VetoTimeline: React.FC<VetoTimelineProps> = ({ history, onUndo, canUndo }) => {
  return (
    <div className="w-full bg-val-surface border border-val-border clip-val-card p-4 sm:p-5 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-val-border/50">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-val-cyan" />
          <h3 className="font-display font-bold text-base uppercase tracking-wider text-val-white">
            Veto Timeline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-val-muted uppercase px-1.5 py-0.5 bg-val-dark border border-val-border">
          {history.length} {history.length === 1 ? 'Action' : 'Actions'}
        </span>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px] max-h-[460px]">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-val-muted/60">
            <p className="text-xs font-mono uppercase tracking-wider">No actions recorded yet</p>
            <p className="text-[11px] font-sans mt-1">Select a map to begin the veto protocol.</p>
          </div>
        ) : (
          history.map((item, index) => {
            const isBan = item.action === 'ban';
            const isPick = item.action === 'pick';
            const isDecider = item.action === 'decider';
            const side = item.sideChoice;

            return (
              <motion.div
                key={`${item.mapId}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative p-2.5 border transition-all clip-val-tag ${
                  isBan
                    ? 'bg-val-dark/70 border-val-red/30'
                    : isPick
                    ? 'bg-val-dark/70 border-val-cyan/30'
                    : 'bg-val-dark/70 border-val-gold/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-xs font-mono font-bold text-val-muted w-4 flex-shrink-0 pt-0.5">
                      {index + 1}.
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-sm text-val-white uppercase truncate">
                          {item.mapName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-val-muted uppercase block truncate">
                        {isDecider ? 'Automatic Decider' : item.teamName}
                      </span>

                      {/* Starting Side Note */}
                      {side && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono">
                          <span className="text-val-muted">{side.chooserTeamName}:</span>
                          <span
                            className={`font-bold uppercase inline-flex items-center gap-0.5 ${
                              side.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'
                            }`}
                          >
                            {side.chosenSide === 'Attack' ? (
                              <Swords className="w-2.5 h-2.5" />
                            ) : (
                              <Shield className="w-2.5 h-2.5" />
                            )}
                            {side.chosenSide}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Badge */}
                  <div className="flex-shrink-0">
                    {isBan && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-tactical font-black uppercase tracking-wider px-2 py-0.5 bg-val-red/20 text-val-red border border-val-red/40 clip-val-tag">
                        <Ban className="w-2.5 h-2.5" />
                        BAN
                      </span>
                    )}
                    {isPick && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-tactical font-black uppercase tracking-wider px-2 py-0.5 bg-val-cyan/20 text-val-cyan border border-val-cyan/40 clip-val-tag">
                        <CheckCircle className="w-2.5 h-2.5" />
                        PICK
                      </span>
                    )}
                    {isDecider && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-tactical font-black uppercase tracking-wider px-2 py-0.5 bg-val-gold/20 text-val-gold border border-val-gold/40 clip-val-tag">
                        <Crown className="w-2.5 h-2.5" />
                        DECIDER
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Undo Button */}
      <div className="pt-4 mt-2 border-t border-val-border/50">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canUndo}
          onClick={onUndo}
          icon={<Undo2 className="w-4 h-4 text-val-muted" />}
          className="w-full"
        >
          UNDO LAST ACTION
        </Button>
      </div>
    </div>
  );
};
