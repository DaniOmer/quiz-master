'use client'

import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { 
  Room, 
  Player, 
  GameState, 
  Question, 
  QuestionResult, 
  FinalResults,
  GameSettings,
  ServerToClientEvents,
  ClientToServerEvents
} from '@/shared/types'
import toast from 'react-hot-toast'

interface SocketStore {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  isConnected: boolean
  currentPlayer: Player | null
  currentRoom: Room | null
  gameState: GameState | null
  playerAnswers: { [questionId: string]: { answer: string, isCorrect: boolean, timeSpent: number } }
  isLoading: boolean
  error: string | null
  
  // Actions
  connect: () => void
  disconnect: () => void
  createRoom: (playerName: string, settings: GameSettings) => void
  joinRoom: (code: string, playerName: string) => void
  leaveRoom: () => void
  startGame: () => void
  submitAnswer: (answer: string) => void
  setPlayerReady: () => void
  clearError: () => void
}

export const useSocket = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  currentPlayer: null,
  currentRoom: null,
  gameState: null,
  playerAnswers: {},
  isLoading: false,
  error: null,

  connect: () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8003'
    
    if (get().socket?.connected) {
      return
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('Connected to server')
      set({ isConnected: true, error: null })
      toast.success('Connecté au serveur')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      set({ isConnected: false })
      toast.error('Connexion perdue')
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      set({ error: 'Erreur de connexion au serveur', isConnected: false })
      toast.error('Impossible de se connecter au serveur')
    })

    // Room events
    socket.on('room:joined', (room: Room) => {
      console.log('Room joined:', room)
      const currentPlayer = room.players.find(p => p.id === socket.id)
      set({ 
        currentRoom: room, 
        currentPlayer,
        isLoading: false,
        error: null 
      })
      toast.success(`Salle rejointe: ${room.code}`)
    })

    socket.on('room:updated', (room: Room) => {
      console.log('Room updated:', room)
      const currentPlayer = room.players.find(p => p.id === socket.id)
      set({ 
        currentRoom: room,
        currentPlayer
      })
    })

    socket.on('room:error', (error: string) => {
      console.error('Room error:', error)
      set({ error, isLoading: false })
      toast.error(error)
    })

    socket.on('game:started', (room: Room) => {
      console.log('Game started:', room)
      const initialGameState: GameState = {
        currentQuestionIndex: 0,
        timeRemaining: room.settings.timePerQuestion,
        isQuestionActive: false,
        showResults: false,
        scores: room.players.reduce((acc, p) => ({ ...acc, [p.id]: p.score }), {}),
        answers: {}
      }
      set({ 
        currentRoom: room,
        gameState: initialGameState 
      })
      toast.success('Le jeu commence!')
    })

    socket.on('game:question', (question: Question, gameState: GameState) => {
      console.log('New question:', question, gameState)
      set({ 
        gameState: {
          ...gameState,
          currentQuestion: question,
          isQuestionActive: true,
          showResults: false,
          answers: {},
          correctAnswer: undefined
        }
      })
    })

    socket.on('game:answer:submitted', (isCorrect: boolean) => {
      console.log('Answer submitted:', isCorrect)
    })

    socket.on('game:answer:result', (result: QuestionResult) => {
      console.log('Answer result:', result)
      const { gameState } = get()
      if (gameState) {
        set({
          gameState: {
            ...gameState,
            answers: {
              ...gameState.answers,
              [result.playerId]: result.answer
            }
          }
        })
      }
    })

    socket.on('game:scores', (scores: { [playerId: string]: number }) => {
      console.log('Scores updated:', scores)
      const { gameState } = get()
      if (gameState) {
        set({
          gameState: {
            ...gameState,
            scores
          }
        })
      }
    })

    socket.on('game:question:end', (correctAnswer: string, results: QuestionResult[]) => {
      console.log('Question ended:', correctAnswer, results)
      const { gameState, currentPlayer, playerAnswers } = get()
      if (gameState && currentPlayer && gameState.currentQuestion) {
        const playerResult = results.find(r => r.playerId === currentPlayer.id)
        
        if (playerResult) {
          const newPlayerAnswers = {
            ...playerAnswers,
            [gameState.currentQuestion.id]: {
              answer: playerResult.answer,
              isCorrect: playerResult.isCorrect,
              timeSpent: playerResult.timeToAnswer
            }
          }
          
          set({
            playerAnswers: newPlayerAnswers,
            gameState: {
              ...gameState,
              correctAnswer,
              isQuestionActive: false,
              showResults: true
            }
          })
        } else {
          set({
            gameState: {
              ...gameState,
              correctAnswer,
              isQuestionActive: false,
              showResults: true
            }
          })
        }
      }
    })

    socket.on('game:finished', (finalResults: FinalResults) => {
      console.log('Game finished:', finalResults)
      set({ 
        gameState: {
          ...get().gameState!,
          showResults: true,
          isQuestionActive: false
        }
      })
      toast.success('Jeu terminé!')
    })

    socket.on('player:joined', (player: Player) => {
      console.log('Player joined:', player)
      toast.success(`${player.name} a rejoint la partie`)
    })

    socket.on('player:left', (playerId: string) => {
      console.log('Player left:', playerId)
      const { currentRoom } = get()
      if (currentRoom) {
        const player = currentRoom.players.find(p => p.id === playerId)
        if (player) {
          toast.success(`${player.name} a quitté la partie`)
        }
      }
    })

    socket.on('timer:update', (timeRemaining: number) => {
      const { gameState } = get()
      if (gameState) {
        set({
          gameState: {
            ...gameState,
            timeRemaining
          }
        })
      }
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ 
        socket: null, 
        isConnected: false, 
        currentPlayer: null, 
        currentRoom: null,
        gameState: null 
      })
    }
  },

  createRoom: (playerName: string, settings: GameSettings) => {
    const { socket } = get()
    if (socket) {
      set({ isLoading: true, error: null })
      socket.emit('room:create', playerName, settings)
    }
  },

  joinRoom: (code: string, playerName: string) => {
    const { socket } = get()
    if (socket) {
      set({ isLoading: true, error: null })
      socket.emit('room:join', code, playerName)
    }
  },

  leaveRoom: () => {
    const { socket } = get()
    if (socket) {
      socket.emit('room:leave')
      set({ 
        currentRoom: null, 
        currentPlayer: null, 
        gameState: null,
        playerAnswers: {},
        error: null,
        isLoading: false
      })
    }
  },

  startGame: () => {
    const { socket } = get()
    if (socket) {
      socket.emit('game:start')
    }
  },

  submitAnswer: (answer: string) => {
    const { socket } = get()
    if (socket) {
      socket.emit('game:answer', answer)
    }
  },

  setPlayerReady: () => {
    const { socket } = get()
    if (socket) {
      socket.emit('player:ready')
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))
