import { NextResponse } from 'next/server';

const EMOJI_KEYS = [
  'COIN',
  'TROPHY',
  'LEVEL',
  'QUIZ',
  'PROFILE',
  'GLOBE',
  'MONEY',
  'FIRE',
  'ROCKET',
  'REFRESH',
  'CHART',
  'INFO',
  'SUCCESS',
  'ERROR',
  'FIRST',
  'SECOND',
  'THIRD',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
] as const;

const FALLBACKS: Record<(typeof EMOJI_KEYS)[number], string> = {
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
};

export async function GET() {
  const emojis = Object.fromEntries(
    EMOJI_KEYS.map((key) => {
      const value =
        process.env[`NEXT_PUBLIC_EMOJI_${key}`] ||
        process.env[`EMOJI_${key}`] ||
        FALLBACKS[key];

      return [key, value];
    }),
  );

  return NextResponse.json({ emojis });
}
