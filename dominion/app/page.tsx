'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameState, Card } from './lib/dominion/types';
import { createInitialState, playAction, playTreasure, buyCard, endTurn } from './lib/dominion/engine';

export default function DominionGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGameState(createInitialState(['Player 1', 'Very Easy AI']));
  }, []);

  // Expose gameState for debugging in browser console
  useEffect(() => {
    if (gameState) {
      (window as any).gameState = gameState;
    }
  }, [gameState]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.log]);

  if (!gameState) return <div className="p-8 text-center bg-slate-950 min-h-screen text-white">Loading game...</div>;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const opponent = gameState.players[1 - gameState.currentPlayerIndex];

  // Organize supply
  const victoryCards = ['province', 'duchy', 'estate', 'curse'];
  const treasureCards = ['gold', 'silver', 'copper'];
  const kingdomCards = Object.entries(gameState.supply).filter(([id]) => id.startsWith('action-'));

  return (
    <div
      className="h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative"
      style={{ backgroundImage: 'url("/bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Top Bar - Opponent Info */}
      <div className="relative z-10 flex justify-center items-center py-2 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-6 px-8 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center text-sm">👤</span>
            <span className="font-bold text-amber-500 uppercase tracking-wider">{opponent.name}</span>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-black">🛡️ 3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs uppercase font-bold">Hand:</span>
              <span className="font-bold text-blue-400">{opponent.hand.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs uppercase font-bold">Coins:</span>
              <span className="font-bold text-yellow-500">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex px-8 gap-8 mt-4 min-h-0">

        {/* Left Side: Stats and Vertical Supply */}
        <div className="flex flex-col gap-6 w-56 shrink-0">

          {/* Circular Stats */}
          <div className="flex flex-col gap-4 items-center">
            <StatCircle label="Actions" value={gameState.actions} icon="⚙️" color="text-slate-200" />
            <StatCircle label="Coins" value={gameState.coins} icon="🪙" color="text-amber-400" />
            <StatCircle label="Buys" value={gameState.buys} icon="🛒" color="text-emerald-400" />
          </div>

          {/* Victory & Treasure Supply */}
          <div className="grid grid-cols-2 gap-2 mt-auto mb-12">
            <div className="flex flex-col gap-2">
              {victoryCards.map(id => (
                <MinCard
                  key={id}
                  card={gameState.supply[id].card}
                  count={gameState.supply[id].count}
                  onBuy={() => setGameState(buyCard(gameState, id))}
                  disabled={gameState.phase !== 'Buy' || gameState.coins < gameState.supply[id].card.cost || gameState.buys <= 0}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {treasureCards.map(id => (
                <MinCard
                  key={id}
                  card={gameState.supply[id].card}
                  count={gameState.supply[id].count}
                  onBuy={() => setGameState(buyCard(gameState, id))}
                  disabled={gameState.phase !== 'Buy' || gameState.coins < gameState.supply[id].card.cost || gameState.buys <= 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Kingdom Supply & Prompt */}
        <div className="flex-1 flex flex-col items-center min-h-0">
          {/* Kingdom Cards (2 rows of 5) */}
          <div className="grid grid-cols-5 gap-3 w-full max-w-4xl bg-black/20 p-4 rounded-3xl backdrop-blur-sm border border-white/5 h-[340px]">
            {kingdomCards.map(([id, item]) => (
              <SupplyCard
                key={id}
                card={item.card}
                count={item.count}
                canBuy={gameState.phase === 'Buy' && gameState.buys > 0 && gameState.coins >= item.card.cost}
                onBuy={() => setGameState(buyCard(gameState, id))}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase animate-pulse">
              {gameState.phase === 'Action' && gameState.actions > 0 ? 'Select an Action card to play' : 'Drag up to play Treasure cards'}
            </p>
          </div>
        </div>

        {/* Right Side: Log and Main Controls */}
        <div className="w-64 flex flex-col gap-4 shrink-0 mb-12">

          {/* Main Action Buttons */}
          <div className="flex flex-col gap-3 mt-12 overflow-visible py-4">
            <button
              onClick={() => {
                let tempState = gameState;
                for (let i = tempState.players[tempState.currentPlayerIndex].hand.length - 1; i >= 0; i--) {
                  if (tempState.players[tempState.currentPlayerIndex].hand[i].type.includes('Treasure')) {
                    tempState = playTreasure(tempState, i);
                  }
                }
                setGameState(tempState);
              }}
              className="dominion-pill-btn h-14 w-full text-lg uppercase tracking-wider"
            >
              Play Treasures
            </button>
            <button
              onClick={() => setGameState(endTurn(gameState))}
              className="dominion-pill-btn h-14 w-full text-lg uppercase tracking-wider !from-slate-600 !to-slate-800 !border-slate-800 opacity-90"
            >
              End Turn
            </button>
          </div>

          {/* Log - Small discrete box */}
          <div className="mt-auto h-40 bg-black/40 rounded-xl border border-white/5 p-3 flex flex-col overflow-hidden backdrop-blur-md">
            <div className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-tighter">Event Journal</div>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[9px]">
              {gameState.log.map((entry, i) => (
                <div key={i} className="text-slate-400 border-l border-slate-700 pl-2 opacity-80">{entry}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Mini Deck/Discard visualization */}
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col items-center">
              <span className="w-10 h-10 rounded border-2 border-slate-600 bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 shadow-lg">
                {currentPlayer.deck.length}
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase mt-1">Deck</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-10 h-10 rounded border-2 border-slate-600 bg-slate-800 flex items-center justify-center font-black text-xs text-rose-400 shadow-lg">
                {currentPlayer.discard.length}
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase mt-1">Discard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Fanned Hand */}
      <div className="relative z-20 mt-auto h-48 card-fan-container pb-8">
        {currentPlayer.hand.map((card, i) => {
          const rotation = (i - (currentPlayer.hand.length - 1) / 2) * 8;
          const yOffset = Math.abs(i - (currentPlayer.hand.length - 1) / 2) * 5;

          return (
            <div
              key={card.id}
              className="card-fan-item"
              style={{
                left: `calc(50% + ${(i - (currentPlayer.hand.length - 1) / 2) * 60}px)`,
                transform: `translateX(-50%) rotate(${rotation}deg) translateY(${yOffset}px)`,
                zIndex: 20 + i
              }}
            >
              <CardUI
                card={card}
                onClick={() => {
                  if (card.type.includes('Action')) setGameState(playAction(gameState, i));
                  else if (card.type.includes('Treasure')) setGameState(playTreasure(gameState, i));
                }}
                canPlay={(card.type.includes('Action') && gameState.phase === 'Action' && gameState.actions > 0) || (card.type.includes('Treasure') && (gameState.phase === 'Action' || gameState.phase === 'Buy'))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCircle({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div className="stat-circle mb-1">
        <span className="text-xs opacity-50 absolute -top-1 right-2">{icon}</span>
        <span className={`text-xl font-black ${color}`}>{value}</span>
      </div>
      <span className="text-[9px] font-black uppercase text-white/40 tracking-tighter">{label}</span>
    </div>
  );
}

function MinCard({ card, count, onBuy, disabled }: { card: Card; count: number; onBuy: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onBuy}
      disabled={disabled}
      className={`
        h-14 w-full rounded border-2 border-slate-700 bg-slate-800/80 p-1 flex flex-col justify-between items-center transition-all
        ${disabled ? 'opacity-50 grayscale' : 'hover:scale-105 hover:bg-slate-700 cursor-pointer shadow-lg'}
      `}
    >
      <div className="w-full flex justify-between items-center px-1">
        <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${card.type.includes('Treasure') ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-white'}`}>
          {card.cost}
        </span>
        <span className="text-[10px] font-black">{count}</span>
      </div>
      <div className="text-[9px] font-black uppercase truncate w-full text-center">{card.name}</div>
    </button>
  );
}

function SupplyCard({ card, count, canBuy, onBuy }: { card: Card; count: number; canBuy: boolean; onBuy: () => void }) {
  // Extract base name for image (e.g., action-0 -> smithy)
  const imageId = card.id.startsWith('action-') ? (card.name.toLowerCase()) : card.id;

  return (
    <button
      disabled={!canBuy || count <= 0}
      onClick={onBuy}
      className={`
        relative bg-slate-800 rounded-xl border-2 border-white/10 flex flex-col p-1 h-32 overflow-hidden group transition-all
        ${canBuy ? 'hover:scale-110 hover:z-20 hover:shadow-2xl hover:border-amber-400/50 cursor-pointer' : 'opacity-80 saturate-50'}
      `}
    >
      {/* Illustration Area */}
      <div className={`flex-1 rounded-lg bg-slate-900/80 flex items-center justify-center relative overflow-hidden`}>
        <img
          src={`/cards/${imageId}.png`}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[10px] opacity-20 uppercase font-black rotate-12">{card.name}</div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="mt-1 flex justify-between items-center px-1 py-0.5 relative z-10 bg-black/40 backdrop-blur-sm -mx-1 -mb-1">
        <div className="w-5 h-5 rounded-full bg-yellow-500 text-black flex items-center justify-center text-[10px] font-black border border-black/20 shadow-inner">
          {card.cost}
        </div>
        <div className="text-[8px] font-black truncate max-w-[50px] uppercase text-white/90">{card.name}</div>
        <div className="text-[9px] font-black text-amber-500">×{count}</div>
      </div>

      {count === 0 && <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center text-rose-500 font-black text-xs rotate-12 uppercase border border-rose-500/50 m-2 rounded">Gone</div>}
    </button>
  );
}

function CardUI({ card, onClick, canPlay }: { card: Card; onClick?: () => void; canPlay?: boolean }) {
  const isTreasure = card.type.includes('Treasure');
  const isVictory = card.type.includes('Victory');

  // Extract base name for image
  const cardId = card.id.split('-')[0];

  let borderColor = 'border-slate-500/50';
  let bgColor = 'bg-slate-700';

  if (isTreasure) {
    borderColor = 'border-amber-500/50';
    bgColor = 'bg-gradient-to-br from-amber-700 to-amber-950';
  } else if (isVictory) {
    borderColor = 'border-emerald-500/50';
    bgColor = 'bg-gradient-to-br from-emerald-800 to-emerald-950';
  }

  return (
    <div
      onClick={canPlay ? onClick : undefined}
      className={`
        w-28 h-40 rounded-xl border-2 ${borderColor} ${bgColor} shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        flex flex-col p-2 select-none relative transition-all duration-300
        ${canPlay ? 'cursor-pointer hover:shadow-white/10 ring-2 ring-transparent hover:ring-white/20' : 'brightness-75 saturate-50'}
        group overflow-hidden
      `}
    >
      <img
        src={`/cards/${cardId}.png`}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Card header */}
      <div className="flex justify-between items-start mb-1 relative z-10">
        <span className="text-[10px] font-black text-white px-1 bg-black/40 rounded uppercase truncate max-w-[70%]">{card.name}</span>
        <span className="text-[8px] bg-black/60 px-1 rounded text-white/60 uppercase">{isTreasure ? 'Treasure' : isVictory ? 'Victory' : 'Action'}</span>
      </div>

      {/* Centered illustration space */}
      <div className="flex-1 my-1 bg-black/30 rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden z-10">
        {!isTreasure && !isVictory && <span className="text-2xl drop-shadow-lg scale-150 grayscale-[0.5] opacity-10">📜</span>}

        <div className="absolute inset-x-0 bottom-0 py-1 bg-black/60 backdrop-blur-md text-center">
          <span className="text-[9px] font-bold leading-none text-white shadow-sm">{card.description}</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-1 flex items-center justify-between relative z-10">
        <div className="w-5 h-5 rounded-full bg-yellow-500 text-black flex items-center justify-center text-[10px] font-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          {card.cost}
        </div>
        {isTreasure && <span className="text-amber-400 font-black text-xs drop-shadow-md">+{card.treasure}</span>}
        {isVictory && <span className="text-emerald-400 font-black text-xs drop-shadow-md">{card.victoryPoints}</span>}
      </div>
    </div>
  );
}
