import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TeamActor } from '../../types/veto';
import { flipCoin } from '../../utils/random';
import { playCoinFlipSound, playDeciderSound } from '../../utils/sound';
import { Button } from '../common/Button';

interface CoinFlipModalProps {
  teamAName: string;
  teamBName: string;
  onComplete: (winner: TeamActor) => void;
}

export const CoinFlipModal: React.FC<CoinFlipModalProps> = ({
  teamAName,
  teamBName,
  onComplete,
}) => {
  const [flipping, setFlipping] = useState(false);
  const [winner, setWinner] = useState<TeamActor | null>(null);
  const [rotations, setRotations] = useState(0);

  const startFlip = () => {
    if (flipping) return;
    setFlipping(true);
    setWinner(null);
    playCoinFlipSound();

    const chosenWinner = flipCoin();
    // 5 to 7 full rotations plus offset for winner (0deg for A, 180deg for B)
    const baseSpins = 5 + Math.floor(Math.random() * 3);
    const targetAngle = baseSpins * 360 + (chosenWinner === 'A' ? 0 : 180);

    setRotations(targetAngle);

    setTimeout(() => {
      setWinner(chosenWinner);
      setFlipping(false);
      playDeciderSound();
    }, 2400);
  };

  useEffect(() => {
    // Auto-trigger flip shortly after mount
    const timer = setTimeout(() => {
      startFlip();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const winningTeamName = winner === 'A' ? teamAName : teamBName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-val-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-val-surface border border-val-border shadow-2xl p-6 sm:p-8 clip-val-card text-center">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-val-gold" />

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-val-dark border border-val-border text-val-gold text-xs font-mono uppercase tracking-widest clip-val-tag mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            TURN DETERMINATION PROTOCOL
          </div>
          <h3 className="text-2xl font-display font-extrabold text-val-white uppercase tracking-wider">
            Coin Toss
          </h3>
          <p className="text-xs text-val-muted font-sans mt-1">
            Determining which squad takes the first ban/pick
          </p>
        </div>

        {/* 3D Coin Graphic */}
        <div className="py-8 flex justify-center items-center perspective-1000">
          <motion.div
            animate={{
              rotateY: rotations,
              scale: flipping ? [1, 1.25, 1] : 1,
            }}
            transition={{
              duration: 2.2,
              ease: [0.25, 1, 0.5, 1], // Custom realistic deceleration easing
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-32 h-32 relative cursor-pointer"
            onClick={startFlip}
          >
            {/* Front Side: Team A */}
            <div
              className="absolute inset-0 rounded-full border-4 border-val-red bg-gradient-to-br from-red-600 via-val-surface to-val-dark flex flex-col items-center justify-center shadow-val-red p-3 text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-[10px] font-mono tracking-widest text-val-red font-bold uppercase">
                TEAM A
              </span>
              <span className="font-display font-black text-sm text-val-white uppercase line-clamp-2 px-1">
                {teamAName}
              </span>
            </div>

            {/* Back Side: Team B */}
            <div
              className="absolute inset-0 rounded-full border-4 border-val-cyan bg-gradient-to-br from-cyan-600 via-val-surface to-val-dark flex flex-col items-center justify-center shadow-val-cyan p-3 text-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <span className="text-[10px] font-mono tracking-widest text-val-cyan font-bold uppercase">
                TEAM B
              </span>
              <span className="font-display font-black text-sm text-val-white uppercase line-clamp-2 px-1">
                {teamBName}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Status / Result Display */}
        <div className="min-h-[70px] flex flex-col items-center justify-center">
          {flipping ? (
            <p className="text-xs font-mono tracking-wider text-val-muted uppercase animate-pulse">
              Flipping coin...
            </p>
          ) : winner ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <span
                className={`text-xs font-mono font-bold tracking-widest uppercase ${
                  winner === 'A' ? 'text-val-red' : 'text-val-cyan'
                }`}
              >
                {winner === 'A' ? 'Team A' : 'Team B'} Won the Toss
              </span>
              <h4 className="text-lg font-display font-extrabold text-val-white uppercase">
                {winningTeamName} acts first!
              </h4>
            </motion.div>
          ) : (
            <p className="text-xs font-mono text-val-muted">Click the coin or wait...</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {winner && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onComplete(winner)}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              PROCEED TO VETO
            </Button>
          )}

          {!flipping && winner && (
            <Button
              variant="secondary"
              size="md"
              onClick={startFlip}
              className="w-full sm:w-auto"
            >
              Flip Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
