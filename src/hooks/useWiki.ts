import { useState, useEffect } from 'react';

export interface WikiInfo {
  title: string;
  extract: string;
  thumbnail: string | null;
  description: string | null;
}

const cache = new Map<string, WikiInfo | null>();

async function wikiSummary(slug: string): Promise<WikiInfo | null> {
  const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
  if (!r.ok) return null;
  const d = await r.json();
  if (d.type === 'disambiguation') return null;
  return {
    title: d.title ?? slug,
    extract: (d.extract ?? '').slice(0, 320),
    thumbnail: d.thumbnail?.source ?? null,
    description: d.description ?? null,
  };
}

async function wikiSearch(query: string): Promise<string | null> {
  const r = await fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json&origin=*`
  );
  const [, titles]: [unknown, string[]] = await r.json();
  return titles?.[0] ?? null;
}

// Pull the most distinctive words from the headline to use as search context.
// E.g. headline "Keychron K2 Review: Best Mechanical Keyboard" + term "Keychron K2"
// → contextWords = "Mechanical Keyboard" → search = "Keychron K2 Mechanical Keyboard"
function contextWords(term: string, headline: string): string {
  const termTokens = new Set(term.toLowerCase().split(/\s+/));
  const boring = new Set([
    'the','a','an','this','that','for','and','but','or','with','from',
    'into','over','after','its','their','our','about','just','also','very',
    'more','most','best','top','new','big','high','low','how','why','what',
    'says','said','has','have','been','will','can','not','yet','all',
  ]);
  const words = headline
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !termTokens.has(w.toLowerCase()) && !boring.has(w.toLowerCase()));
  return [...new Set(words)].slice(0, 3).join(' ');
}

async function fetchWiki(term: string, headline: string): Promise<WikiInfo> {
  const ctx = contextWords(term, headline);
  const firstWord = term.split(' ')[0];

  // 1. Direct slug for exact term
  const r1 = await wikiSummary(encodeURIComponent(term.replace(/\s+/g, '_')));
  if (r1) return r1;

  // 2. Opensearch with term + headline context ("Keychron K2 Mechanical Keyboard")
  if (ctx) {
    const t = await wikiSearch(`${term} ${ctx}`);
    if (t) { const r = await wikiSummary(encodeURIComponent(t.replace(/\s+/g, '_'))); if (r) return r; }
  }

  // 3. Opensearch for exact term
  const t3 = await wikiSearch(term);
  if (t3) { const r = await wikiSummary(encodeURIComponent(t3.replace(/\s+/g, '_'))); if (r) return r; }

  // 4. Direct slug for first word only ("Keychron")
  if (term.includes(' ')) {
    const r4 = await wikiSummary(encodeURIComponent(firstWord));
    if (r4) return r4;
  }

  // 5. Opensearch for first word + context
  if (term.includes(' ') && ctx) {
    const t5 = await wikiSearch(`${firstWord} ${ctx}`);
    if (t5) { const r = await wikiSummary(encodeURIComponent(t5.replace(/\s+/g, '_'))); if (r) return r; }
  }

  throw new Error('not found');
}

export function useWiki(term: string | null, headline = '') {
  const [info, setInfo] = useState<WikiInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Cache key includes headline so the same keyword in different contexts can resolve differently
  const cacheKey = term ? `${term}||${headline}` : '';

  useEffect(() => {
    if (!term) {
      setInfo(null); setError(false); setLoading(false);
      return;
    }

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setInfo(cached ?? null);
      setError(cached === null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true); setError(false); setInfo(null);

    fetchWiki(term, headline)
      .then(result => {
        cache.set(cacheKey, result);
        if (!cancelled) { setInfo(result); setLoading(false); }
      })
      .catch(() => {
        cache.set(cacheKey, null);
        if (!cancelled) { setError(true); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [term, headline, cacheKey]);

  return { info, loading, error };
}
