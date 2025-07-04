'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  X, 
  Target, 
  Clock,
  Award,
  TrendingUp
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
  timeLimit: number
}

interface PlayerAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

interface CorrectionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  playerAnswers: PlayerAnswer[]
  playerName: string
  totalScore: number
}

export function CorrectionSheet({ 
  open, 
  onOpenChange, 
  questions, 
  playerAnswers, 
  playerName, 
  totalScore 
}: CorrectionSheetProps) {
  if (!open) return null

  const correctAnswers = playerAnswers.filter(a => a.isCorrect).length
  const accuracy = Math.round((correctAnswers / questions.length) * 100)
  const averageTime = Math.round(
    playerAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / playerAnswers.length
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getAnswerStatus = (questionId: string) => {
    const playerAnswer = playerAnswers.find(a => a.questionId === questionId)
    return playerAnswer?.isCorrect ? 'correct' : 'incorrect'
  }

  const getPlayerAnswer = (questionId: string) => {
    return playerAnswers.find(a => a.questionId === questionId)?.answer || 'Pas de réponse'
  }

  const getTimeSpent = (questionId: string) => {
    return playerAnswers.find(a => a.questionId === questionId)?.timeSpent || 0
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-3xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center">
                <Eye className="h-8 w-8 mr-3" />
                Fiche de Correction
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Statistiques du joueur */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-white/20 rounded-xl">
                <Award className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalScore}</div>
                <div className="text-sm opacity-90">Points</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{correctAnswers}/{questions.length}</div>
                <div className="text-sm opacity-90">Bonnes réponses</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm opacity-90">Précision</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{averageTime}s</div>
                <div className="text-sm opacity-90">Temps moyen</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
              {questions.map((question, index) => {
                const status = getAnswerStatus(question.id)
                const playerAnswer = getPlayerAnswer(question.id)
                const timeSpent = getTimeSpent(question.id)
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Question Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-600">{question.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{timeSpent}s / {question.timeLimit}s</span>
                          </div>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                            status === 'correct' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'correct' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {status === 'correct' ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 
                        className="text-lg font-semibold text-gray-900"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    </div>

                    {/* Réponses */}
                    <div className="p-4 space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = option === question.correctAnswer
                        const isPlayerAnswer = option === playerAnswer
                        
                        let bgColor = 'bg-gray-50'
                        let textColor = 'text-gray-700'
                        let borderColor = 'border-gray-200'
                        let icon = null
                        
                        if (isCorrect) {
                          bgColor = 'bg-green-100'
                          textColor = 'text-green-800'
                          borderColor = 'border-green-300'
                          icon = <CheckCircle className="h-5 w-5 text-green-600" />
                        } else if (isPlayerAnswer && !isCorrect) {
                          bgColor = 'bg-red-100'
                          textColor = 'text-red-800'
                          borderColor = 'border-red-300'
                          icon = <XCircle className="h-5 w-5 text-red-600" />
                        }
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 ${bgColor} ${borderColor} transition-all duration-200`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span 
                                className={`${textColor} font-medium`}
                                dangerouslySetInnerHTML={{ __html: option }}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isPlayerAnswer && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Votre réponse
                                </span>
                              )}
                              {isCorrect && (
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                  Bonne réponse
                                </span>
                              )}
                              {icon}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
          </CardContent>
          
          {/* Footer fixe */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
            <div className="flex justify-center">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
              >
                Fermer la correction
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
