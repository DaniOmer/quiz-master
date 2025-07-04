"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/store/useSocket";
import {
  Users,
  Trophy,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Star,
  Brain,
  Eye,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/player-avatar";

export function GameScreen() {
  const { currentRoom, gameState, currentPlayer, submitAnswer, isLoading } =
    useSocket();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeProgress, setTimeProgress] = useState(100);
  const [showCorrection, setShowCorrection] = useState(false);

  useEffect(() => {
    if (gameState?.timeRemaining && gameState.currentQuestion) {
      const totalTime = gameState.currentQuestion.timeLimit || 30;
      const progress = (gameState.timeRemaining / totalTime) * 100;
      setTimeProgress(progress);
    }
  }, [gameState?.timeRemaining, gameState?.currentQuestion]);

  useEffect(() => {
    if (gameState?.isQuestionActive && !gameState.showResults) {
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowCorrection(false);
    }
  }, [
    gameState?.currentQuestionIndex,
    gameState?.isQuestionActive,
    gameState?.showResults,
  ]);

  useEffect(() => {
    if (gameState?.showResults && gameState.correctAnswer && hasAnswered) {
      setShowCorrection(true);
    }
  }, [gameState?.showResults, gameState?.correctAnswer, hasAnswered]);

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered || !gameState?.isQuestionActive) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);
    submitAnswer(answer);
  };

  const getAnswerButtonStyle = (answer: string) => {
    if (showCorrection && gameState?.correctAnswer) {
      const isCorrect = answer === gameState.correctAnswer;
      const isSelected = answer === selectedAnswer;

      if (isCorrect) {
        return "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-xl transform scale-105";
      } else if (isSelected && !isCorrect) {
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-xl";
      } else {
        return "bg-gray-100 text-gray-700 border-gray-200 opacity-60";
      }
    }

    if (hasAnswered) {
      return selectedAnswer === answer
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-xl transform scale-105"
        : "bg-gray-100 text-gray-700 border-gray-200 opacity-60";
    }

    return selectedAnswer === answer
      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-xl transform scale-105"
      : "bg-white hover:bg-blue-50 text-gray-900 border-gray-200 hover:border-blue-300 hover:shadow-lg";
  };

  const getAnswerIcon = (answer: string) => {
    if (!showCorrection || !gameState?.correctAnswer) return null;

    const isCorrect = answer === gameState.correctAnswer;
    const isSelected = answer === selectedAnswer;

    if (isCorrect) {
      return <CheckCircle className="h-6 w-6" />;
    } else if (isSelected && !isCorrect) {
      return <XCircle className="h-6 w-6" />;
    }

    return null;
  };

  const getTimeColor = () => {
    if (gameState?.timeRemaining && gameState.timeRemaining <= 10)
      return "text-orange-500";
    if (timeProgress > 60) return "text-green-500";
    if (timeProgress > 30) return "text-yellow-500";
    return "text-red-500";
  };

  if (!currentRoom || !gameState || !gameState.currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentQuestion = gameState.currentQuestion;
  const questionNumber = (gameState.currentQuestionIndex || 0) + 1;
  const totalQuestions = currentRoom.settings.questionCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Joueur actuel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 inline-flex items-center space-x-4">
            <PlayerAvatar
              name={currentPlayer?.name || ""}
              size="md"
              isHost={currentPlayer?.isHost || false}
              showBorder={true}
            />
            <div>
              <p className="text-white font-bold text-lg">
                {currentPlayer?.name}
              </p>
              <p className="text-white/70 text-sm">
                {currentPlayer?.isHost ? "Organisateur" : "Participant"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Header avec timer circulaire */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          {/* Info question */}
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
            >
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-white" />
                <span className="text-white font-bold text-lg">
                  Question {questionNumber}/{totalQuestions}
                </span>
              </div>
            </motion.div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-white/80" />
                <span className="text-white/90 font-medium">
                  {currentRoom.players.length} joueurs
                </span>
              </div>
            </div>
          </div>

          {/* Timer circulaire */}
          <motion.div
            animate={{
              scale: timeProgress < 10 ? [1, 1.1, 1] : 1,
              rotate: timeProgress < 5 ? [0, 5, -5, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: timeProgress < 10 ? Infinity : 0,
            }}
            className="relative"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTimeColor()}`}>
                  {gameState.timeRemaining}
                </div>
                <div className="text-xs text-white/70">sec</div>
              </div>
            </div>

            {/* Progress circle */}
            <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="44"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: timeProgress / 100 }}
                transition={{ duration: 0.5 }}
                style={{
                  strokeDasharray: "276.46",
                  strokeDashoffset: `${276.46 * (1 - timeProgress / 100)}`,
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    stopColor={
                      timeProgress > 60
                        ? "#10b981"
                        : timeProgress > 30
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      timeProgress > 60
                        ? "#059669"
                        : timeProgress > 30
                        ? "#d97706"
                        : "#dc2626"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={gameState.currentQuestionIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center space-x-3 mb-4"
                >
                  <Target className="h-6 w-6 text-white" />
                  <span className="text-white/90 font-medium uppercase tracking-wider text-sm">
                    {currentQuestion.category} • {currentQuestion.difficulty}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white text-center leading-tight"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
              </div>

              {/* Correction Banner */}
              <AnimatePresence>
                {showCorrection && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200"
                  >
                    <div className="p-4 flex items-center justify-center space-x-3">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Correction affichée - La bonne réponse est mise en
                        évidence
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options de réponse */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {currentQuestion.options.map((answer, index) => (
                      <motion.div
                        key={answer}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.4 + index * 0.1,
                          type: "spring",
                        }}
                        whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                        whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                      >
                        <Button
                          onClick={() => handleAnswerSelect(answer)}
                          disabled={
                            hasAnswered ||
                            !gameState.isQuestionActive ||
                            isLoading
                          }
                          className={`w-full h-20 text-left justify-start text-lg font-medium transition-all duration-500 rounded-2xl border-2 ${getAnswerButtonStyle(
                            answer
                          )}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-lg font-bold">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span
                                className="flex-1 text-left"
                                dangerouslySetInnerHTML={{ __html: answer }}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              {getAnswerIcon(answer)}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statut de réponse */}
        <AnimatePresence>
          {hasAnswered && !showCorrection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/30">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium text-lg">
                  Réponse envoyée ! En attente des autres joueurs...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scores en temps réel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Trophy className="h-6 w-6 mr-3 text-yellow-400" />
                  Classement en direct
                </h3>
                <div className="flex items-center space-x-2 text-white/70">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentRoom.players
                  .sort(
                    (a, b) =>
                      (gameState.scores[b.id] || 0) -
                      (gameState.scores[a.id] || 0)
                  )
                  .map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`relative p-4 rounded-2xl transition-all duration-300 ${
                        player.id === currentPlayer?.id
                          ? "bg-white/30 border-2 border-yellow-400 shadow-lg"
                          : "bg-white/10 border border-white/20"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <PlayerAvatar
                            name={player.name}
                            size="md"
                            isHost={player.isHost}
                          />
                          {index < 3 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                              <Star className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium text-sm truncate max-w-20">
                            {player.name}
                          </p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {gameState.scores[player.id] || 0}
                          </p>
                          <p className="text-white/60 text-xs">#{index + 1}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
