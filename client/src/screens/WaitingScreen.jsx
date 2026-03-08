import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function WaitingScreen() {
  const { state } = useGame()
  const { roomId, myName } = state
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated floating cards */}
        <div className="relative h-28 w-20 mx-auto mb-10">
          {[3, 2, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 bg-blue-700 rounded-xl border-2 border-blue-500 shadow-lg"
              style={{ top: i * 5, left: i * 3, zIndex: 10 - i }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0 bg-white rounded-xl border-2 border-gray-200 shadow-xl flex items-center justify-center"
            style={{ top: 0, left: 0, zIndex: 20 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-5xl select-none leading-none">🂠</span>
          </motion.div>
        </div>

        {myName && (
          <p className="text-yellow-300 font-semibold text-lg mb-3">Bonjour, {myName} !</p>
        )}
        <motion.h2
          className="text-white text-2xl font-bold mb-2"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          En attente d'un adversaire…
        </motion.h2>
        <p className="text-green-300 mb-8 text-sm">Partagez le code ci-dessous pour inviter un ami</p>

        {/* Room code card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-800 rounded-2xl p-6 inline-block shadow-xl"
        >
          <p className="text-green-300 text-xs uppercase tracking-widest mb-2">Code de la partie</p>
          <div className="text-white text-3xl sm:text-5xl font-mono font-bold tracking-widest mb-5 select-all">
            {roomId}
          </div>
          <button
            onClick={handleCopy}
            className="px-8 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
          >
            {copied ? '✓ Copié !' : 'Copier le code'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
