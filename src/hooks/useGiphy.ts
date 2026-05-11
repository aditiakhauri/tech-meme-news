import { useState, useEffect } from 'react';

const cache = new Map<string, string | null>();

export function useGiphy(query: string | null, enabled: boolean) {
  const [gifUrl, setGifUrl] = useState<string | null>(() => (query ? cache.get(query) ?? null : null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !query) return;
    if (cache.has(query)) {
      setGifUrl(cache.get(query) ?? null);
      return;
    }
    setLoading(true);
    fetch(`/api/gif?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        const url = data.url ?? null;
        cache.set(query, url);
        setGifUrl(url);
      })
      .catch(() => {
        cache.set(query, null);
        setGifUrl(null);
      })
      .finally(() => setLoading(false));
  }, [query, enabled]);

  return { gifUrl, loading };
}
