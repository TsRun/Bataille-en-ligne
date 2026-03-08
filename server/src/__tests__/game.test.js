'use strict';

const { createGame, addPlayer, playerFlip, removePlayer, serializeState } = require('../game');

function setupGame() {
  const game = createGame('TESTROOM');
  addPlayer(game, 'p1', 'Alice');
  addPlayer(game, 'p2', 'Bob');
  return game;
}

describe('createGame', () => {
  it('starts in waiting phase', () => {
    const game = createGame('R1');
    expect(game.phase).toBe('waiting');
  });
});

describe('addPlayer', () => {
  it('transitions to playing when two players join', () => {
    const game = setupGame();
    expect(game.phase).toBe('playing');
    expect(game.playerOrder).toHaveLength(2);
  });

  it('rejects a third player', () => {
    const game = setupGame();
    const ok = addPlayer(game, 'p3', 'Charlie');
    expect(ok).toBe(false);
  });

  it('each player gets 26 cards', () => {
    const game = setupGame();
    expect(game.players['p1'].pile).toHaveLength(26);
    expect(game.players['p2'].pile).toHaveLength(26);
  });
});

describe('playerFlip', () => {
  it('returns waiting when only one player flips', () => {
    const game = setupGame();
    const result = playerFlip(game, 'p1');
    expect(result.waiting).toBe(true);
  });

  it('returns error if player flips twice', () => {
    const game = setupGame();
    playerFlip(game, 'p1');
    const result = playerFlip(game, 'p1');
    expect(result.error).toBeDefined();
  });

  it('resolves the round when both flip', () => {
    const game = setupGame();
    playerFlip(game, 'p1');
    const result = playerFlip(game, 'p2');
    // Should be a round result or game_over
    expect(['normal', 'battle', 'game_over']).toContain(result.type);
  });

  it('card counts are consistent after a round', () => {
    const game = setupGame();
    playerFlip(game, 'p1');
    const result = playerFlip(game, 'p2');
    if (result.type !== 'game_over') {
      const p1Count = game.players['p1'].pile.length;
      const p2Count = game.players['p2'].pile.length;
      expect(p1Count + p2Count).toBe(52);
    }
  });

  it('readyPlayers is cleared after resolution', () => {
    const game = setupGame();
    playerFlip(game, 'p1');
    playerFlip(game, 'p2');
    expect(game.readyPlayers.size).toBe(0);
  });
});

describe('removePlayer', () => {
  it('awards win to remaining player on disconnect', () => {
    const game = setupGame();
    const result = removePlayer(game, 'p1');
    expect(result.type).toBe('game_over');
    expect(result.winnerId).toBe('p2');
    expect(result.reason).toBe('disconnect');
  });

  it('returns null if game is already over', () => {
    const game = setupGame();
    game.phase = 'over';
    const result = removePlayer(game, 'p1');
    expect(result).toBeNull();
  });
});

describe('serializeState', () => {
  it('does not expose full piles', () => {
    const game = setupGame();
    const state = serializeState(game);
    for (const p of Object.values(state.players)) {
      expect(p.pile).toBeUndefined();
      expect(typeof p.cardCount).toBe('number');
    }
  });
});
