import { GameProvider, useGame } from './context/GameContext'
import HomeScreen from './screens/HomeScreen'
import JoinScreen from './screens/JoinScreen'
import WaitingScreen from './screens/WaitingScreen'
import GameScreen from './screens/GameScreen'

function Router() {
  const { state } = useGame()

  switch (state.screen) {
    case 'home':
      return <HomeScreen />
    case 'join':
      return <JoinScreen />
    case 'waiting':
      return <WaitingScreen />
    case 'game':
    case 'over':
      return <GameScreen />
    default:
      return <HomeScreen />
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  )
}
