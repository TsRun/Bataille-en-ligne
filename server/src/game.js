'use strict';

const { dealDeck, shuffle } = require('./deck');

/**
 * Game phases:
 *  - 'waiting'    : waiting for second player
 *  - 'playing'    : normal round, waiting for both players to flip
 *  - 'battle'     : battle in progress (players need to place cards)
 *  - 'over'       : game ended
 */

function createGame(roomId) {
  const { pile1, pile2 } = dealDeck();
  return {
    roomId,
    phase: 'waiting',
    players: {}, // { socketId: { id, name, pile: [] } }
    playerOrder: [], // [socketId1, socketId2]
    pot: [],         // cards currently in play (center)
    battlePot: [],   // cards staked during battle rounds
    readyPlayers: new Set(), // set of socketIds that clicked "flip"
    restartVotes: new Set(), // set of socketIds that voted to restart
    winner: null,
    initialPiles: [pile1, pile2],
  };
}

/**
 * Reset game state for a rematch in the same room (same players).
 */
function restartGame(game) {
  const { pile1, pile2 } = dealDeck();
  const [p1id, p2id] = game.playerOrder;
  game.players[p1id].pile = pile1;
  game.players[p2id].pile = pile2;
  game.pot = [];
  game.battlePot = [];
  game.readyPlayers = new Set();
  game.restartVotes = new Set();
  game.winner = null;
  game.phase = 'playing';
}

/**
 * Add a player to the game. Returns false if room is full.
 */
function addPlayer(game, socketId, playerName) {
  if (game.playerOrder.length >= 2) return false;
  const idx = game.playerOrder.length;
  const pile = game.initialPiles[idx];
  game.players[socketId] = { id: socketId, name: playerName, pile };
  game.playerOrder.push(socketId);
  if (game.playerOrder.length === 2) {
    game.phase = 'playing';
  }
  return true;
}

/**
 * Mark a player as ready to flip. When both are ready, resolve the round.
 * Returns a result object describing what happened.
 */
function playerFlip(game, socketId) {
  if (game.phase !== 'playing') return { error: 'Not in playing phase' };
  if (!game.players[socketId]) return { error: 'Unknown player' };
  if (game.readyPlayers.has(socketId)) return { error: 'Already flipped' };

  game.readyPlayers.add(socketId);

  if (game.readyPlayers.size < 2) {
    return { waiting: true };
  }

  // Both players flipped — resolve the turn
  return resolveTurn(game);
}

/**
 * Resolve a normal turn: each player reveals their top card.
 */
function resolveTurn(game) {
  game.readyPlayers.clear();

  const [p1id, p2id] = game.playerOrder;
  const p1 = game.players[p1id];
  const p2 = game.players[p2id];

  // Check if either player has no cards
  const endCheck = checkEnd(game);
  if (endCheck) return endCheck;

  const card1 = p1.pile.shift();
  const card2 = p2.pile.shift();

  game.pot.push(card1, card2);

  if (card1.rank > card2.rank) {
    return awardPot(game, p1id, card1, card2, 'normal');
  } else if (card2.rank > card1.rank) {
    return awardPot(game, p2id, card1, card2, 'normal');
  } else {
    // Battle!
    return startBattle(game, card1, card2);
  }
}

/**
 * Start a battle. Move pot to battlePot, then have each player place 3 hidden + 1 visible.
 */
function startBattle(game, card1, card2) {
  const [p1id, p2id] = game.playerOrder;
  const p1 = game.players[p1id];
  const p2 = game.players[p2id];

  // Need at least 4 cards each (3 hidden + 1 visible)
  if (p1.pile.length < 4) {
    return endGame(game, p2id, 'insufficient_cards');
  }
  if (p2.pile.length < 4) {
    return endGame(game, p1id, 'insufficient_cards');
  }

  // Move current pot to battlePot
  game.battlePot.push(...game.pot);
  game.pot = [];

  // Each player places 3 hidden cards and 1 visible
  const hidden1 = p1.pile.splice(0, 3);
  const reveal1 = p1.pile.shift();
  const hidden2 = p2.pile.splice(0, 3);
  const reveal2 = p2.pile.shift();

  game.battlePot.push(...hidden1, ...hidden2);
  game.pot.push(reveal1, reveal2);

  if (reveal1.rank > reveal2.rank) {
    return awardPot(game, p1id, reveal1, reveal2, 'battle');
  } else if (reveal2.rank > reveal1.rank) {
    return awardPot(game, p2id, reveal1, reveal2, 'battle');
  } else {
    // Another battle!
    return startBattle(game, reveal1, reveal2);
  }
}

/**
 * Award all pot + battlePot cards to the winner player.
 */
function awardPot(game, winnerId, card1, card2, type) {
  const allCards = shuffle([...game.battlePot, ...game.pot]);
  game.players[winnerId].pile.push(...allCards);
  game.pot = [];
  game.battlePot = [];
  game.phase = 'playing';

  const endCheck = checkEnd(game);
  if (endCheck) return endCheck;

  return {
    type,
    winnerId,
    card1,
    card2,
    cardsWon: allCards.length,
    gameState: serializeState(game),
  };
}

/**
 * Check if game is over (a player has 0 or 52 cards).
 */
function checkEnd(game) {
  for (const [id, player] of Object.entries(game.players)) {
    if (player.pile.length === 0) {
      const otherId = game.playerOrder.find((pid) => pid !== id);
      return endGame(game, otherId, 'no_cards');
    }
    if (player.pile.length === 52) {
      return endGame(game, id, 'all_cards');
    }
  }
  return null;
}

function endGame(game, winnerId, reason) {
  game.phase = 'over';
  game.winner = winnerId;
  return {
    type: 'game_over',
    winnerId,
    reason,
    gameState: serializeState(game),
  };
}

/**
 * Serialize game state for sending to clients (no Sets, clean data).
 */
function serializeState(game) {
  const players = {};
  for (const [id, p] of Object.entries(game.players)) {
    players[id] = {
      id: p.id,
      name: p.name,
      cardCount: p.pile.length,
      topCard: p.pile.length > 0 ? { suit: p.pile[0].suit, value: p.pile[0].value } : null,
    };
  }
  return {
    phase: game.phase,
    players,
    playerOrder: game.playerOrder,
    pot: game.pot.map((c) => ({ suit: c.suit, value: c.value, rank: c.rank })),
    battlePotCount: game.battlePot.length,
    readyPlayers: [...game.readyPlayers],
    winner: game.winner,
  };
}

/**
 * Remove a player (on disconnect). The other player wins.
 */
function removePlayer(game, socketId) {
  const otherId = game.playerOrder.find((pid) => pid !== socketId);
  if (!otherId || game.phase === 'over') return null;
  return endGame(game, otherId, 'disconnect');
}

module.exports = { createGame, addPlayer, playerFlip, serializeState, removePlayer, restartGame };
