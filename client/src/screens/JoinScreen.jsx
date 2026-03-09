import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function JoinScreen() {
  const { state, joinRoom, setScreen } = useGame()
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) setRoomCode(room.toUpperCase())
  }, [])

  const handleJoin = () => {
    if (roomCode.length < 4) return
    joinRoom(roomCode.trim(), state.myName)
  }

  const handleBack = () => {
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xs flex flex-col items-center gap-5"
      >
        {/* Bouton retour */}
        <button
          onClick={handleBack}
          className="self-start text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          <span>←</span> Retour
        </button>

        {/* Icône */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-5xl"
        >
          🎮
        </motion.div>

        <h2 className="text-white text-2xl font-bold text-center">Rejoindre une partie</h2>
        <p className="text-gray-400 text-sm text-center -mt-2">
          Entrez le code fourni par votre adversaire
        </p>

        {/* Champ code */}
        <div className="w-full">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="CODE"
            className="w-full px-4 py-4 rounded-xl bg-gray-800 text-white text-center placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-2xl tracking-[0.4em] transition-all"
            maxLength={6}
            autoFocus
          />
        </div>

        {/* Bouton Rejoindre */}
        <button
          onClick={handleJoin}
          disabled={roomCode.length < 4}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="text-lg">🚀</span>
          Rejoindre
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
