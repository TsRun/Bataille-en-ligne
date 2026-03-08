import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function HomeScreen() {
  const { state, createRoom, joinRoom } = useGame()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    createRoom(name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || roomCode.length < 4) return
    joinRoom(roomCode.trim(), name.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-green-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
      >
        <h1 className="text-white text-5xl font-bold text-center mb-1">Bataille</h1>
        <p className="text-green-300 text-center text-sm mb-8">Jeu de cartes multijoueur</p>

        <div className="mb-6">
          <label className="text-green-200 text-sm mb-1 block">Votre nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Entrez votre nom"
            className="w-full px-4 py-2 rounded-lg bg-green-700 text-white placeholder-green-400 border border-green-600 focus:outline-none focus:border-green-400"
            maxLength={20}
            autoFocus
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg transition-colors mb-6"
        >
          Créer une partie
        </button>

        <div className="border-t border-green-600 pt-6">
          <p className="text-green-400 text-xs text-center mb-3">— ou rejoindre —</p>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="CODE"
            className="w-full px-4 py-2 rounded-lg bg-green-700 text-white placeholder-green-500 border border-green-600 focus:outline-none focus:border-green-400 mb-3 text-center tracking-widest font-mono text-lg"
            maxLength={6}
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim() || roomCode.length < 4}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Rejoindre
          </button>
        </div>

        {state.error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-400 text-sm text-center"
          >
            {state.error}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
