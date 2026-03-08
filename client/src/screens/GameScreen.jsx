import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import GameTable from '../components/GameTable'

// Predefined confetti data to avoid re-render randomness
const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  delay: (i * 0.07) % 1.5,
  duration: 1.8 + (i * 0.11) % 1.2,
  color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i % 8],
  width: 8 + (i * 3) % 10,
  height: 5 + (i * 2) % 7,
  rotateEnd: (i % 2 === 0 ? 1 : -1) * (180 + (i * 47) % 180),
}))

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {CONFETTI_PIECES.map(({ id, x, delay, duration, color, width, height, rotateEnd }) => (
        <motion.div
          key={id}
          className="absolute rounded-sm"
          style={{ left: `${x}%`, top: 0, width, height, backgroundColor: color }}
          initial={{ y: -20, opacity: 1, rotateZ: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0.6, 0], rotateZ: rotateEnd }}
          transition={{ delay, duration, ease: 'easeIn', repeat: Infinity, repeatDelay: 0.8 }}
        />
      ))}
    </div>
  )
}

export default function GameScreen() {
  const { state, reset } = useGame()
  const { gameState, myId, screen } = state

  if (screen === 'over') {
    const isWinner = gameState?.winner === myId
    return (
      <div className="relative min-h-screen bg-green-900 flex items-center justify-center p-4 overflow-hidden">
        {isWinner && <Confetti />}

        {/* Dark vignette for defeat */}
        {!isWinner && (
          <motion.div
            className="absolute inset-0 bg-black/40 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        )}

        <motion.div
          className="relative z-20 bg-green-800 rounded-2xl p-10 text-center shadow-2xl"
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <motion.p
            className="text-6xl mb-4"
            initial={{ scale: 0, rotateZ: -20 }}
            animate={{ scale: [0, 1.4, 1], rotateZ: [-20, 10, 0] }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'backOut' }}
          >
            {isWinner ? '🏆' : '💀'}
          </motion.p>

          <motion.h2
            className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-300' : 'text-white'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {isWinner ? 'Victoire !' : 'Défaite'}
          </motion.h2>

          <motion.p
            className="text-green-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            {isWinner
              ? 'Vous avez remporté les 52 cartes !'
              : "Vous n'avez plus de cartes."}
          </motion.p>

          <motion.button
            onClick={reset}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
          >
            Retour à l&apos;accueil
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return <GameTable />
}
