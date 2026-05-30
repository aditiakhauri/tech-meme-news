import { useState, useEffect } from 'react';
import { Article } from '../types/news';

const CATEGORY_TEMPLATES: Record<string, string[]> = {
  technology: ['181913649', '93895088', '87743020', '155067746'],
  business:   ['55311130',  '181913649', '87743020', '112126428'],
  world:      ['112126428', '188390779', '100777631', '181913649'],
  science:    ['93895088',  '155067746', '129242436', '100777631'],
  gaming:     ['155067746', '181913649', '188390779', '87743020'],
  general:    ['112126428', '181913649', '55311130',  '188390779'],
};

function pickTemplateId(article: Article): string {
  const pool = CATEGORY_TEMPLATES[article.category] ?? CATEGORY_TEMPLATES.general;
  const hash = article.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  return pool[Math.abs(hash) % pool.length];
}

function splitHeadline(title: string): [string, string] {
  for (const sep of [': ', ' — ', ' - ', ', ']) {
    const idx = title.indexOf(sep);
    if (idx > 8 && idx < title.length - 8) {
      return [title.slice(0, idx).trim(), title.slice(idx + sep.length).trim()];
    }
  }
  const words = title.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

// Module-level cache survives re-renders but not hot reloads
const memeCache = new Map<string, string>();

export function useImgflipMeme(article: Article) {
  // Start loading=true immediately so the shimmer renders on first paint
  const [memeUrl, setMemeUrl] = useState<string | null>(() => memeCache.get(article.id) ?? null);
  const [loading, setLoading] = useState(() => !memeCache.has(article.id));

  useEffect(() => {
    if (memeCache.has(article.id)) {
      setMemeUrl(memeCache.get(article.id)!);
      setLoading(false);
      return;
    }

    // `alive` flag handles React StrictMode's double-invoke: the first effect's
    // cleanup sets alive=false, so its fetch result is discarded. The second
    // effect fires a fresh fetch whose result is applied.
    let alive = true;
    setLoading(true);

    const [text0, text1] = splitHeadline(article.title);

    fetch('/api/meme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: pickTemplateId(article), text0, text1 }),
    })
      .then(r => r.json())
      .then(data => {
        if (!alive) return;
        if (data.success && data.data?.url) {
          memeCache.set(article.id, data.data.url);
          setMemeUrl(data.data.url);
        } else {
          console.warn('[imgflip]', data.error_message ?? JSON.stringify(data));
        }
      })
      .catch(err => { if (alive) console.warn('[imgflip] fetch error:', err); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [article.id]);

  return { memeUrl, loading };
}
