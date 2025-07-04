export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  answeredAt?: number;
  currentAnswer?: string;
  hasAnswered: boolean;
  lastAnswerTime: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isGameStarted: boolean;
  isGameFinished: boolean;
  currentQuestionIndex: number;
  questions: Question[];
  settings: GameSettings;
  createdAt: Date;
  questionStartTime?: number;
}

export interface GameSettings {
  maxPlayers: number;
  questionCount: number;
  timePerQuestion: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface GameState {
  currentQuestion?: Question | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  isQuestionActive?: boolean;
  scores: { [playerId: string]: number };
  answers?: { [playerId: string]: string };
  correctAnswer?: string;
  showResults: boolean;
}

export interface QuestionResult {
  playerId: string;
  playerName: string;
  answer: string;
  isCorrect: boolean;
  timeToAnswer: number;
  pointsEarned: number;
}

export interface FinalResults {
  players: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
    avatar: string;
  }>;
  totalQuestions: number;
  gameId: string;
}

// Socket Events
export interface ServerToClientEvents {
  'room:joined': (room: Room, player: Player) => void;
  'room:updated': (room: Room) => void;
  'room:error': (error: string) => void;
  'game:started': (room: Room) => void;
  'game:question': (question: Question, gameState: GameState) => void;
  'game:answer:result': (correctAnswer: string, gameState: GameState) => void;
  'game:answer:submitted': (isCorrect: boolean) => void;
  'game:scores': (scores: { [playerId: string]: number }) => void;
  'game:question:end': (correctAnswer: string, results: QuestionResult[]) => void;
  'game:finished': (finalResults: Array<{playerId: string, playerName: string, score: number}>) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'timer:update': (timeRemaining: number) => void;
}

export interface ClientToServerEvents {
  'room:create': (playerName: string, settings: GameSettings) => void;
  'room:join': (code: string, playerName: string) => void;
  'room:leave': () => void;
  'game:start': () => void;
  'game:answer': (answer: string) => void;
  'player:ready': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  roomId: string;
}

// API Types
export interface TriviaApiQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaApiResponse {
  response_code: number;
  results: TriviaApiQuestion[];
}

export interface QuizCategory {
  id: number;
  name: string;
}

// UI Types
export type GamePhase = 'lobby' | 'waiting' | 'question' | 'results' | 'finished';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

// Correction Types
export interface PlayerAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface CorrectionData {
  questions: Question[];
  playerAnswers: PlayerAnswer[];
  playerName: string;
  totalScore: number;
}
