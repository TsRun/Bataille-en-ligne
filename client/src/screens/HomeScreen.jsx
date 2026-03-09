import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function HomeScreen() {
  const { state, createRoom, setScreen } = useGame()
  const [name, setName] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) {
      setScreen('join')
    }
  }, [setScreen])

  const handleCreate = () => {
    if (!name.trim()) return
    createRoom(name.trim())
  }

  const handleJoin = () => {
    if (!name.trim()) return
    setScreen('join', name.trim())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xs flex flex-col items-center gap-5"
      >
        {/* Logo / Icône */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-24 h-28 mb-2"
        >
          {/* Carte arrière */}
          <div className="absolute top-2 left-1 w-16 h-22 bg-blue-700 rounded-xl border-2 border-blue-500 shadow-lg" style={{ transform: 'rotate(-8deg)' }} />
          {/* Carte avant */}
          <div className="absolute top-0 left-5 w-16 h-22 bg-white rounded-xl border-2 border-gray-200 shadow-xl flex items-center justify-center" style={{ transform: 'rotate(5deg)' }}>
            <span className="text-4xl select-none">♠</span>
          </div>
        </motion.div>

        <h1 className="text-white text-4xl font-bold text-center">Bataille</h1>
        <p className="text-gray-400 text-sm text-center -mt-2">Le jeu de cartes en ligne</p>

        {/* Pseudo */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Ton pseudo"
          className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
          maxLength={20}
          autoFocus
        />

        {/* Bouton Créer une partie */}
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="text-lg">⚔️</span>
          Créer une partie
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-xs uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Bouton Rejoindre une partie */}
        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          className="w-full py-3.5 bg-transparent border-2 border-blue-500 hover:bg-blue-500/10 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-blue-400 hover:text-blue-300 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="text-lg">🎮</span>
          Rejoindre une partie
        </button>

        {state.error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center"
          >
            {state.error}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
