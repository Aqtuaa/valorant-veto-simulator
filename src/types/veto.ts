export type MapId = 'abyss' | 'bind' | 'corrode' | 'haven' | 'lotus' | 'summit' | 'sunset' | string;

export interface MapItem {
  id: MapId;
  name: string;
  location?: string;
  imageUrl?: string;
  accentColor: string;
  secondaryColor: string;
  theme: {
    bgGradient: string;
    overlayGradient: string;
    iconSymbol: string;
  };
}

export type VetoFormat = 'bo1' | 'bo3' | 'bo5';

export type TeamActor = 'A' | 'B';

export type StartingSide = 'Attack' | 'Defense';

export type VetoActionType = 'ban' | 'pick' | 'decider';

export interface VetoStep {
  actor: TeamActor;
  action: 'ban' | 'pick';
  sideChooser?: TeamActor;
  description?: string;
}

export type MapStateStatus = 'available' | 'banned' | 'picked' | 'decider';

export interface SideChoiceInfo {
  chooserActor: TeamActor;
  chooserTeamName: string;
  chosenSide: StartingSide;
  opponentTeamName: string;
  opponentSide: StartingSide;
}

export interface MapVetoState {
  status: MapStateStatus;
  actor?: TeamActor;
  teamName?: string;
  stepNumber?: number;
  timestamp?: number;
  sideChoice?: SideChoiceInfo;
}

export interface VetoHistoryEntry {
  stepIndex: number;
  actor: TeamActor;
  action: 'ban' | 'pick' | 'decider';
  teamName: string;
  mapId: MapId;
  mapName: string;
  sideChoice?: SideChoiceInfo;
}

export type ScreenState = 'setup' | 'coinflip' | 'veto' | 'wheel' | 'result';

export interface VetoConfig {
  teamAName: string;
  teamBName: string;
  format: VetoFormat;
  firstActor: TeamActor;
  useCoinFlip: boolean;
}

export interface PlayedMapOrder {
  gameNumber: number;
  map: MapItem;
  type: 'pick' | 'decider';
  teamName?: string;
  actor?: TeamActor;
  sideChoice?: SideChoiceInfo;
}
