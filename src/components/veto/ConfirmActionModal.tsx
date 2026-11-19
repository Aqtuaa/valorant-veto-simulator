import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PendingAction } from '../../hooks/useVeto';
import { StartingSide } from '../../types/veto';
import { ShieldAlert, CheckCircle2, Crown, Swords, Shield } from 'lucide-react';

interface ConfirmActionModalProps {
  pendingAction: PendingAction | null;
  onSetChosenSide?: (side: StartingSide) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  pendingAction,
  onSetChosenSide,
  onConfirm,
  onCancel,
}) => {
  if (!pendingAction) return null;

  const isBan = pendingAction.action === 'ban';
  const isPick = pendingAction.action === 'pick';
  const isDecider = pendingAction.action === 'decider';

  const modalTitle = isBan
    ? 'CONFIRM MAP BAN'
    : isPick
    ? 'CONFIRM MAP PICK & SIDE'
    : 'DECIDER MAP - SELECT STARTING SIDE';

  return (
    <Modal
      isOpen={!!pendingAction}
      onClose={onCancel}
      title={modalTitle}
      subtitle={`Phase ${pendingAction.stepNumber} Decision`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Visual Confirmation Card */}
        <div
          className={`p-4 border text-center clip-val-card ${
            isBan
              ? 'bg-red-950/30 border-val-red/60 text-val-red'
              : isPick
              ? 'bg-teal-950/30 border-val-cyan/60 text-val-cyan'
              : 'bg-amber-950/30 border-val-gold/60 text-val-gold'
          }`}
        >
          <div className="flex justify-center mb-2">
            {isBan ? (
              <ShieldAlert className="w-8 h-8 text-val-red" />
            ) : isPick ? (
              <CheckCircle2 className="w-8 h-8 text-val-cyan" />
            ) : (
              <Crown className="w-8 h-8 text-val-gold" />
            )}
          </div>

          <p className="text-xs font-mono uppercase tracking-widest text-val-muted">
            {isDecider
              ? 'FINAL UNPLAYED MAP'
              : `TEAM ${pendingAction.actor} // ${pendingAction.teamName}`}
          </p>

          <h4 className="text-2xl font-display font-extrabold uppercase tracking-wider text-val-white mt-1">
            {isDecider ? `DECIDER: ${pendingAction.mapName}` : `${pendingAction.action.toUpperCase()} ${pendingAction.mapName}`}
          </h4>

          <p className="text-xs text-val-muted font-sans mt-2">
            {isBan
              ? 'This map will be permanently eliminated from the match series.'
              : isPick
              ? 'This map is locked into the series. The opposing squad now chooses starting side.'
              : 'The remaining map is locked as the Decider. Select starting side to finalize the veto.'}
          </p>
        </div>

        {/* Side Selection Section (for Pick and Decider) */}
        {(isPick || isDecider) && pendingAction.sideChooserTeamName && onSetChosenSide && (
          <div className="bg-val-dark/90 border border-val-border p-4 clip-val-tag space-y-3">
            <div className="flex items-center justify-between border-b border-val-border/40 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-val-white font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-val-cyan" />
                {pendingAction.sideChooserTeamName} Starting Side:
              </span>
              <span className="text-[10px] font-mono text-val-muted uppercase">
                {isDecider ? 'Decider Side Choice' : 'Opponent Side Choice'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Attack Button */}
              <button
                type="button"
                onClick={() => onSetChosenSide('Attack')}
                className={`p-3 border transition-all flex flex-col items-center justify-center gap-1.5 clip-val-button ${
                  pendingAction.chosenSide === 'Attack'
                    ? 'bg-val-red/20 border-val-red text-val-white shadow-val-red'
                    : 'bg-val-surface border-val-border text-val-muted hover:border-val-border-light hover:text-val-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Swords className={`w-4 h-4 ${pendingAction.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-muted'}`} />
                  <span className="font-tactical font-black text-lg tracking-wider uppercase">
                    ATTACK
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-tight uppercase">
                  Start on Offense
                </span>
              </button>

              {/* Defense Button */}
              <button
                type="button"
                onClick={() => onSetChosenSide('Defense')}
                className={`p-3 border transition-all flex flex-col items-center justify-center gap-1.5 clip-val-button ${
                  pendingAction.chosenSide === 'Defense'
                    ? 'bg-val-cyan/20 border-val-cyan text-val-white shadow-val-cyan'
                    : 'bg-val-surface border-val-border text-val-muted hover:border-val-border-light hover:text-val-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className={`w-4 h-4 ${pendingAction.chosenSide === 'Defense' ? 'text-val-cyan' : 'text-val-muted'}`} />
                  <span className="font-tactical font-black text-lg tracking-wider uppercase">
                    DEFENSE
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-tight uppercase">
                  Start on Defense
                </span>
              </button>
            </div>

            <p className="text-[11px] font-mono text-val-muted text-center pt-1">
              {pendingAction.sideChooserTeamName} starts on{' '}
              <strong className={pendingAction.chosenSide === 'Attack' ? 'text-val-red' : 'text-val-cyan'}>
                {pendingAction.chosenSide.toUpperCase()}
              </strong>
              , opponent starts on{' '}
              <strong className={pendingAction.chosenSide === 'Attack' ? 'text-val-cyan' : 'text-val-red'}>
                {pendingAction.chosenSide === 'Attack' ? 'DEFENSE' : 'ATTACK'}
              </strong>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          {!isDecider && (
            <Button variant="secondary" size="md" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant={isBan ? 'primary' : isPick ? 'cyan' : 'gold'}
            size="md"
            onClick={onConfirm}
            autoFocus
          >
            {isBan ? 'CONFIRM BAN' : isPick ? 'CONFIRM PICK & SIDE' : 'LOCK IN DECIDER'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
