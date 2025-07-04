"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/store/useSocket";
import {
  Users,
  Hash,
  Sparkles,
  LogIn,
  User,
  QrCode,
  Link,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const { joinRoom, isLoading } = useSocket();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }

    if (playerName.trim().length < 2) {
      toast.error("Le nom doit contenir au moins 2 caractères");
      return;
    }

    if (playerName.trim().length > 20) {
      toast.error("Le nom ne peut pas dépasser 20 caractères");
      return;
    }

    if (!roomCode.trim()) {
      toast.error("Veuillez entrer le code de la salle");
      return;
    }

    if (roomCode.trim().length !== 6) {
      toast.error("Le code doit contenir exactement 6 caractères");
      return;
    }

    try {
      await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la connexion à la salle:", error);
      toast.error("Impossible de rejoindre la salle");
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setRoomCode(value);
  };

  if (!open) return null;

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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-t-lg sticky top-0 z-10">
            <CardTitle className="flex items-center text-2xl">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mr-3"
              >
                <Users className="h-7 w-7" />
              </motion.div>
              Rejoindre un Quiz
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-3"
              >
                <Sparkles className="h-7 w-7" />
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Vos informations
                  </h3>
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

              {/* Code de la salle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Hash className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Code de la salle
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Code à 6 caractères *
                  </label>
                  <Input
                    type="text"
                    placeholder="ABC123"
                    value={roomCode}
                    onChange={handleCodeChange}
                    className="h-12 text-2xl font-mono text-center tracking-widest border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Entrez le code partagé par l&apos;hôte
                  </p>
                </div>
              </motion.div>

              {/* Méthodes alternatives */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
              >
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                  Autres façons de rejoindre
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                  >
                    <QrCode className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Scanner QR Code
                      </div>
                      <div className="text-gray-600">Avec votre téléphone</div>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                  >
                    <Link className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Lien d&apos;invitation
                      </div>
                      <div className="text-gray-600">Cliquez sur le lien</div>
                    </div>
                  </motion.div>
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
                    disabled={
                      isLoading ||
                      !playerName.trim() ||
                      !roomCode.trim() ||
                      roomCode.length !== 6
                    }
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
                        Connexion...
                      </div>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Rejoindre le Quiz
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
  );
}
