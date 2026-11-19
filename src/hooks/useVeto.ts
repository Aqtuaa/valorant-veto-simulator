import { useState, useCallback, useMemo } from 'react';
import {
  MapId,
  MapItem,
  TeamActor,
  StartingSide,
  MapVetoState,
  VetoHistoryEntry,
  ScreenState,
  VetoConfig,
  PlayedMapOrder,
  SideChoiceInfo,
} from '../types/veto';
import { MAP_POOL } from '../config/maps';
import { VETO_SEQUENCES, DECIDER_SIDE_CHOOSER } from '../config/vetoSequences';
import { playBanSound, playPickSound, playDeciderSound } from '../utils/sound';

export interface PendingAction {
  mapId: MapId;
  mapName: string;
  action: 'ban' | 'pick' | 'decider';
  actor: TeamActor;
  teamName: string;
  stepNumber: number;
  sideChooserActor?: TeamActor;
  sideChooserTeamName?: string;
  chosenSide: StartingSide;
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

  // Helper to resolve which team name corresponds to actor 'A' or 'B'
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
      const sideChooserActor = step.sideChooser;
      return {
        ...step,
        teamName: getTeamName(step.actor),
        sideChooserActor,
        sideChooserTeamName: sideChooserActor ? getTeamName(sideChooserActor) : undefined,
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
   * Set coin flip result and proceed to veto
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
        sideChooserActor: currentStep.sideChooserActor,
        sideChooserTeamName: currentStep.sideChooserTeamName,
        chosenSide: 'Attack', // Default selection
      });
    },
    [mapStates, currentStep]
  );

  /**
   * Change chosen starting side in pending confirmation
   */
  const setChosenSide = useCallback((side: StartingSide) => {
    setPendingAction((prev) => (prev ? { ...prev, chosenSide: side } : null));
  }, []);

  /**
   * Cancel pending action
   */
  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  /**
   * Confirm and execute the pending map ban/pick/decider
   */
  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return;

    const { mapId, mapName, action, actor, teamName, chosenSide, sideChooserActor, sideChooserTeamName } =
      pendingAction;
    const mapItem = MAP_POOL.find((m) => m.id === mapId);
    if (!mapItem) return;

    // Handle DECIDER confirmation
    if (action === 'decider') {
      playDeciderSound();

      const opponentSide: StartingSide = chosenSide === 'Attack' ? 'Defense' : 'Attack';
      const sideChoice: SideChoiceInfo = {
        chooserActor: sideChooserActor || DECIDER_SIDE_CHOOSER,
        chooserTeamName: sideChooserTeamName || getTeamName(DECIDER_SIDE_CHOOSER),
        chosenSide,
        opponentTeamName: getTeamName(DECIDER_SIDE_CHOOSER === 'A' ? 'B' : 'A'),
        opponentSide,
      };

      const updatedMapStates: Record<string, MapVetoState> = {
        ...mapStates,
        [mapId]: {
          status: 'decider',
          stepNumber: currentStepIndex + 1,
          timestamp: Date.now(),
          sideChoice,
        },
      };

      const newHistoryEntry: VetoHistoryEntry = {
        stepIndex: currentStepIndex,
        actor: DECIDER_SIDE_CHOOSER,
        action: 'decider',
        teamName: 'Decider',
        mapId,
        mapName,
        sideChoice,
      };

      const updatedHistory = [...history, newHistoryEntry];
      const updatedPlayedMaps = [
        ...playedMaps,
        {
          gameNumber: playedMaps.length + 1,
          map: mapItem,
          type: 'decider' as const,
          sideChoice,
        },
      ];

      setMapStates(updatedMapStates);
      setHistory(updatedHistory);
      setPlayedMaps(updatedPlayedMaps);
      setCurrentStepIndex(currentStepIndex + 1);
      setPendingAction(null);

      setTimeout(() => {
        setScreen('result');
      }, 700);
      return;
    }

    // Handle BAN or PICK
    if (action === 'ban') {
      playBanSound();
    } else {
      playPickSound();
    }

    const nextStepIndex = currentStepIndex + 1;

    // Construct SideChoiceInfo for picks
    let sideChoice: SideChoiceInfo | undefined;
    if (action === 'pick' && sideChooserActor && sideChooserTeamName) {
      const opponentSide: StartingSide = chosenSide === 'Attack' ? 'Defense' : 'Attack';
      sideChoice = {
        chooserActor: sideChooserActor,
        chooserTeamName: sideChooserTeamName,
        chosenSide,
        opponentTeamName: teamName,
        opponentSide,
      };
    }

    const updatedMapStates: Record<string, MapVetoState> = {
      ...mapStates,
      [mapId]: {
        status: action === 'ban' ? 'banned' : 'picked',
        actor,
        teamName,
        stepNumber: nextStepIndex,
        timestamp: Date.now(),
        sideChoice,
      },
    };

    const newHistoryEntry: VetoHistoryEntry = {
      stepIndex: currentStepIndex,
      actor,
      action,
      teamName,
      mapId,
      mapName,
      sideChoice,
    };
    const updatedHistory = [...history, newHistoryEntry];

    let updatedPlayedMaps = [...playedMaps];
    if (action === 'pick') {
      updatedPlayedMaps.push({
        gameNumber: updatedPlayedMaps.length + 1,
        map: mapItem,
        type: 'pick',
        teamName,
        actor,
        sideChoice,
      });
    }

    // Check if exactly 1 map remains available
    const availableMaps = MAP_POOL.filter((m) => updatedMapStates[m.id]?.status === 'available');

    if (availableMaps.length === 1) {
      const deciderMap = availableMaps[0];
      const deciderSideChooser = DECIDER_SIDE_CHOOSER;
      const deciderSideChooserTeam = getTeamName(deciderSideChooser);

      // Prompt side selection for the decider map!
      setMapStates(updatedMapStates);
      setHistory(updatedHistory);
      setPlayedMaps(updatedPlayedMaps);
      setCurrentStepIndex(nextStepIndex);

      setPendingAction({
        mapId: deciderMap.id,
        mapName: deciderMap.name,
        action: 'decider',
        actor: deciderSideChooser,
        teamName: 'Decider',
        stepNumber: nextStepIndex + 1,
        sideChooserActor: deciderSideChooser,
        sideChooserTeamName: deciderSideChooserTeam,
        chosenSide: 'Attack',
      });
      return;
    }

    setMapStates(updatedMapStates);
    setHistory(updatedHistory);
    setPlayedMaps(updatedPlayedMaps);
    setCurrentStepIndex(nextStepIndex);
    setPendingAction(null);
  }, [pendingAction, currentStepIndex, mapStates, history, playedMaps, getTeamName]);

  /**
   * Undo the last action taken
   */
  const undoLastAction = useCallback(() => {
    // If pending action is open for decider, close it and revert step
    if (pendingAction && pendingAction.action === 'decider') {
      setPendingAction(null);
    }

    if (history.length === 0) return;

    // Check if last history item was decider
    const lastItem = history[history.length - 1];
    let itemsToPop = 1;
    if (lastItem.action === 'decider' && history.length >= 2) {
      itemsToPop = 2;
    }

    const poppedHistory = history.slice(0, history.length - itemsToPop);
    const affectedItems = history.slice(history.length - itemsToPop);

    const newMapStates = { ...mapStates };
    affectedItems.forEach((entry) => {
      newMapStates[entry.mapId] = { status: 'available' };
    });

    const affectedMapIds = new Set(affectedItems.map((e) => e.mapId));
    const newPlayedMaps = playedMaps
      .filter((p) => !affectedMapIds.has(p.map.id))
      .map((p, idx) => ({ ...p, gameNumber: idx + 1 }));

    const earliestStepIndex = affectedItems[0].stepIndex;

    setMapStates(newMapStates);
    setHistory(poppedHistory);
    setPlayedMaps(newPlayedMaps);
    setCurrentStepIndex(earliestStepIndex);
    setPendingAction(null);
    setScreen('veto');
  }, [pendingAction, history, mapStates, playedMaps]);

  /**
   * Handle Bo1 spin wheel resolution
   */
  const handleWheelResult = useCallback(
    (winningMap: MapItem) => {
      const deciderSideChooser = DECIDER_SIDE_CHOOSER;
      const deciderSideChooserTeam = getTeamName(deciderSideChooser);
      const opponentTeam = getTeamName(deciderSideChooser === 'A' ? 'B' : 'A');

      const sideChoice: SideChoiceInfo = {
        chooserActor: deciderSideChooser,
        chooserTeamName: deciderSideChooserTeam,
        chosenSide: 'Attack',
        opponentTeamName: opponentTeam,
        opponentSide: 'Defense',
      };

      const updatedMapStates: Record<string, MapVetoState> = {};
      MAP_POOL.forEach((m) => {
        if (m.id === winningMap.id) {
          updatedMapStates[m.id] = { status: 'decider', stepNumber: 1, timestamp: Date.now(), sideChoice };
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
          sideChoice,
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
          sideChoice,
        },
      ]);

      setTimeout(() => {
        setScreen('result');
      }, 1200);
    },
    [getTeamName]
  );

  /**
   * Reset everything to initial setup
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
    setChosenSide,
    confirmPendingAction,
    cancelPendingAction,
    undoLastAction,
    handleWheelResult,
    resetVeto,
    getTeamName,
  };
}
