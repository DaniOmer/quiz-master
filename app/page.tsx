'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateRoomDialog } from '@/components/quiz/CreateRoomDialog'
import { JoinRoomDialog } from '@/components/quiz/JoinRoomDialog'
import { WaitingRoom } from '@/components/quiz/WaitingRoom'
import { GameScreen } from '@/components/quiz/GameScreen'
import { ResultsScreen } from '@/components/quiz/ResultsScreen'
import { useSocket } from '@/store/useSocket'
import { 
  Users, 
  Zap, 
  Trophy, 
  Clock, 
  Gamepad2, 
  Sparkles,
  Play,
  UserPlus
} from 'lucide-react'

export default function HomePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const { connect, isConnected, currentRoom, gameState } = useSocket()
  const router = useRouter()

  useEffect(() => {
    connect()
  }, [connect])

  // Si on est dans une salle, afficher les composants de jeu directement
  if (currentRoom) {
    // Déterminer quel écran afficher
    if (currentRoom.isGameFinished || (gameState?.showResults && gameState.currentQuestionIndex >= currentRoom.questions.length)) {
      return <ResultsScreen />
    }

    if (currentRoom.isGameStarted && gameState) {
      return <GameScreen />
    }

    return <WaitingRoom />
  }

  const features = [
    {
      icon: Users,
      title: "Multijoueur",
      description: "Jusqu'à 10 joueurs simultanément"
    },
    {
      icon: Zap,
      title: "Temps Réel",
      description: "Synchronisation instantanée"
    },
    {
      icon: Trophy,
      title: "Classements",
      description: "Scores et podium en direct"
    },
    {
      icon: Clock,
      title: "Chronomètre",
      description: "Questions chronométrées"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Gamepad2 className="h-16 w-16 text-blue-600 mr-4" />
              <h1 className="text-6xl font-bold gradient-text">
                QuizMaster
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Créez et participez à des quiz multijoueur en temps réel avec vos amis. 
              Testez vos connaissances et amusez-vous ensemble !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => setCreateDialogOpen(true)}
                disabled={!isConnected}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Créer un Quiz
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => setJoinDialogOpen(true)}
                disabled={!isConnected}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Rejoindre un Quiz
              </Button>
            </div>

            {!isConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg"
              >
                <div className="spinner mr-2" />
                Connexion au serveur...
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin pour une expérience de quiz parfaite
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Commencez à jouer en quelques étapes simples
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Créez ou Rejoignez",
                description: "Créez une nouvelle salle ou rejoignez avec un code"
              },
              {
                step: "2",
                title: "Invitez vos Amis",
                description: "Partagez le code, QR code ou lien d'invitation"
              },
              {
                step: "3",
                title: "Jouez Ensemble",
                description: "Répondez aux questions et voyez qui gagne !"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Créez votre premier quiz maintenant et défiez vos amis !
            </p>
            <Button
              size="lg"
              onClick={() => setCreateDialogOpen(true)}
              disabled={!isConnected}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Commencer Maintenant
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dialogs */}
      <CreateRoomDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      <JoinRoomDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen} 
      />
    </div>
  )
}
