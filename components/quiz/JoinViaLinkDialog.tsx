'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSocket } from '@/store/useSocket'
import { 
  User, 
  Link, 
  Loader2,
  Users,
  Clock,
  Target
} from 'lucide-react'

interface JoinViaLinkDialogProps {
  roomCode: string
  onCancel: () => void
}

export function JoinViaLinkDialog({ roomCode, onCancel }: JoinViaLinkDialogProps) {
  const [playerName, setPlayerName] = useState('')
  const { joinRoom, isLoading, error } = useSocket()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      joinRoom(roomCode, playerName.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto"
            >
              <Link className="h-8 w-8 text-white" />
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Rejoindre le Quiz
              </CardTitle>
              <p className="text-gray-600">
                Vous avez été invité à rejoindre la salle
              </p>
              <div className="mt-3 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Users className="h-4 w-4 mr-2" />
                Code: {roomCode}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="playerName" className="text-sm font-medium text-gray-700">
                  Votre nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Entrez votre nom"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="pl-10 h-12 text-lg"
                    maxLength={20}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Maximum 20 caractères
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                
                <Button
                  type="submit"
                  disabled={!playerName.trim() || isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5 mr-2" />
                      Rejoindre
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Temps réel</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  <span>Multijoueur</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
