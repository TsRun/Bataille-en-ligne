import { createContext, useContext, useReducer, useEffect } from 'react'
import socket from '../socket'

const GameContext = createContext(null)

const initialState = {
  screen: 'home', // 'home' | 'join' | 'waiting' | 'game' | 'over'
  roomId: null,
  myId: null,
  myName: '',
  gameState: null,
  lastEvent: null,
  lastResult: null, // { card1, card2, winnerId, cardsWon, event }
  myFlipped: false,
  opponentReady: false,
  error: null,
  history: [],    // last 5 turns: [{ turn, event, winnerId, cardsWon }]
  turnCount: 0,
  restartVoted: false,       // I clicked Rejouer
  opponentRestartVoted: false, // opponent clicked Rejouer
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MY_ID':
      return { ...state, myId: action.myId }
    case 'SET_NAME':
      return { ...state, myName: action.name }
    case 'ROOM_CREATED':
      return {
        ...state,
        screen: 'waiting',
        roomId: action.roomId,
        myId: action.myId,
        gameState: action.gameState,
        error: null,
      }
    case 'GAME_STATE': {
      const phase = action.gameState.phase
      const newScreen = phase === 'waiting' ? 'waiting' : phase === 'over' ? 'over' : 'game'
      const isRestart = action.event === 'game_restarted'
      const hasResult = !isRestart && !!action.card1
      const lastResult = hasResult
        ? { card1: action.card1, card2: action.card2, winnerId: action.winnerId, cardsWon: action.cardsWon, event: action.event }
        : isRestart ? null : state.lastResult
      const newTurnCount = isRestart ? 0 : hasResult ? state.turnCount + 1 : state.turnCount
      const newHistory = isRestart ? [] : hasResult
        ? [...state.history, { turn: newTurnCount, event: action.event, winnerId: action.winnerId, cardsWon: action.cardsWon }].slice(-5)
        : state.history
      return {
        ...state,
        screen: newScreen,
        myId: action.myId || state.myId,
        gameState: action.gameState,
        lastEvent: action.event,
        lastResult,
        myFlipped: false,
        opponentReady: false,
        error: null,
        history: newHistory,
        turnCount: newTurnCount,
        restartVoted: false,
        opponentRestartVoted: false,
      }
    }
    case 'MY_FLIPPED':
      return { ...state, myFlipped: true }
    case 'GAME_OVER':
      return {
        ...state,
        screen: 'over',
        gameState: action.gameState,
        lastEvent: 'game_over',
        opponentReady: false,
      }
    case 'OPPONENT_READY':
      return { ...state, opponentReady: true }
    case 'RESTART_VOTED':
      return { ...state, restartVoted: true }
    case 'OPPONENT_RESTART_VOTED':
      return { ...state, opponentRestartVoted: true }
    case 'ERROR':
      return { ...state, error: action.message }
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, myName: action.name || state.myName, error: null }
    case 'RESET':
      return { ...initialState, history: [], turnCount: 0 }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    socket.connect()

    socket.on('connect', () => {
      dispatch({ type: 'SET_MY_ID', myId: socket.id })
    })

    socket.on('room_created', ({ roomId, gameState }) => {
      dispatch({ type: 'ROOM_CREATED', roomId, gameState, myId: socket.id })
    })

    socket.on('game_state', ({ gameState, event, card1, card2, winnerId, cardsWon }) => {
      dispatch({ type: 'GAME_STATE', gameState, event, card1, card2, winnerId, cardsWon, myId: socket.id })
    })

    socket.on('game_over', ({ gameState }) => {
      dispatch({ type: 'GAME_OVER', gameState })
    })

    socket.on('player_ready_ack', ({ playerId }) => {
      if (playerId !== socket.id) {
        dispatch({ type: 'OPPONENT_READY' })
      }
    })

    socket.on('restart_vote', ({ playerId }) => {
      if (playerId !== socket.id) {
        dispatch({ type: 'OPPONENT_RESTART_VOTED' })
      }
    })

    socket.on('error', ({ message }) => {
      dispatch({ type: 'ERROR', message })
    })

    return () => {
      socket.off('connect')
      socket.off('room_created')
      socket.off('game_state')
      socket.off('game_over')
      socket.off('player_ready_ack')
      socket.off('restart_vote')
      socket.off('error')
      socket.disconnect()
    }
  }, [])

  const createRoom = (playerName) => {
    dispatch({ type: 'SET_NAME', name: playerName })
    socket.emit('create_room', { playerName })
  }

  const joinRoom = (roomId, playerName) => {
    dispatch({ type: 'SET_NAME', name: playerName })
    socket.emit('join_room', { roomId: roomId.trim().toUpperCase(), playerName })
  }

  const flipCard = () => {
    socket.emit('player_ready')
    dispatch({ type: 'MY_FLIPPED' })
  }

  const restartGame = () => {
    socket.emit('restart_game')
    dispatch({ type: 'RESTART_VOTED' })
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  const setScreen = (screen, name) => {
    dispatch({ type: 'SET_SCREEN', screen, name })
  }

  return (
    <GameContext.Provider value={{ state, createRoom, joinRoom, flipCard, restartGame, reset, setScreen }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
