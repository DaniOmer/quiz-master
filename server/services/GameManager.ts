import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { QuestionService } from './QuestionService'
import { 
  Room, 
  Player, 
  GameSettings, 
  Question, 
  GameState,
  QuestionResult,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from '../../shared/types'

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type ServerType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export class GameManager {
  private rooms: Map<string, Room> = new Map()
  private playerRooms: Map<string, string> = new Map()
  private questionService: QuestionService
  private gameTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(private io: ServerType) {
    this.questionService = new QuestionService()
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    if (this.rooms.has(code)) {
      return this.generateRoomCode()
    }
    
    return code
  }

  private generateAvatar(): string {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  async createRoom(socket: SocketType, playerName: string, settings: GameSettings): Promise<void> {
    const roomId = uuidv4()
    const roomCode = this.generateRoomCode()
    
    const hostPlayer: Player = {
      id: socket.id,
      name: playerName,
      isHost: true,
      score: 0,
      avatar: this.generateAvatar(),
      isReady: false,
      hasAnswered: false,
      lastAnswerTime: 0
    }

    const questions = await this.questionService.getQuestions(settings)

    const room: Room = {
      id: roomId,
      code: roomCode,
      hostId: socket.id,
      players: [hostPlayer],
      maxPlayers: settings.maxPlayers,
      settings,
      questions,
      isGameStarted: false,
      isGameFinished: false,
      currentQuestionIndex: 0,
      createdAt: new Date()
    }

    this.rooms.set(roomCode.toUpperCase(), room)
    this.playerRooms.set(socket.id, roomCode.toUpperCase())

    await socket.join(roomCode.toUpperCase())

    socket.emit('room:joined', room, hostPlayer)
    
    console.log(`Salle créée: ${roomCode} par ${playerName}`)
  }

  async joinRoom(socket: SocketType, code: string, playerName: string): Promise<void> {
    const room = this.rooms.get(code.toUpperCase())
    
    if (!room) {
      socket.emit('room:error', 'Salle introuvable')
      return
    }

    if (room.isGameStarted) {
      socket.emit('room:error', 'Le jeu a déjà commencé')
      return
    }

    if (room.players.length >= room.settings.maxPlayers) {
      socket.emit('room:error', 'Salle complète')
      return
    }

    if (room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      socket.emit('room:error', 'Ce nom est déjà pris')
      return
    }

    const newPlayer: Player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      score: 0,
      avatar: this.generateAvatar(),
      isReady: false,
      hasAnswered: false,
      lastAnswerTime: 0
    }

    room.players.push(newPlayer)
    this.playerRooms.set(socket.id, code.toUpperCase())

    await socket.join(code.toUpperCase())

    this.io.to(code.toUpperCase()).emit('room:updated', room)
    this.io.to(code.toUpperCase()).emit('player:joined', newPlayer)

    socket.emit('room:joined', room, newPlayer)

    console.log(`${playerName} a rejoint la salle ${code}`)
  }

  leaveRoom(socket: SocketType): void {
    const roomCode = this.playerRooms.get(socket.id)
    if (!roomCode) return

    const room = this.rooms.get(roomCode)
    if (!room) return

    room.players = room.players.filter(p => p.id !== socket.id)
    this.playerRooms.delete(socket.id)

    socket.leave(roomCode)

    if (room.hostId === socket.id && room.players.length > 0) {
      room.players[0].isHost = true
      room.hostId = room.players[0].id
    }

    if (room.players.length === 0) {
      this.rooms.delete(roomCode)
      this.clearGameTimer(roomCode)
      console.log(`Salle ${roomCode} supprimée (vide)`)
    } else {
      this.io.to(roomCode).emit('room:updated', room)
      this.io.to(roomCode).emit('player:left', socket.id)
    }

    console.log(`Joueur ${socket.id} a quitté la salle ${roomCode}`)
  }

  async startGame(socket: SocketType): Promise<void> {
    const roomCode = this.playerRooms.get(socket.id)
    if (!roomCode) {
      socket.emit('room:error', 'Vous n\'êtes dans aucune salle')
      return
    }

    const room = this.rooms.get(roomCode)
    if (!room) {
      socket.emit('room:error', 'Salle introuvable')
      return
    }

    if (room.hostId !== socket.id) {
      socket.emit('room:error', 'Seul l\'hôte peut démarrer le jeu')
      return
    }

    if (room.players.length < 2) {
      socket.emit('room:error', 'Il faut au moins 2 joueurs pour commencer')
      return
    }

    if (room.isGameStarted) {
      socket.emit('room:error', 'Le jeu a déjà commencé')
      return
    }

    room.isGameStarted = true
    room.currentQuestionIndex = 0

    room.players.forEach(player => {
      player.score = 0
      player.isReady = false
      player.hasAnswered = false
      player.lastAnswerTime = 0
    })

    this.io.to(roomCode).emit('game:started', room)

    setTimeout(() => {
      this.startQuestion(roomCode)
    }, 3000) 

    console.log(`Jeu démarré dans la salle ${roomCode}`)
  }

  private startQuestion(roomCode: string): void {
    const room = this.rooms.get(roomCode)
    if (!room || !room.isGameStarted) return

    const question = room.questions[room.currentQuestionIndex]
    if (!question) {
      this.endGame(roomCode)
      return
    }

    room.questionStartTime = Date.now()

    room.players.forEach(player => {
      player.hasAnswered = false
      player.lastAnswerTime = 0
    })

    const gameState: GameState = {
      currentQuestionIndex: room.currentQuestionIndex,
      timeRemaining: room.settings.timePerQuestion,
      showResults: false,
      scores: room.players.reduce((acc, p) => ({ ...acc, [p.id]: p.score }), {})
    }

    this.io.to(roomCode).emit('game:question', question, gameState)

    this.startQuestionTimer(roomCode, room.settings.timePerQuestion)

    console.log(`Question ${room.currentQuestionIndex + 1} envoyée dans la salle ${roomCode}`)
  }

  private startQuestionTimer(roomCode: string, timeLimit: number): void {
    this.clearGameTimer(roomCode)

    let timeRemaining = timeLimit

    const timer = setInterval(() => {
      timeRemaining--
      
      this.io.to(roomCode).emit('timer:update', timeRemaining)

      if (timeRemaining <= 0) {
        clearInterval(timer)
        this.endQuestion(roomCode)
      }
    }, 1000)

    this.gameTimers.set(roomCode, timer)
  }

  private endQuestion(roomCode: string): void {
    const room = this.rooms.get(roomCode)
    if (!room) return

    this.clearGameTimer(roomCode)

    const question = room.questions[room.currentQuestionIndex]
    if (!question) return

    room.players.forEach(player => {
      if (player.hasAnswered && player.currentAnswer === question.correctAnswer) {
        const timeSpent = room.questionStartTime 
          ? Math.max(1, (player.lastAnswerTime - room.questionStartTime) / 1000)
          : room.settings.timePerQuestion / 2 // 
        
        const timeBonus = Math.max(0, room.settings.timePerQuestion - timeSpent)
        const speedMultiplier = timeBonus / room.settings.timePerQuestion
        const bonusPoints = Math.floor(speedMultiplier * 500) 
        
        player.score += 1000 + bonusPoints
        
        console.log(`${player.name} a gagné ${1000 + bonusPoints} points (temps: ${timeSpent.toFixed(1)}s)`)
      } else if (player.hasAnswered) {
        console.log(`${player.name} a donné une mauvaise réponse: ${player.currentAnswer}`)
      }
    })

    const gameState: GameState = {
      currentQuestionIndex: room.currentQuestionIndex,
      timeRemaining: 0,
      showResults: true,
      scores: room.players.reduce((acc, p) => ({ ...acc, [p.id]: p.score }), {})
    }

    const questionResults: QuestionResult[] = room.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      answer: player.currentAnswer || '',
      isCorrect: player.currentAnswer === question.correctAnswer,
      timeToAnswer: room.questionStartTime 
        ? Math.max(1, (player.lastAnswerTime - room.questionStartTime) / 1000)
        : room.settings.timePerQuestion / 2,
      pointsEarned: player.hasAnswered && player.currentAnswer === question.correctAnswer 
        ? (() => {
            const timeSpent = room.questionStartTime 
              ? Math.max(1, (player.lastAnswerTime - room.questionStartTime) / 1000)
              : room.settings.timePerQuestion / 2
            const timeBonus = Math.max(0, room.settings.timePerQuestion - timeSpent)
            const speedMultiplier = timeBonus / room.settings.timePerQuestion
            const bonusPoints = Math.floor(speedMultiplier * 500)
            return 1000 + bonusPoints
          })()
        : 0
    }))

    this.io.to(roomCode).emit('game:answer:result', question.correctAnswer, gameState)
    this.io.to(roomCode).emit('game:question:end', question.correctAnswer, questionResults)

    setTimeout(() => {
      room.currentQuestionIndex++
      if (room.currentQuestionIndex >= room.questions.length) {
        this.endGame(roomCode)
      } else {
        this.startQuestion(roomCode)
      }
    }, 5000)
  }

  submitAnswer(socket: SocketType, answer: string): void {
    const roomCode = this.playerRooms.get(socket.id)
    if (!roomCode) return

    const room = this.rooms.get(roomCode)
    if (!room || !room.isGameStarted) return

    const player = room.players.find(p => p.id === socket.id)
    if (!player || player.hasAnswered) return

    const question = room.questions[room.currentQuestionIndex]
    if (!question) return

    player.hasAnswered = true
    player.currentAnswer = answer
    player.lastAnswerTime = Date.now()

    const isCorrect = answer === question.correctAnswer

    socket.emit('game:answer:submitted', isCorrect)

    const allAnswered = room.players.every(p => p.hasAnswered)
    if (allAnswered) {
      this.endQuestion(roomCode)
    }

    console.log(`${player.name} a répondu: ${answer} (${isCorrect ? 'correct' : 'incorrect'})`)
  }

  private endGame(roomCode: string): void {
    const room = this.rooms.get(roomCode)
    if (!room) return

    this.clearGameTimer(roomCode)

    room.isGameFinished = true

    const finalScores = room.players
      .map(p => ({ playerId: p.id, playerName: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score)

    this.io.to(roomCode).emit('room:updated', room)

    this.io.to(roomCode).emit('game:finished', finalScores)

    console.log(`Jeu terminé dans la salle ${roomCode}`)
  }

  setPlayerReady(socket: SocketType): void {
    const roomCode = this.playerRooms.get(socket.id)
    if (!roomCode) return

    const room = this.rooms.get(roomCode)
    if (!room) return

    const player = room.players.find(p => p.id === socket.id)
    if (!player) return

    player.isReady = true

    this.io.to(roomCode).emit('room:updated', room)
  }

  handleDisconnection(socket: SocketType): void {
    this.leaveRoom(socket)
  }

  private clearGameTimer(roomCode: string): void {
    const timer = this.gameTimers.get(roomCode)
    if (timer) {
      clearTimeout(timer)
      this.gameTimers.delete(roomCode)
    }
  }

  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: this.playerRooms.size,
      activeGames: Array.from(this.rooms.values()).filter(r => r.isGameStarted && !r.isGameFinished).length
    }
  }
}
