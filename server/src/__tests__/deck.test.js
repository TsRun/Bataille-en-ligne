'use strict';

const { createDeck, shuffle, dealDeck } = require('../deck');

describe('createDeck', () => {
  it('creates 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    const keys = new Set(deck.map((c) => `${c.value}${c.suit}`));
    expect(keys.size).toBe(52);
  });

  it('assigns correct ranks', () => {
    const deck = createDeck();
    const two = deck.find((c) => c.value === '2');
    const ace = deck.find((c) => c.value === 'A');
    expect(two.rank).toBe(0);
    expect(ace.rank).toBe(12);
  });
});

describe('shuffle', () => {
  it('preserves length', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr);
    expect(arr).toHaveLength(5);
  });

  it('contains same elements', () => {
    const deck = createDeck();
    const copy = [...deck];
    shuffle(deck);
    expect(deck).toHaveLength(52);
    expect(deck.map((c) => `${c.value}${c.suit}`).sort()).toEqual(
      copy.map((c) => `${c.value}${c.suit}`).sort()
    );
  });
});

describe('dealDeck', () => {
  it('deals 26 cards to each pile', () => {
    const { pile1, pile2 } = dealDeck();
    expect(pile1).toHaveLength(26);
    expect(pile2).toHaveLength(26);
  });

  it('no duplicate cards between piles', () => {
    const { pile1, pile2 } = dealDeck();
    const all = [...pile1, ...pile2].map((c) => `${c.value}${c.suit}`);
    const unique = new Set(all);
    expect(unique.size).toBe(52);
  });
});
