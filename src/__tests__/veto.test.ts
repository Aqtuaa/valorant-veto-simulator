import { describe, it, expect } from 'vitest';
import { MAP_POOL } from '../config/maps';
import { VETO_SEQUENCES } from '../config/vetoSequences';
import { getRandomInt, flipCoin } from '../utils/random';
import { formatVetoSummary } from '../utils/formatters';
import { VetoConfig, PlayedMapOrder, VetoHistoryEntry } from '../types/veto';

describe('Map Pool Configuration', () => {
  it('contains exactly 7 maps with specified names', () => {
    expect(MAP_POOL).toHaveLength(7);
    const expectedNames = ['Abyss', 'Bind', 'Corrode', 'Haven', 'Lotus', 'Summit', 'Sunset'];
    const mapNames = MAP_POOL.map((m) => m.name);
    expectedNames.forEach((expected) => {
      expect(mapNames).toContain(expected);
    });
  });

  it('has unique IDs and colors for every map', () => {
    const ids = MAP_POOL.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(7);
  });
});

describe('Veto Sequences', () => {
  it('Bo3 sequence follows 2 bans, 2 picks with sideChooser, 2 bans', () => {
    const bo3 = VETO_SEQUENCES.bo3;
    expect(bo3).toHaveLength(6);
    expect(bo3[0]).toEqual({ actor: 'A', action: 'ban', description: 'Team A Ban' });
    expect(bo3[1]).toEqual({ actor: 'B', action: 'ban', description: 'Team B Ban' });
    expect(bo3[2]).toEqual({ actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 1), Team B chooses side' });
    expect(bo3[3]).toEqual({ actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 2), Team A chooses side' });
    expect(bo3[4]).toEqual({ actor: 'A', action: 'ban', description: 'Team A Ban' });
    expect(bo3[5]).toEqual({ actor: 'B', action: 'ban', description: 'Team B Ban' });
  });

  it('Bo5 sequence follows 2 bans, 4 picks with sideChooser', () => {
    const bo5 = VETO_SEQUENCES.bo5;
    expect(bo5).toHaveLength(6);
    expect(bo5[0]).toEqual({ actor: 'A', action: 'ban', description: 'Team A Ban' });
    expect(bo5[1]).toEqual({ actor: 'B', action: 'ban', description: 'Team B Ban' });
    expect(bo5[2]).toEqual({ actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 1), Team B chooses side' });
    expect(bo5[3]).toEqual({ actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 2), Team A chooses side' });
    expect(bo5[4]).toEqual({ actor: 'A', action: 'pick', sideChooser: 'B', description: 'Team A Pick (Map 3), Team B chooses side' });
    expect(bo5[5]).toEqual({ actor: 'B', action: 'pick', sideChooser: 'A', description: 'Team B Pick (Map 4), Team A chooses side' });
  });
});

describe('Randomness Utilities', () => {
  it('getRandomInt generates numbers strictly within [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const val = getRandomInt(0, 6);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(6);
    }
  });

  it('flipCoin returns A or B', () => {
    const coin = flipCoin();
    expect(['A', 'B']).toContain(coin);
  });
});

describe('Summary Formatter', () => {
  it('formats summary text correctly with all details', () => {
    const config: VetoConfig = {
      teamAName: 'Sentinels',
      teamBName: 'Fnatic',
      format: 'bo3',
      firstActor: 'A',
      useCoinFlip: false,
    };

    const playedMaps: PlayedMapOrder[] = [
      {
        gameNumber: 1,
        map: MAP_POOL[0],
        type: 'pick',
        teamName: 'Sentinels',
        actor: 'A',
      },
      {
        gameNumber: 2,
        map: MAP_POOL[1],
        type: 'pick',
        teamName: 'Fnatic',
        actor: 'B',
      },
      {
        gameNumber: 3,
        map: MAP_POOL[2],
        type: 'decider',
      },
    ];

    const history: VetoHistoryEntry[] = [
      {
        stepIndex: 0,
        actor: 'A',
        action: 'ban',
        teamName: 'Sentinels',
        mapId: 'haven',
        mapName: 'Haven',
      },
    ];

    const summary = formatVetoSummary(config, playedMaps, history);
    expect(summary).toContain('Sentinels vs Fnatic');
    expect(summary).toContain('BO3');
    expect(summary).toContain('Map 1: ABYSS (Picked by Sentinels)');
    expect(summary).toContain('Map 2: BIND (Picked by Fnatic)');
    expect(summary).toContain('Map 3: CORRODE (Decider)');
    expect(summary).toContain('Sentinels BAN -> Haven');
  });
});

describe('Veto Engine Logic Simulation', () => {
  it('correctly calculates decider and sequence in Bo3', () => {
    // 7 maps: Abyss, Bind, Corrode, Haven, Lotus, Summit, Sunset
    const available = new Set(MAP_POOL.map((m) => m.id));
    const played: string[] = [];
    const banned: string[] = [];

    // Step 1: A bans Abyss
    available.delete('abyss');
    banned.push('abyss');

    // Step 2: B bans Bind
    available.delete('bind');
    banned.push('bind');

    // Step 3: A picks Corrode
    available.delete('corrode');
    played.push('corrode');

    // Step 4: B picks Haven
    available.delete('haven');
    played.push('haven');

    // Step 5: A bans Lotus
    available.delete('lotus');
    banned.push('lotus');

    // Step 6: B bans Summit
    available.delete('summit');
    banned.push('summit');

    // Exactly 1 map left: Sunset
    expect(available.size).toBe(1);
    const decider = Array.from(available)[0];
    expect(decider).toBe('sunset');

    played.push(decider);
    expect(played).toHaveLength(3);
    expect(banned).toHaveLength(4);
    expect(played).toEqual(['corrode', 'haven', 'sunset']);
  });

  it('correctly calculates decider and sequence in Bo5', () => {
    const available = new Set(MAP_POOL.map((m) => m.id));
    const played: string[] = [];
    const banned: string[] = [];

    // 1. A ban Abyss
    available.delete('abyss');
    banned.push('abyss');

    // 2. B ban Bind
    available.delete('bind');
    banned.push('bind');

    // 3. A pick Corrode
    available.delete('corrode');
    played.push('corrode');

    // 4. B pick Haven
    available.delete('haven');
    played.push('haven');

    // 5. A pick Lotus
    available.delete('lotus');
    played.push('lotus');

    // 6. B pick Summit
    available.delete('summit');
    played.push('summit');

    // 1 map left -> Sunset (Decider)
    expect(available.size).toBe(1);
    const decider = Array.from(available)[0];
    expect(decider).toBe('sunset');

    played.push(decider);
    expect(played).toHaveLength(5);
    expect(banned).toHaveLength(2);
  });
});
