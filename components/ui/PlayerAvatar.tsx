"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  xs: { box: "h-6 w-6 rounded-lg", text: "text-[11px]" },
  sm: { box: "h-8 w-8 rounded-xl", text: "text-sm" },
  md: { box: "h-11 w-11 rounded-2xl", text: "text-xl" },
  lg: { box: "h-14 w-14 rounded-2xl", text: "text-3xl" },
  xl: { box: "h-20 w-20 rounded-3xl", text: "text-4xl" },
  "2xl": { box: "h-24 w-24 rounded-3xl", text: "text-5xl" },
};

export function PlayerAvatar({
  avatar,
  name = "Shooter",
  size = "md",
  className = "",
  ring = false,
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = sizeMap[size] || sizeMap.md;

  const isDataOrUrl =
    avatar &&
    (avatar.startsWith("data:image/") ||
      avatar.startsWith("/") ||
      avatar.startsWith("http://") ||
      avatar.startsWith("https://") ||
      avatar.includes("."));

  const isImageUrl = isDataOrUrl && !imageError;
  const ringClass = ring ? "ring-2 ring-hoop-orange/50 shadow-lg" : "";

  // If valid image URL or base64 data
  if (isImageUrl) {
    return (
      <div
        className={`relative flex-shrink-0 overflow-hidden bg-surface-light border border-white/10 ${sizeConfig.box} ${ringClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar!}
          alt={name}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover select-none"
        />
      </div>
    );
  }

  // Fallback: Check if it's an emoji (short string without file path characters)
  const isCleanEmoji =
    avatar &&
    avatar.trim().length > 0 &&
    avatar.trim().length <= 6 &&
    !avatar.includes("/") &&
    !avatar.includes("\\") &&
    !avatar.includes(":") &&
    !avatar.includes(".");

  // If it's a valid emoji, display the emoji. Otherwise display the player's initial or basketball!
  const displayContent = isCleanEmoji
    ? avatar.trim()
    : name && name.trim().length > 0
    ? name.trim().charAt(0).toUpperCase()
    : "🏀";

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center bg-white/10 shadow-inner font-black select-none border border-white/5 ${sizeConfig.box} ${ringClass} ${className}`}
    >
      <span className={`${sizeConfig.text} text-white`}>{displayContent}</span>
    </div>
  );
}
