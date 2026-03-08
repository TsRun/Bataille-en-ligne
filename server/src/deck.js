'use strict';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const VALUE_ORDER = Object.fromEntries(VALUES.map((v, i) => [v, i]));

/**
 * Create a standard 52-card deck.
 * @returns {Array<{suit: string, value: string, rank: number}>}
 */
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, rank: VALUE_ORDER[value] });
    }
  }
  return deck;
}

/**
 * Shuffle an array in-place using Fisher-Yates.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create and shuffle a deck, then split evenly into two piles of 26.
 * @returns {{ pile1: Array, pile2: Array }}
 */
function dealDeck() {
  const deck = shuffle(createDeck());
  return {
    pile1: deck.slice(0, 26),
    pile2: deck.slice(26),
  };
}

module.exports = { createDeck, shuffle, dealDeck, VALUE_ORDER };
