import React, { useState } from 'react';
import { Swords, ShieldAlert, Coins, Shuffle } from 'lucide-react';
import { VetoConfig, VetoFormat, TeamActor } from '../../types/veto';
import { Button } from '../common/Button';

interface SetupScreenProps {
  onStart: (config: VetoConfig) => void;
}

const PRESET_TEAMS = [
  'Sentinels',
  'Fnatic',
  'Paper Rex',
  'EDward Gaming',
  'Gen.G',
  'Team Heretics',
  '100 Thieves',
  'LOUD',
];

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [teamA, setTeamA] = useState('Sentinels');
  const [teamB, setTeamB] = useState('Fnatic');
  const [format, setFormat] = useState<VetoFormat>('bo3');
  const [useCoinFlip, setUseCoinFlip] = useState(true);
  const [manualFirstActor, setManualFirstActor] = useState<TeamActor>('A');
  const [touched, setTouched] = useState({ teamA: false, teamB: false });

  // Validation
  const teamATrimmed = teamA.trim();
  const teamBTrimmed = teamB.trim();

  const teamAError =
    touched.teamA && !teamATrimmed
      ? 'Team A name is required'
      : teamATrimmed.length > 20
      ? 'Max 20 characters'
      : '';

  const teamBError =
    touched.teamB && !teamBTrimmed
      ? 'Team B name is required'
      : teamBTrimmed.length > 20
      ? 'Max 20 characters'
      : '';

  const identicalError =
    teamATrimmed && teamBTrimmed && teamATrimmed.toLowerCase() === teamBTrimmed.toLowerCase()
      ? 'Team names must not be identical'
      : '';

  const isValid =
    teamATrimmed.length > 0 &&
    teamATrimmed.length <= 20 &&
    teamBTrimmed.length > 0 &&
    teamBTrimmed.length <= 20 &&
    teamATrimmed.toLowerCase() !== teamBTrimmed.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ teamA: true, teamB: true });
    if (!isValid) return;

    onStart({
      teamAName: teamATrimmed,
      teamBName: teamBTrimmed,
      format,
      firstActor: manualFirstActor,
      useCoinFlip: format === 'bo1' ? false : useCoinFlip,
    });
  };

  const handleRandomizePresets = () => {
    const shuffled = [...PRESET_TEAMS].sort(() => 0.5 - Math.random());
    setTeamA(shuffled[0]);
    setTeamB(shuffled[1]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Decorative Title Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-val-surface border border-val-border text-val-red text-xs font-mono uppercase tracking-widest mb-3 clip-val-tag">
          <span className="w-1.5 h-1.5 bg-val-red animate-ping rounded-full inline-block" />
          MATCH PROTOCOL CONFIGURATION
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-wider text-val-white">
          Valorant Map Veto
        </h2>
        <p className="text-sm md:text-base text-val-muted font-sans mt-2 max-w-lg mx-auto">
          Official competitive veto engine with animated spin wheel for Bo1 and tactical ban/pick sequences for Bo3 and Bo5.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Teams Input Card */}
        <div className="bg-val-surface/90 border border-val-border/80 p-6 md:p-8 clip-val-card relative backdrop-blur-md">
          <div className="absolute top-0 left-0 w-24 h-1 bg-val-red" />
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-val-border/40">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-val-red" />
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-val-white">
                Team Roster
              </h3>
            </div>
            <button
              type="button"
              onClick={handleRandomizePresets}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-val-muted hover:text-val-cyan transition-colors"
              title="Pick random pro teams"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Pro Teams</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Team A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                <label htmlFor="teamA" className="text-val-white font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-val-red inline-block" />
                  Team A (Home)
                </label>
                <span className={`${teamA.length > 20 ? 'text-val-red font-bold' : 'text-val-muted'}`}>
                  {teamA.length}/20
                </span>
              </div>
              <input
                id="teamA"
                type="text"
                maxLength={25}
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, teamA: true }))}
                placeholder="e.g. Sentinels"
                className={`w-full bg-val-dark border px-4 py-3 text-val-white placeholder-val-muted/50 font-display font-semibold tracking-wide text-lg transition-colors focus:outline-none ${
                  teamAError || identicalError
                    ? 'border-val-red focus:border-val-red'
                    : 'border-val-border focus:border-val-cyan'
                }`}
              />
              {teamAError && (
                <p className="text-xs text-val-red flex items-center gap-1 mt-1 font-sans">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  {teamAError}
                </p>
              )}
            </div>

            {/* VS Badge */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-val-dark border border-val-border items-center justify-center font-tactical font-bold text-xs text-val-muted z-10">
              VS
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                <label htmlFor="teamB" className="text-val-white font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-val-cyan inline-block" />
                  Team B (Away)
                </label>
                <span className={`${teamB.length > 20 ? 'text-val-red font-bold' : 'text-val-muted'}`}>
                  {teamB.length}/20
                </span>
              </div>
              <input
                id="teamB"
                type="text"
                maxLength={25}
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, teamB: true }))}
                placeholder="e.g. Fnatic"
                className={`w-full bg-val-dark border px-4 py-3 text-val-white placeholder-val-muted/50 font-display font-semibold tracking-wide text-lg transition-colors focus:outline-none ${
                  teamBError || identicalError
                    ? 'border-val-red focus:border-val-red'
                    : 'border-val-border focus:border-val-cyan'
                }`}
              />
              {teamBError && (
                <p className="text-xs text-val-red flex items-center gap-1 mt-1 font-sans">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  {teamBError}
                </p>
              )}
            </div>
          </div>

          {identicalError && (
            <div className="mt-4 p-3 bg-red-950/40 border border-val-red/50 text-val-red text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{identicalError}</span>
            </div>
          )}
        </div>

        {/* Format Selector Card */}
        <div className="bg-val-surface/90 border border-val-border/80 p-6 md:p-8 clip-val-card relative backdrop-blur-md">
          <div className="absolute top-0 left-0 w-24 h-1 bg-val-cyan" />
          <div className="mb-6 pb-3 border-b border-val-border/40">
            <h3 className="font-display font-bold text-lg uppercase tracking-wider text-val-white">
              Match Format
            </h3>
            <p className="text-xs text-val-muted font-sans mt-0.5">
              Select the tournament rule set for this series.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bo1 */}
            <div
              onClick={() => setFormat('bo1')}
              className={`p-4 cursor-pointer border transition-all clip-val-tag relative ${
                format === 'bo1'
                  ? 'bg-val-dark border-val-cyan shadow-val-cyan'
                  : 'bg-val-dark/60 border-val-border/70 hover:border-val-border-light hover:bg-val-dark'
              }`}
            >
              {format === 'bo1' && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-val-cyan rounded-full" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-tactical font-black text-2xl text-val-white">BO1</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-val-surface border border-val-border text-val-cyan uppercase">
                  Spin Wheel
                </span>
              </div>
              <p className="text-xs text-val-muted font-sans leading-relaxed">
                Fair animated spin wheel picks 1 random map uniformly from the 7 available pool maps.
              </p>
            </div>

            {/* Bo3 */}
            <div
              onClick={() => setFormat('bo3')}
              className={`p-4 cursor-pointer border transition-all clip-val-tag relative ${
                format === 'bo3'
                  ? 'bg-val-dark border-val-red shadow-val-red'
                  : 'bg-val-dark/60 border-val-border/70 hover:border-val-border-light hover:bg-val-dark'
              }`}
            >
              {format === 'bo3' && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-val-red rounded-full" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-tactical font-black text-2xl text-val-white">BO3</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-val-surface border border-val-border text-val-red uppercase">
                  Competitive
                </span>
              </div>
              <p className="text-xs text-val-muted font-sans leading-relaxed">
                Standard competitive veto: 2 bans, 2 picks, 2 bans. The 7th map becomes the Decider.
              </p>
            </div>

            {/* Bo5 */}
            <div
              onClick={() => setFormat('bo5')}
              className={`p-4 cursor-pointer border transition-all clip-val-tag relative ${
                format === 'bo5'
                  ? 'bg-val-dark border-val-gold shadow-val-gold'
                  : 'bg-val-dark/60 border-val-border/70 hover:border-val-border-light hover:bg-val-dark'
              }`}
            >
              {format === 'bo5' && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-val-gold rounded-full" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-tactical font-black text-2xl text-val-white">BO5</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-val-surface border border-val-border text-val-gold uppercase">
                  Grand Final
                </span>
              </div>
              <p className="text-xs text-val-muted font-sans leading-relaxed">
                Grand final series veto: 2 bans, 4 picks. The 7th map becomes the Decider.
              </p>
            </div>
          </div>
        </div>

        {/* Turn Order / Coin Flip (Bo3 & Bo5 only) */}
        {format !== 'bo1' && (
          <div className="bg-val-surface/90 border border-val-border/80 p-6 md:p-8 clip-val-card relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-val-border/40">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-val-gold" />
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-val-white">
                  First Turn Determination
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm text-val-white font-semibold">
                  How should the first team to ban/pick be decided?
                </p>
                <p className="text-xs text-val-muted font-sans mt-0.5">
                  Play the coin flip animation or choose manually.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-val-dark p-1 border border-val-border">
                <button
                  type="button"
                  onClick={() => setUseCoinFlip(true)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    useCoinFlip
                      ? 'bg-val-gold text-val-black font-bold'
                      : 'text-val-muted hover:text-val-white'
                  }`}
                >
                  Coin Flip
                </button>
                <button
                  type="button"
                  onClick={() => setUseCoinFlip(false)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    !useCoinFlip
                      ? 'bg-val-surface text-val-white font-bold border border-val-border'
                      : 'text-val-muted hover:text-val-white'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {!useCoinFlip && (
              <div className="mt-4 pt-4 border-t border-val-border/40 flex items-center gap-4">
                <span className="text-xs font-mono text-val-muted uppercase tracking-wider">
                  First to Act:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManualFirstActor('A')}
                    className={`px-3 py-1 text-xs font-mono uppercase border transition-all ${
                      manualFirstActor === 'A'
                        ? 'border-val-red bg-val-red/20 text-val-white font-bold'
                        : 'border-val-border bg-val-dark text-val-muted hover:text-val-white'
                    }`}
                  >
                    {teamATrimmed || 'Team A'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualFirstActor('B')}
                    className={`px-3 py-1 text-xs font-mono uppercase border transition-all ${
                      manualFirstActor === 'B'
                        ? 'border-val-cyan bg-val-cyan/20 text-val-white font-bold'
                        : 'border-val-border bg-val-dark text-val-muted hover:text-val-white'
                    }`}
                  >
                    {teamBTrimmed || 'Team B'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isValid}
            className="w-full md:w-auto min-w-[280px]"
          >
            START VETO PROTOCOL
          </Button>
        </div>
      </form>
    </div>
  );
};
