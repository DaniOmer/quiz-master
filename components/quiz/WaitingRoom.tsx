"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { useSocket } from "@/store/useSocket";
import { copyToClipboard, shareContent } from "@/lib/utils";
import {
  Users,
  Copy,
  Share2,
  QrCode,
  Crown,
  Settings,
  Play,
  Clock,
  Hash,
  Target,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import QRCodeLib from "qrcode";
import Image from "next/image";

export function WaitingRoom() {
  const { currentRoom, currentPlayer, startGame, leaveRoom, isLoading } =
    useSocket();

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    if (currentRoom) {
      const roomUrl = `${window.location.origin}/room/${currentRoom.code}`;
      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      };
      QRCodeLib.toDataURL(roomUrl, qrOptions)
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
        });
    }
  }, [currentRoom]);

  if (!currentRoom || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la salle...</p>
        </motion.div>
      </div>
    );
  }

  const isHost = currentPlayer.isHost;
  const canStartGame = isHost && currentRoom.players.length >= 2;
  const roomUrl = `${window.location.origin}/room/${currentRoom.code}`;

  const handleCopyCode = async () => {
    const success = await copyToClipboard(currentRoom.code);
    if (success) {
      toast.success("Code copié dans le presse-papiers!");
    } else {
      toast.error("Impossible de copier le code");
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      toast.success("Lien copié dans le presse-papiers!");
    } else {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: "Rejoignez mon quiz QuizMaster!",
      text: `Code: ${currentRoom.code}`,
      url: roomUrl,
    });

    if (!success) {
      handleCopyLink();
    }
  };

  const handleStartGame = () => {
    if (canStartGame) {
      startGame();
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header avec animation */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mr-3"
            >
              <Sparkles className="h-8 w-8 text-purple-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Salle d&apos;Attente
            </h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="ml-3"
            >
              <Zap className="h-8 w-8 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-gray-600 mb-8">
            {isHost
              ? "Invitez vos amis et démarrez le quiz !"
              : "En attente que l&apos;hôte démarre le quiz..."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Informations de la salle - Design amélioré */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="xl:col-span-1"
          >
            <Card className="backdrop-blur-lg bg-white/80 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Settings className="mr-2 h-5 w-5" />
                  Informations du Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Code de la salle avec style amélioré */}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-4"
                  >
                    <div className="text-3xl font-bold tracking-wider">
                      {currentRoom.code}
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                      Code de la salle
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="w-full border-blue-200 hover:bg-blue-50"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="w-full border-purple-200 hover:bg-purple-50"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="w-full border-green-200 hover:bg-green-50"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {showQrCode && qrCodeUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: "auto" }}
                      exit={{ opacity: 0, scale: 0.8, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center overflow-hidden"
                    >
                      <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                        <Image
                          src={qrCodeUrl}
                          alt="QR Code"
                          width={256}
                          height={256}
                          className="mx-auto rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Scannez pour rejoindre
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Paramètres avec icônes colorées */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {[
                    {
                      icon: Users,
                      label: "Joueurs max",
                      value: currentRoom.settings.maxPlayers,
                      color: "text-blue-600",
                    },
                    {
                      icon: Hash,
                      label: "Questions",
                      value: currentRoom.settings.questionCount,
                      color: "text-green-600",
                    },
                    {
                      icon: Clock,
                      label: "Temps/question",
                      value: `${currentRoom.settings.timePerQuestion}s`,
                      color: "text-orange-600",
                    },
                    {
                      icon: Target,
                      label: "Difficulté",
                      value: currentRoom.settings.difficulty,
                      color: "text-purple-600",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="flex items-center text-sm text-gray-700">
                        <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Liste des joueurs avec avatars améliorés */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="xl:col-span-3"
          >
            <Card className="backdrop-blur-lg bg-white/80 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Joueurs ({currentRoom.players.length}/
                    {currentRoom.settings.maxPlayers})
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="h-5 w-5" />
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {currentRoom.players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.4,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          player.id === currentPlayer.id
                            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {/* Badge "Vous" animé */}
                        {player.id === currentPlayer.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg"
                          >
                            Vous
                          </motion.div>
                        )}

                        <div className="flex items-center space-x-4">
                          <PlayerAvatar
                            name={player.name}
                            size="lg"
                            isHost={player.isHost}
                            isOnline={true}
                            showBorder={player.id === currentPlayer.id}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-gray-900 truncate">
                                {player.name}
                              </span>
                              {player.isHost && (
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                </motion.div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {player.isHost ? (
                                <span className="flex items-center">
                                  <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                                  Organisateur
                                </span>
                              ) : (
                                "Participant"
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Message d'attente avec animation */}
                {currentRoom.players.length < 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-center text-gray-600 mt-4">
                      En attente d&apos;au moins 2 joueurs pour commencer...
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Partagez le code <strong>{currentRoom.code}</strong> avec
                      vos amis !
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions avec animations améliorées */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={handleLeaveRoom}
              className="px-8 py-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Quitter la salle
            </Button>
          </motion.div>

          {isHost && (
            <motion.div
              whileHover={{ scale: canStartGame ? 1.05 : 1 }}
              whileTap={{ scale: canStartGame ? 0.95 : 1 }}
            >
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame || isLoading}
                className={`px-10 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                  canStartGame
                    ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Démarrage...
                  </div>
                ) : (
                  <>
                    <Play className="mr-3 h-6 w-6" />
                    Commencer le Quiz
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions pour les non-hôtes */}
        {!isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              </motion.div>
              <p className="text-gray-700">
                Attendez que{" "}
                <strong className="text-purple-600">
                  {currentRoom.players.find((p) => p.isHost)?.name}
                </strong>{" "}
                démarre le quiz
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
