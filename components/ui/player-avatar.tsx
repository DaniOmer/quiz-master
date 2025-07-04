"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PlayerAvatarProps {
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showBorder?: boolean
  isHost?: boolean
  isOnline?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg"
}

// Génère un avatar basé sur le nom
const generateAvatarUrl = (name: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '')
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`
}

// Couleurs de fallback basées sur le nom
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-purple-400 to-purple-600", 
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-yellow-400 to-yellow-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-indigo-400 to-indigo-600",
    "bg-gradient-to-br from-teal-400 to-teal-600",
  ]
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

export function PlayerAvatar({ 
  name, 
  size = "md", 
  className, 
  showBorder = false,
  isHost = false,
  isOnline = true 
}: PlayerAvatarProps) {
  const avatarUrl = generateAvatarUrl(name)
  const fallbackColor = getAvatarColor(name)
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="relative">
      <Avatar 
        className={cn(
          sizeClasses[size],
          showBorder && "ring-2 ring-white ring-offset-2",
          isHost && "ring-2 ring-yellow-400 ring-offset-2",
          className
        )}
      >
        <AvatarImage 
          src={avatarUrl} 
          alt={`Avatar de ${name}`}
          className="object-cover"
        />
        <AvatarFallback 
          className={cn(
            fallbackColor,
            "text-white font-semibold shadow-lg"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Indicateur en ligne */}
      {isOnline && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full bg-green-500 border-2 border-white",
          size === "sm" && "h-2.5 w-2.5",
          size === "md" && "h-3 w-3", 
          size === "lg" && "h-3.5 w-3.5",
          size === "xl" && "h-4 w-4"
        )} />
      )}
      
      {/* Badge hôte */}
      {isHost && (
        <div className={cn(
          "absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-lg",
          size === "sm" && "h-4 w-4 text-[8px]",
          size === "md" && "h-5 w-5 text-[10px]",
          size === "lg" && "h-6 w-6 text-xs",
          size === "xl" && "h-7 w-7 text-sm"
        )}>
          👑
        </div>
      )}
    </div>
  )
}
