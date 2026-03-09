import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function HomeScreen() {
  const { state, createRoom, joinRoom } = useGame()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) setRoomCode(room.toUpperCase())
  }, [])

  const handleCreate = () => {
    if (!name.trim()) return
    createRoom(name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || roomCode.length < 4) return
    joinRoom(roomCode.trim(), name.trim())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xs flex flex-col gap-4"
      >
        <h1 className="text-white text-4xl font-bold text-center mb-2">Bataille</h1>

        {/* 1. Pseudo */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Ton pseudo"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-gray-400"
          maxLength={20}
          autoFocus
        />

        {/* 2. Créer */}
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg transition-colors"
        >
          Créer une partie
        </button>

        {/* 3. Séparateur */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* 4. Code + Rejoindre sur la même ligne */}
        <div className="flex gap-2">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Code de la partie"
            className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-gray-400 font-mono tracking-widest"
            maxLength={6}
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim() || roomCode.length < 4}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            Rejoindre
          </button>
        </div>

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
