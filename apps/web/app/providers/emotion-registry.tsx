"use client";

import { useState, ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

interface EmotionRegistryProps {
  children: ReactNode;
}

export function EmotionRegistry({ children }: EmotionRegistryProps) {
  const [cache] = useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) {
      return null;
    }

    let styles = "";
    for (const name of names) {
      const value = cache.inserted[name];
      if (typeof value === "string") {
        styles += value;
      }
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
