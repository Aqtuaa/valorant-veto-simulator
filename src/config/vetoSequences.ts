import { VetoStep, VetoFormat } from '../types/veto';

/**
 * Data-driven Veto Sequences.
 * 
 * In both Bo3 and Bo5:
 * Team A acts first, followed by Team B alternating according to the defined steps.
 * When exactly 1 map remains, it is automatically marked as the "Decider" map.
 * 
 * For Bo1: The veto is resolved via the custom Spin Wheel.
 */
export const VETO_SEQUENCES: Record<Exclude<VetoFormat, 'bo1'>, VetoStep[]> = {
  bo3: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 1)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 2)' },
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    // 7th map becomes Decider (Map 3) automatically
  ],
  bo5: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 1)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 2)' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 3)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 4)' },
    // 7th map becomes Decider (Map 5) automatically
  ],
};
