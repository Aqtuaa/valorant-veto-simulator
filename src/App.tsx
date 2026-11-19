import React from 'react';
import { useVeto } from './hooks/useVeto';
import { Header } from './components/common/Header';
import { SetupScreen } from './components/setup/SetupScreen';
import { CoinFlipModal } from './components/coinflip/CoinFlipModal';
import { VetoScreen } from './components/veto/VetoScreen';
import { SpinWheel } from './components/wheel/SpinWheel';
import { ResultScreen } from './components/result/ResultScreen';

export const App: React.FC = () => {
  const {
    screen,
    config,
    mapStates,
    currentStep,
    history,
    pendingAction,
    playedMaps,
    startVeto,
    handleCoinFlipComplete,
    requestMapAction,
    setChosenSide,
    confirmPendingAction,
    cancelPendingAction,
    undoLastAction,
    handleWheelResult,
    resetVeto,
  } = useVeto();

  return (
    <div className="min-h-screen flex flex-col bg-val-black text-val-white selection:bg-val-red selection:text-val-white relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-tactical-grid opacity-30 z-0" />

      {/* Persistent Tactical Header */}
      <Header
        showReset={screen !== 'setup'}
        onReset={resetVeto}
      />

      {/* Main Screen Body */}
      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {screen === 'setup' && (
          <SetupScreen onStart={startVeto} />
        )}

        {screen === 'coinflip' && (
          <CoinFlipModal
            teamAName={config.teamAName}
            teamBName={config.teamBName}
            onComplete={handleCoinFlipComplete}
          />
        )}

        {screen === 'veto' && (
          <VetoScreen
            config={config}
            mapStates={mapStates}
            currentStep={currentStep}
            history={history}
            playedMaps={playedMaps}
            pendingAction={pendingAction}
            onRequestMapAction={requestMapAction}
            onSetChosenSide={setChosenSide}
            onConfirmAction={confirmPendingAction}
            onCancelAction={cancelPendingAction}
            onUndo={undoLastAction}
          />
        )}

        {screen === 'wheel' && (
          <SpinWheel
            teamAName={config.teamAName}
            teamBName={config.teamBName}
            onComplete={handleWheelResult}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            config={config}
            playedMaps={playedMaps}
            history={history}
            mapStates={mapStates}
            onReset={resetVeto}
          />
        )}
      </main>

      {/* Tactical Footer */}
      <footer className="w-full border-t border-val-border/40 bg-val-dark/60 py-4 px-6 text-center text-[11px] font-mono text-val-muted/70 tracking-wider relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VALORANT MAP VETO PROTOCOL // CLIENT ENGINE</span>
          <span>COMPETITIVE MAP POOL: ABYSS, BIND, CORRODE, HAVEN, LOTUS, SUMMIT, SUNSET</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
