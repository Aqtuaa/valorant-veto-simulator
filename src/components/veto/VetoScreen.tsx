import React from 'react';
import { MAP_POOL } from '../../config/maps';
import {
  VetoConfig,
  MapVetoState,
  VetoHistoryEntry,
  PlayedMapOrder,
  StartingSide,
} from '../../types/veto';
import { PendingAction } from '../../hooks/useVeto';
import { TurnIndicator } from './TurnIndicator';
import { MapCard } from './MapCard';
import { VetoTimeline } from './VetoTimeline';
import { ConfirmActionModal } from './ConfirmActionModal';

interface VetoScreenProps {
  config: VetoConfig;
  mapStates: Record<string, MapVetoState>;
  currentStep: {
    actor: 'A' | 'B';
    action: 'ban' | 'pick';
    teamName: string;
    sideChooserActor?: 'A' | 'B';
    sideChooserTeamName?: string;
    stepNumber: number;
    totalSteps: number;
  } | null;
  history: VetoHistoryEntry[];
  playedMaps: PlayedMapOrder[];
  pendingAction: PendingAction | null;
  onRequestMapAction: (mapId: string) => void;
  onSetChosenSide: (side: StartingSide) => void;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  onUndo: () => void;
}

export const VetoScreen: React.FC<VetoScreenProps> = ({
  config,
  mapStates,
  currentStep,
  history,
  playedMaps,
  pendingAction,
  onRequestMapAction,
  onSetChosenSide,
  onConfirmAction,
  onCancelAction,
  onUndo,
}) => {
  const getGameNumber = (mapId: string) => {
    const played = playedMaps.find((p) => p.map.id === mapId);
    return played ? played.gameNumber : undefined;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Turn Indicator */}
      {currentStep && (
        <TurnIndicator
          actor={currentStep.actor}
          action={currentStep.action}
          teamName={currentStep.teamName}
          stepNumber={currentStep.stepNumber}
          totalSteps={currentStep.totalSteps}
        />
      )}

      {/* Main Grid & Timeline Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Map Cards Grid (3 columns on large screens) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono tracking-widest uppercase text-val-muted">
              ACTIVE MAP POOL ({MAP_POOL.length} MAPS)
            </span>
            <span className="text-xs font-mono tracking-widest uppercase text-val-muted">
              FORMAT: <span className="text-val-white font-bold">{config.format.toUpperCase()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {MAP_POOL.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                state={mapStates[map.id] || { status: 'available' }}
                currentAction={currentStep?.action}
                currentTeamName={currentStep?.teamName}
                gameNumber={getGameNumber(map.id)}
                onClick={() => onRequestMapAction(map.id)}
                disabled={!currentStep && pendingAction?.action !== 'decider'}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Timeline */}
        <div className="lg:col-span-1 sticky top-6">
          <VetoTimeline
            history={history}
            onUndo={onUndo}
            canUndo={history.length > 0}
          />
        </div>
      </div>

      {/* Confirmation Modal to prevent misclicks & select starting sides */}
      <ConfirmActionModal
        pendingAction={pendingAction}
        onSetChosenSide={onSetChosenSide}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
      />
    </div>
  );
};
