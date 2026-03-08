import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card, { FlippingCard } from './Card'
import { useGame } from '../context/GameContext'

function DealAnimation({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1900)
    return () => clearTimeout(timer)
  }, [onComplete])

  // 10 cards alternating between opponent (up) and player (down)
  const cards = Array.from({ length: 10 }, (_, i) => ({
    toOpponent: i % 2 === 0,
    delay: i * 0.13,
    rotateZ: (Math.random() - 0.5) * 12,
  }))

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-green-950/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.p
        className="absolute text-green-300 font-semibold tracking-widest text-sm uppercase z-30"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Distribution en cours…
      </motion.p>
      {cards.map(({ toOpponent, delay, rotateZ }, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-28 bg-blue-900 rounded-xl border-2 border-blue-500 shadow-xl"
          initial={{ y: 0, x: (i - 4.5) * 2, opacity: 1, rotateZ: 0 }}
          animate={{ y: toOpponent ? -300 : 300, opacity: [1, 1, 0], rotateZ }}
          transition={{ delay, duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export default function GameTable() {
  const [isDealing, setIsDealing] = useState(true)
  const handleDealDone = useCallback(() => setIsDealing(false), [])
  const [flipKey, setFlipKey] = useState(0)
  const { state, flipCard } = useGame()

  useEffect(() => {
    if (state.lastResult) setFlipKey((k) => k + 1)
  }, [state.lastResult])
  const { gameState, myId, opponentReady, myFlipped, lastResult } = state

  if (!gameState) return null

  const myIndex = gameState.playerOrder.indexOf(myId)
  const opponentId = gameState.playerOrder.find((id) => id !== myId)
  const me = gameState.players[myId]
  const opponent = gameState.players[opponentId]

  // Determine which card is mine and which is the opponent's from the last round result.
  // card1 always belongs to playerOrder[0], card2 to playerOrder[1].
  let myCard = null
  let opponentCard = null
  let isBattle = false
  let winnerId = null

  if (lastResult?.card1) {
    if (myIndex === 0) {
      myCard = lastResult.card1
      opponentCard = lastResult.card2
    } else {
      myCard = lastResult.card2
      opponentCard = lastResult.card1
    }
    isBattle = lastResult.event === 'battle'
    winnerId = lastResult.winnerId
  }

  const iWon = winnerId === myId
  const opponentWon = winnerId === opponentId

  return (
    <div className="relative min-h-screen bg-green-900 flex flex-col p-4 gap-4">

      <AnimatePresence>
        {isDealing && <DealAnimation onComplete={handleDealDone} />}
      </AnimatePresence>

      {/* Opponent area */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="text-center">
          <p className="text-white font-bold text-lg">
            {opponent?.name || 'Adversaire'}
          </p>
          <p className="text-green-300 text-sm">{opponent?.cardCount ?? '?'} cartes</p>
          {opponentReady && (
            <p className="text-yellow-400 text-xs font-semibold mt-0.5 animate-pulse">Prêt !</p>
          )}
        </div>
        <div className="relative">
          <Card faceDown />
          {opponentReady && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
            </span>
          )}
        </div>
      </div>

      {/* Center play area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {isBattle && (
          <p className="text-yellow-400 font-extrabold text-2xl tracking-widest drop-shadow-lg">
            ⚔ BATAILLE !
          </p>
        )}

        {myCard && opponentCard ? (
          <>
            <div className="flex gap-6 items-end">
              <div className="flex flex-col items-center gap-1">
                <FlippingCard key={`opp-${flipKey}`} card={opponentCard} highlight={opponentWon} />
                <span
                  className={`text-xs font-semibold ${opponentWon ? 'text-yellow-400' : 'text-green-300'}`}
                >
                  {opponentWon ? '🏆 ' : ''}{opponent?.name ?? 'Adversaire'}
                </span>
              </div>

              <span className="text-white text-xl font-bold mb-5">VS</span>

              <div className="flex flex-col items-center gap-1">
                <FlippingCard key={`me-${flipKey}`} card={myCard} highlight={iWon} delay={0.1} />
                <span
                  className={`text-xs font-semibold ${iWon ? 'text-yellow-400' : 'text-green-300'}`}
                >
                  {iWon ? '🏆 ' : ''}Vous
                </span>
              </div>
            </div>

            {lastResult?.cardsWon > 2 && (
              <p className="text-green-300 text-sm">
                +{lastResult.cardsWon} cartes
              </p>
            )}
          </>
        ) : (
          <p className="text-green-600 text-sm italic">
            Cliquez sur &quot;Retourner&quot; pour jouer
          </p>
        )}
      </div>

      {/* My area */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <Card faceDown />
        <div className="text-center">
          <p className="text-white font-bold text-lg">{me?.name || 'Vous'}</p>
          <p className="text-green-300 text-sm">{me?.cardCount ?? '?'} cartes</p>
        </div>
        <button
          onClick={flipCard}
          disabled={myFlipped}
          className={`mt-1 px-10 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
            myFlipped
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg'
          }`}
        >
          {myFlipped ? 'En attente...' : 'Retourner'}
        </button>
      </div>
    </div>
  )
}
