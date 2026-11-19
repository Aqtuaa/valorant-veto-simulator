import { VetoStep, VetoFormat, TeamActor } from '../types/veto';

/**
 * Team that chooses starting side on the final Decider map.
 * Set to 'A' by default as per requirements, but can easily be changed here to 'B'.
 */
export const DECIDER_SIDE_CHOOSER: TeamActor = 'A';

/**
 * Data-driven Veto Sequences.
 * 
 * Bo3 (7 maps):
 * 1. A bans
 * 2. B bans
 * 3. A picks, B chooses side
 * 4. B picks, A chooses side
 * 5. A bans
 * 6. B bans
 * 7. Decider (side chosen by DECIDER_SIDE_CHOOSER, default Team A)
 * 
 * Bo5 (7 maps):
 * 1. A bans
 * 2. B bans
 * 3. A picks, B chooses side
 * 4. B picks, A chooses side
 * 5. A picks, B chooses side
 * 6. B picks, A chooses side
 * 7. Decider (side chosen by DECIDER_SIDE_CHOOSER, default Team A)
 */
export const VETO_SEQUENCES: Record<Exclude<VetoFormat, 'bo1'>, VetoStep[]> = {
  bo3: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 1), Team B chooses side' },
    { actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 2), Team A chooses side' },
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    // 7th map becomes Decider (Map 3), side chosen by DECIDER_SIDE_CHOOSER
  ],
  bo5: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 1), Team B chooses side' },
    { actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 2), Team A chooses side' },
    { actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 3), Team B chooses side' },
    { actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 4), Team A chooses side' },
    // 7th map becomes Decider (Map 5), side chosen by DECIDER_SIDE_CHOOSER
  ],
};
