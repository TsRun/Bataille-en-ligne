import { createContext, useContext, useReducer, useEffect } from 'react'
import socket from '../socket'

const GameContext = createContext(null)

const initialState = {
  screen: 'home', // 'home' | 'waiting' | 'game' | 'over'
  roomId: null,
  myId: null,
  myName: '',
  gameState: null,
  lastEvent: null,
  opponentReady: false,
  error: null,
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
      return {
        ...state,
        screen: newScreen,
        myId: action.myId || state.myId,
        gameState: action.gameState,
        lastEvent: action.event,
        opponentReady: false,
        error: null,
      }
    }
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
    case 'ERROR':
      return { ...state, error: action.message }
    case 'RESET':
      return { ...initialState }
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

    socket.on('game_state', ({ gameState, event }) => {
      dispatch({ type: 'GAME_STATE', gameState, event, myId: socket.id })
    })

    socket.on('game_over', ({ gameState }) => {
      dispatch({ type: 'GAME_OVER', gameState })
    })

    socket.on('player_ready_ack', ({ playerId }) => {
      if (playerId !== socket.id) {
        dispatch({ type: 'OPPONENT_READY' })
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
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <GameContext.Provider value={{ state, createRoom, joinRoom, flipCard, reset }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
