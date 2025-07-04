'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSocket } from '@/store/useSocket'
import { 
  Users, 
  Hash, 
  Clock, 
  Target, 
  Sparkles, 
  Gamepad2,
  Zap,
  Trophy,
  Settings,
  Play,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomDialog({ open, onOpenChange }: CreateRoomDialogProps) {
  const { createRoom, isLoading } = useSocket()
  const [playerName, setPlayerName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('6')
  const [questionCount, setQuestionCount] = useState('10')
  const [timePerQuestion, setTimePerQuestion] = useState('30')
  const [category, setCategory] = useState('any')
  const [difficulty, setDifficulty] = useState('mixed')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }

    if (playerName.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères')
      return
    }

    if (playerName.trim().length > 20) {
      toast.error('Le nom ne peut pas dépasser 20 caractères')
      return
    }

    try {
      await createRoom(playerName.trim(), {
        maxPlayers: parseInt(maxPlayers),
        questionCount: parseInt(questionCount),
        timePerQuestion: parseInt(timePerQuestion),
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'mixed'
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error)
      toast.error('Impossible de créer la salle')
    }
  }

  const categories = [
    { value: 'any', label: '🌍 Toutes catégories', icon: '🌍' },
    { value: '9', label: '🧠 Culture générale', icon: '🧠' },
    { value: '17', label: '🔬 Science & Nature', icon: '🔬' },
    { value: '21', label: '⚽ Sports', icon: '⚽' },
    { value: '22', label: '🗺️ Géographie', icon: '🗺️' },
    { value: '23', label: '📚 Histoire', icon: '📚' },
    { value: '25', label: '🎨 Art & Littérature', icon: '🎨' },
    { value: '27', label: '🐾 Animaux', icon: '🐾' },
  ]

  const difficulties = [
    { value: 'mixed', label: '🎲 Mixte', icon: '🎲' },
    { value: 'easy', label: '😊 Facile', icon: '😊' },
    { value: 'medium', label: '🤔 Moyen', icon: '🤔' },
    { value: 'hard', label: '🔥 Difficile', icon: '🔥' },
  ]

  if (!open) return null

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-lg sticky top-0 z-10">
            <CardTitle className="flex items-center text-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <Sparkles className="h-7 w-7" />
              </motion.div>
              Créer un Quiz
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-3"
              >
                <Trophy className="h-7 w-7" />
              </motion.div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations du joueur */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Vos informations</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Votre nom *
                  </label>
                  <Input
                    type="text"
                    placeholder="Entrez votre nom..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    maxLength={20}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {playerName.length}/20 caractères
                  </p>
                </div>
              </motion.div>

              {/* Paramètres du quiz */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres du quiz</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre de joueurs */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      Nombre de joueurs max
                    </label>
                    <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} joueur{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Nombre de questions */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Hash className="h-4 w-4 mr-2 text-green-600" />
                      Nombre de questions
                    </label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} question{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Temps par question */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                      Temps par question
                    </label>
                    <Select value={timePerQuestion} onValueChange={setTimePerQuestion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[15, 20, 30, 45, 60].map((seconds) => (
                          <SelectItem key={seconds} value={seconds.toString()}>
                            {seconds} seconde{seconds > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Difficulté */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Target className="h-4 w-4 mr-2 text-red-600" />
                      Difficulté
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((diff) => (
                          <SelectItem key={diff.value} value={diff.value}>
                            {diff.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                {/* Catégorie */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Gamepad2 className="h-4 w-4 mr-2 text-purple-600" />
                    Catégorie
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              {/* Aperçu des paramètres */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
              >
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Aperçu de votre quiz
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="font-bold text-blue-600">{maxPlayers}</div>
                    <div className="text-gray-600">Joueurs max</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="font-bold text-green-600">{questionCount}</div>
                    <div className="text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="font-bold text-orange-600">{timePerQuestion}s</div>
                    <div className="text-gray-600">Par question</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="font-bold text-purple-600">
                      {difficulties.find(d => d.value === difficulty)?.icon}
                    </div>
                    <div className="text-gray-600">Difficulté</div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full h-12 border-gray-300 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    disabled={isLoading || !playerName.trim()}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                        />
                        Création...
                      </div>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Créer le Quiz
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
