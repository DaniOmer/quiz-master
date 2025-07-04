'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/store/useSocket'
import { WaitingRoom } from '@/components/quiz/WaitingRoom'
import { GameScreen } from '@/components/quiz/GameScreen'
import { ResultsScreen } from '@/components/quiz/ResultsScreen'
import { JoinViaLinkDialog } from '@/components/quiz/JoinViaLinkDialog'

interface RoomPageProps {
  params: {
    id: string
  }
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter()
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const { 
    currentRoom, 
    gameState, 
    isConnected, 
    connect,
    leaveRoom,
    joinRoom,
    error
  } = useSocket()

  useEffect(() => {
    if (!isConnected) {
      connect()
    }
  }, [isConnected, connect])

  useEffect(() => {
    // Si connecté mais pas dans une salle, afficher le dialogue de connexion
    if (isConnected && !currentRoom && params.id && !showJoinDialog) {
      setShowJoinDialog(true)
    }
  }, [isConnected, currentRoom, params.id, showJoinDialog])

  useEffect(() => {
    // Fermer le dialogue quand on rejoint une salle
    if (currentRoom && showJoinDialog) {
      setShowJoinDialog(false)
    }
  }, [currentRoom, showJoinDialog])

  const handleCancelJoin = () => {
    setShowJoinDialog(false)
    router.push('/')
  }

  useEffect(() => {
    // Si erreur de salle, rediriger vers l'accueil après un délai
    if (error && error.includes('salle')) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, router])

  useEffect(() => {
    // Cleanup lors du démontage du composant
    return () => {
      if (currentRoom) {
        leaveRoom()
      }
    }
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600">Connexion au serveur...</p>
        </div>
      </div>
    )
  }

  // Afficher le dialogue de connexion si nécessaire
  if (showJoinDialog && params.id) {
    return (
      <JoinViaLinkDialog 
        roomCode={params.id.toUpperCase()} 
        onCancel={handleCancelJoin}
      />
    )
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chargement de la salle...
          </h1>
          <p className="text-gray-600 mb-6">
            Code de la salle : {params.id}
          </p>
          <p className="text-sm text-gray-500">
            Si cette page ne se charge pas, la salle n'existe peut-être pas.
          </p>
        </div>
      </div>
    )
  }

  // Déterminer quel écran afficher
  if (currentRoom.isGameFinished || (gameState?.showResults && gameState.currentQuestionIndex >= currentRoom.questions.length)) {
    return <ResultsScreen />
  }

  if (currentRoom.isGameStarted && gameState) {
    return <GameScreen />
  }

  return <WaitingRoom />
}
