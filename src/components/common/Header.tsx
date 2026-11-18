import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../../utils/sound';
import { Button } from './Button';

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showReset = false }) => {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="relative w-full border-b border-val-border/60 bg-val-black/90 backdrop-blur-md px-4 lg:px-8 py-3.5 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-val-red flex items-center justify-center clip-val-tag">
            <span className="font-tactical font-black text-val-white text-lg tracking-tighter">V</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-val-white uppercase">
                Map Veto <span className="text-val-red">Simulator</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-val-surface border border-val-border text-val-muted">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-val-muted uppercase">
              Tactical Map Veto // Competitive Protocols
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {showReset && onReset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              icon={<RotateCcw className="w-3.5 h-3.5 text-val-muted" />}
              aria-label="Reset Veto"
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          <button
            onClick={handleToggleSound}
            className="p-2 border border-val-border/80 bg-val-surface hover:bg-val-surface-card hover:border-val-border-light text-val-white transition-colors clip-val-tag cursor-pointer"
            title={soundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            aria-label={soundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-val-cyan" />
            ) : (
              <VolumeX className="w-4 h-4 text-val-muted" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
