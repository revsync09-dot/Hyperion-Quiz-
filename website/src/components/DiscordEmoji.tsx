"use client";

import { useEffect, useState } from 'react';

const FALLBACKS = {
  COIN: '🪙',
  TROPHY: '🏆',
  LEVEL: '⭐',
  QUIZ: '❓',
  PROFILE: '👤',
  GLOBE: '🌐',
  MONEY: '💰',
  FIRE: '🔥',
  ROCKET: '🚀',
  REFRESH: '🔄',
  CHART: '📊',
  INFO: 'ℹ️',
  SUCCESS: '✅',
  ERROR: '❌',
  FIRST: '🥇',
  SECOND: '🥈',
  THIRD: '🥉',
  ONE: '1️⃣',
  TWO: '2️⃣',
  THREE: '3️⃣',
  FOUR: '4️⃣',
} as const;

type EmojiName = keyof typeof FALLBACKS;
type EmojiMap = Record<EmojiName, string>;

const PUBLIC_EMOJIS: Partial<EmojiMap> = {
  COIN: process.env.NEXT_PUBLIC_EMOJI_COIN,
  TROPHY: process.env.NEXT_PUBLIC_EMOJI_TROPHY,
  LEVEL: process.env.NEXT_PUBLIC_EMOJI_LEVEL,
  QUIZ: process.env.NEXT_PUBLIC_EMOJI_QUIZ,
  PROFILE: process.env.NEXT_PUBLIC_EMOJI_PROFILE,
  GLOBE: process.env.NEXT_PUBLIC_EMOJI_GLOBE,
  MONEY: process.env.NEXT_PUBLIC_EMOJI_MONEY,
  FIRE: process.env.NEXT_PUBLIC_EMOJI_FIRE,
  ROCKET: process.env.NEXT_PUBLIC_EMOJI_ROCKET,
  REFRESH: process.env.NEXT_PUBLIC_EMOJI_REFRESH,
  CHART: process.env.NEXT_PUBLIC_EMOJI_CHART,
  INFO: process.env.NEXT_PUBLIC_EMOJI_INFO,
  SUCCESS: process.env.NEXT_PUBLIC_EMOJI_SUCCESS,
  ERROR: process.env.NEXT_PUBLIC_EMOJI_ERROR,
  FIRST: process.env.NEXT_PUBLIC_EMOJI_FIRST,
  SECOND: process.env.NEXT_PUBLIC_EMOJI_SECOND,
  THIRD: process.env.NEXT_PUBLIC_EMOJI_THIRD,
  ONE: process.env.NEXT_PUBLIC_EMOJI_ONE,
  TWO: process.env.NEXT_PUBLIC_EMOJI_TWO,
  THREE: process.env.NEXT_PUBLIC_EMOJI_THREE,
  FOUR: process.env.NEXT_PUBLIC_EMOJI_FOUR,
};

let emojiCache: Partial<EmojiMap> | null = null;
let emojiRequest: Promise<Partial<EmojiMap>> | null = null;

async function loadEmojiMap() {
  if (emojiCache) return emojiCache;
  if (!emojiRequest) {
    emojiRequest = fetch('/api/emojis', { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) return PUBLIC_EMOJIS;
        const payload = await response.json();
        return payload.emojis as Partial<EmojiMap>;
      })
      .catch(() => PUBLIC_EMOJIS)
      .then((map) => {
        emojiCache = map;
        return map;
      });
  }

  return emojiRequest;
}

function emojiUrl(value: string) {
  if (!value) return null;
  
  // 1. If it's just the ID
  if (/^\d+$/.test(value)) {
    return `https://cdn.discordapp.com/emojis/${value}.webp?size=64&quality=lossless`;
  }
  
  // 2. If it's the full markup <:name:id> or <a:name:id>
  const match = value.match(/<a?:[^:]+:(\d+)>/);
  if (match) {
    return `https://cdn.discordapp.com/emojis/${match[1]}.webp?size=64&quality=lossless`;
  }

  return null;
}

export default function DiscordEmoji({
  name,
  className = 'w-5 h-5 inline-block align-middle',
}: {
  name: EmojiName;
  className?: string;
}) {
  const [emojis, setEmojis] = useState<Partial<EmojiMap>>(emojiCache || PUBLIC_EMOJIS);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    loadEmojiMap().then((map) => {
      if (active) setEmojis(map);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [name, emojis]);

  const value = emojis[name] || PUBLIC_EMOJIS[name] || FALLBACKS[name];
  const url = emojiUrl(value);

  if (url && !imageFailed) {
    return (
      <img
        src={url}
        alt={name}
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <span className={className}>{value || FALLBACKS[name]}</span>;
}
