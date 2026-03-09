"use client";

import { useEffect, useState } from 'react';

function normalizeAvatarUrl(src?: string | null) {
  if (!src) return null;
  if (src.startsWith('http://')) return src.replace('http://', 'https://');
  return src;
}

export default function DiscordAvatar({
  src,
  alt,
  fallback,
  className,
  textClassName = 'text-lg font-black',
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  className: string;
  textClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const normalizedSrc = normalizeAvatarUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [normalizedSrc]);

  if (normalizedSrc && !failed) {
    return (
      <img
        src={normalizedSrc}
        alt={alt}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={className}>
      <span className={textClassName}>{fallback}</span>
    </div>
  );
}
