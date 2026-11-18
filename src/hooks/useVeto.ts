import { useState, useCallback, useMemo } from 'react';
import {
  MapId,
  MapItem,
  TeamActor,
  MapVetoState,
  VetoHistoryEntry,
  ScreenState,
  VetoConfig,
  PlayedMapOrder,
} from '../types/veto';
import { MAP_POOL } from '../config/maps';
import { VETO_SEQUENCES } from '../config/vetoSequences';
import { playBanSound, playPickSound, playDeciderSound } from '../utils/sound';

export interface PendingAction {
  mapId: MapId;
  mapName: string;
  action: 'ban' | 'pick';
  actor: TeamActor;
  teamName: string;
  stepNumber: number;
}

export function useVeto() {
  const [screen, setScreen] = useState<ScreenState>('setup');

  const [config, setConfig] = useState<VetoConfig>({
    teamAName: '',
    teamBName: '',
    format: 'bo3',
    firstActor: 'A',
    useCoinFlip: false,
  });

  const [mapStates, setMapStates] = useState<Record<string, MapVetoState>>(() => {
    const initial: Record<string, MapVetoState> = {};
    MAP_POOL.forEach((map) => {
      initial[map.id] = { status: 'available' };
    });
    return initial;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [history, setHistory] = useState<VetoHistoryEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [playedMaps, setPlayedMaps] = useState<PlayedMapOrder[]>([]);

  // Helper to resolve which team corresponds to actor 'A' or 'B' in sequence
  const getTeamName = useCallback(
    (actor: TeamActor): string => {
      if (config.firstActor === 'A') {
        return actor === 'A' ? config.teamAName : config.teamBName;
      } else {
        return actor === 'A' ? config.teamBName : config.teamAName;
      }
    },
    [config.firstActor, config.teamAName, config.teamBName]
  );

  // Active veto sequence for current format
  const activeSequence = useMemo(() => {
    if (config.format === 'bo1') return [];
    return VETO_SEQUENCES[config.format] || [];
  }, [config.format]);

  // Current step in sequence
  const currentStep = useMemo(() => {
    if (currentStepIndex < activeSequence.length) {
      const step = activeSequence[currentStepIndex];
      return {
        ...step,
        teamName: getTeamName(step.actor),
        stepNumber: currentStepIndex + 1,
        totalSteps: activeSequence.length + 1, // +1 for the automatic decider
      };
    }
    return null;
  }, [activeSequence, currentStepIndex, getTeamName]);

  // Check if veto is complete
  const isComplete = useMemo(() => {
    if (config.format === 'bo1') {
      return playedMaps.length === 1;
    }
    return currentStepIndex >= activeSequence.length && playedMaps.length > 0;
  }, [config.format, currentStepIndex, activeSequence.length, playedMaps.length]);

  /**
   * Initialize and start the veto from Setup Screen
   */
  const startVeto = useCallback((newConfig: VetoConfig) => {
    setConfig(newConfig);
    // Reset all map states
    const resetStates: Record<string, MapVetoState> = {};
    MAP_POOL.forEach((m) => {
      resetStates[m.id] = { status: 'available' };
    });
    setMapStates(resetStates);
    setCurrentStepIndex(0);
    setHistory([]);
    setPendingAction(null);
    setPlayedMaps([]);

    if (newConfig.format === 'bo1') {
      setScreen('wheel');
    } else if (newConfig.useCoinFlip) {
      setScreen('coinflip');
    } else {
      setScreen('veto');
    }
  }, []);

  /**
   * Set the coin flip result and proceed to veto
   */
  const handleCoinFlipComplete = useCallback((winner: TeamActor) => {
    setConfig((prev) => ({ ...prev, firstActor: winner }));
    setScreen('veto');
  }, []);

  /**
   * User clicks a map card - opens confirmation modal
   */
  const requestMapAction = useCallback(
    (mapId: MapId) => {
      const state = mapStates[mapId];
      if (!state || state.status !== 'available' || !currentStep) return;

      const mapItem = MAP_POOL.find((m) => m.id === mapId);
      if (!mapItem) return;

      setPendingAction({
        mapId,
        mapName: mapItem.name,
        action: currentStep.action,
        actor: currentStep.actor,
        teamName: currentStep.teamName,
        stepNumber: currentStep.stepNumber,
      });
    },
    [mapStates, currentStep]
  );

  /**
   * Cancel pending action
   */
  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  /**
   * Confirm and execute the pending map ban/pick
   */
  const confirmPendingAction = useCallback(() => {
    if (!pendingAction || !currentStep) return;

    const { mapId, mapName, action, actor, teamName } = pendingAction;
    const mapItem = MAP_POOL.find((m) => m.id === mapId);
    if (!mapItem) return;

    // Play feedback sound
    if (action === 'ban') {
      playBanSound();
    } else {
      playPickSound();
    }

    const nextStepIndex = currentStepIndex + 1;

    // Update map status
    const updatedMapStates: Record<string, MapVetoState> = {
      ...mapStates,
      [mapId]: {
        status: action === 'ban' ? 'banned' : 'picked',
        actor,
        teamName,
        stepNumber: nextStepIndex,
        timestamp: Date.now(),
      },
    };

    const newHistoryEntry: VetoHistoryEntry = {
      stepIndex: currentStepIndex,
      actor,
      action,
      teamName,
      mapId,
      mapName,
    };
    const updatedHistory = [...history, newHistoryEntry];

    // If it was a pick, record in played maps order
    let updatedPlayedMaps = [...playedMaps];
    if (action === 'pick') {
      updatedPlayedMaps.push({
        gameNumber: updatedPlayedMaps.length + 1,
        map: mapItem,
        type: 'pick',
        teamName,
        actor,
      });
    }

    // Check if exactly 1 map remains available
    const availableMaps = MAP_POOL.filter((m) => updatedMapStates[m.id]?.status === 'available');

    if (availableMaps.length === 1) {
      // Automatic Decider!
      const deciderMap = availableMaps[0];
      updatedMapStates[deciderMap.id] = {
        status: 'decider',
        stepNumber: nextStepIndex + 1,
        timestamp: Date.now(),
      };

      updatedHistory.push({
        stepIndex: nextStepIndex,
        actor: 'A', // N/A
        action: 'decider',
        teamName: 'Decider',
        mapId: deciderMap.id,
        mapName: deciderMap.name,
      });

      updatedPlayedMaps.push({
        gameNumber: updatedPlayedMaps.length + 1,
        map: deciderMap,
        type: 'decider',
      });

      playDeciderSound();

      setMapStates(updatedMapStates);
      setHistory(updatedHistory);
      setPlayedMaps(updatedPlayedMaps);
      setCurrentStepIndex(nextStepIndex);
      setPendingAction(null);

      // Transition to result screen
      setTimeout(() => {
        setScreen('result');
      }, 900);
      return;
    }

    // Otherwise continue to next step
    setMapStates(updatedMapStates);
    setHistory(updatedHistory);
    setPlayedMaps(updatedPlayedMaps);
    setCurrentStepIndex(nextStepIndex);
    setPendingAction(null);
  }, [pendingAction, currentStep, currentStepIndex, mapStates, history, playedMaps]);

  /**
   * Undo the last action taken
   */
  const undoLastAction = useCallback(() => {
    if (history.length === 0) return;

    // If the last history item was an automatic decider, we pop both the decider and the action before it
    const lastItem = history[history.length - 1];
    let itemsToPop = 1;
    if (lastItem.action === 'decider' && history.length >= 2) {
      itemsToPop = 2;
    }

    const poppedHistory = history.slice(0, history.length - itemsToPop);
    const affectedItems = history.slice(history.length - itemsToPop);

    // Revert map states of affected items to 'available'
    const newMapStates = { ...mapStates };
    affectedItems.forEach((entry) => {
      newMapStates[entry.mapId] = { status: 'available' };
    });

    // Reconstruct playedMaps
    const affectedMapIds = new Set(affectedItems.map((e) => e.mapId));
    const newPlayedMaps = playedMaps
      .filter((p) => !affectedMapIds.has(p.map.id))
      .map((p, idx) => ({ ...p, gameNumber: idx + 1 }));

    // Revert step index to the stepIndex of the earliest popped item
    const earliestStepIndex = affectedItems[0].stepIndex;

    setMapStates(newMapStates);
    setHistory(poppedHistory);
    setPlayedMaps(newPlayedMaps);
    setCurrentStepIndex(earliestStepIndex);
    setPendingAction(null);
    setScreen('veto');
  }, [history, mapStates, playedMaps]);

  /**
   * Handle Bo1 spin wheel resolution
   */
  const handleWheelResult = useCallback(
    (winningMap: MapItem) => {
      // Mark selected map as decider/winner
      const updatedMapStates: Record<string, MapVetoState> = {};
      MAP_POOL.forEach((m) => {
        if (m.id === winningMap.id) {
          updatedMapStates[m.id] = { status: 'decider', stepNumber: 1, timestamp: Date.now() };
        } else {
          updatedMapStates[m.id] = { status: 'banned', stepNumber: 1, timestamp: Date.now() };
        }
      });

      setMapStates(updatedMapStates);
      setPlayedMaps([
        {
          gameNumber: 1,
          map: winningMap,
          type: 'decider',
        },
      ]);
      setHistory([
        {
          stepIndex: 0,
          actor: 'A',
          action: 'decider',
          teamName: 'Random Wheel Selection',
          mapId: winningMap.id,
          mapName: winningMap.name,
        },
      ]);

      setTimeout(() => {
        setScreen('result');
      }, 1200);
    },
    []
  );

  /**
   * Reset everything and return to Setup screen
   */
  const resetVeto = useCallback(() => {
    const initial: Record<string, MapVetoState> = {};
    MAP_POOL.forEach((map) => {
      initial[map.id] = { status: 'available' };
    });
    setMapStates(initial);
    setCurrentStepIndex(0);
    setHistory([]);
    setPendingAction(null);
    setPlayedMaps([]);
    setScreen('setup');
  }, []);

  return {
    screen,
    setScreen,
    config,
    mapStates,
    currentStep,
    currentStepIndex,
    history,
    pendingAction,
    playedMaps,
    isComplete,
    startVeto,
    handleCoinFlipComplete,
    requestMapAction,
    confirmPendingAction,
    cancelPendingAction,
    undoLastAction,
    handleWheelResult,
    resetVeto,
    getTeamName,
  };
}
