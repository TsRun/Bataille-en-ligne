import { useGame } from '../context/GameContext'

// Placeholder — will be fully implemented in Phase 3
export default function GameScreen() {
  const { state, flipCard, reset } = useGame()
  const { gameState, myId, myName, screen } = state

  if (screen === 'over') {
    const isWinner = gameState?.winner === myId
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
        <div className="bg-green-800 rounded-2xl p-10 text-center shadow-2xl">
          <p className="text-6xl mb-4">{isWinner ? '🏆' : '💀'}</p>
          <h2 className="text-white text-3xl font-bold mb-2">
            {isWinner ? 'Victoire !' : 'Défaite'}
          </h2>
          <p className="text-green-300 mb-8">
            {isWinner ? 'Vous avez remporté les 52 cartes !' : 'Vous n\'avez plus de cartes.'}
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Partie en cours</h2>
        <p className="text-green-300 mb-6">Interface de jeu — Phase 3</p>
        {gameState && (
          <div className="text-green-200 text-sm">
            {gameState.playerOrder.map((id) => (
              <p key={id}>
                {gameState.players[id]?.name} — {gameState.players[id]?.cardCount} cartes
                {id === myId ? ' (vous)' : ''}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
