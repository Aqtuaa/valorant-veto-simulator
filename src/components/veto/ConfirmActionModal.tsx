import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PendingAction } from '../../hooks/useVeto';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ConfirmActionModalProps {
  pendingAction: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  pendingAction,
  onConfirm,
  onCancel,
}) => {
  if (!pendingAction) return null;

  const isBan = pendingAction.action === 'ban';

  return (
    <Modal
      isOpen={!!pendingAction}
      onClose={onCancel}
      title={isBan ? 'CONFIRM MAP BAN' : 'CONFIRM MAP PICK'}
      subtitle={`Phase ${pendingAction.stepNumber} Decision`}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Visual Confirmation Card */}
        <div
          className={`p-4 border text-center clip-val-card ${
            isBan
              ? 'bg-red-950/30 border-val-red/60 text-val-red'
              : 'bg-teal-950/30 border-val-cyan/60 text-val-cyan'
          }`}
        >
          <div className="flex justify-center mb-2">
            {isBan ? (
              <ShieldAlert className="w-8 h-8 text-val-red" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-val-cyan" />
            )}
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-val-muted">
            TEAM {pendingAction.actor} // {pendingAction.teamName}
          </p>
          <h4 className="text-2xl font-display font-extrabold uppercase tracking-wider text-val-white mt-1">
            {pendingAction.action.toUpperCase()} {pendingAction.mapName}
          </h4>
          <p className="text-xs text-val-muted font-sans mt-2">
            {isBan
              ? 'This map will be permanently eliminated from the series.'
              : 'This map will be locked into the official match schedule.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isBan ? 'primary' : 'cyan'}
            size="md"
            onClick={onConfirm}
            autoFocus
          >
            {isBan ? 'CONFIRM BAN' : 'CONFIRM PICK'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
