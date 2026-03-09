import React from 'react';

export const Emojis = {
  COIN: process.env.NEXT_PUBLIC_EMOJI_COIN || '🪙',
  TROPHY: process.env.NEXT_PUBLIC_EMOJI_TROPHY || '🏆',
  LEVEL: process.env.NEXT_PUBLIC_EMOJI_LEVEL || '⭐',
  QUIZ: process.env.NEXT_PUBLIC_EMOJI_QUIZ || '❓',
  FIRST: process.env.NEXT_PUBLIC_EMOJI_FIRST || '🥇',
  SECOND: process.env.NEXT_PUBLIC_EMOJI_SECOND || '🥈',
  THIRD: process.env.NEXT_PUBLIC_EMOJI_THIRD || '🥉',
};

export default function DiscordEmoji({ name, className = "w-5 h-5 inline-block align-middle" }: { name: keyof typeof Emojis, className?: string }) {
  const emojiStr = Emojis[name];
  
  // If it's a numeric ID, it's a Discord custom emoji
  if (/^\d+$/.test(emojiStr)) {
    return (
      <img 
        src={`https://cdn.discordapp.com/emojis/${emojiStr}.png`} 
        alt={name} 
        className={className}
      />
    );
  }

  // Otherwise, it's a unicode fallback
  return <span className={className}>{emojiStr}</span>;
}
