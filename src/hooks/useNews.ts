import { useState, useEffect, useCallback, useRef } from 'react';
import { Article, Category } from '../types/news';

const POLL_INTERVAL_MS = 90_000; // 90 seconds

interface NewsState {
  articles: Article[];
  pending: Article[];     // freshly fetched but not yet shown
  loading: boolean;
  error: string | null;
  isMock: boolean;
  page: number;
  lastFetchedAt: number;
}

export function useNews(category: Category) {
  const [state, setState] = useState<NewsState>({
    articles: [],
    pending: [],
    loading: true,
    error: null,
    isMock: false,
    page: 1,
    lastFetchedAt: 0,
  });

  const currentArticleIds = useRef<Set<string>>(new Set());

  // ── initial + page load ──────────────────────────────────────────
  const fetchNews = useCallback(async (cat: Category, page: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/news?category=${cat}&page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const incoming: Article[] = data.articles ?? [];

      setState(prev => {
        const merged = page === 1 ? incoming : [...prev.articles, ...incoming];
        currentArticleIds.current = new Set(merged.map(a => a.id));
        return {
          ...prev,
          articles: merged,
          loading: false,
          isMock: data.mock ?? false,
          page,
          lastFetchedAt: Date.now(),
        };
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch news',
      }));
    }
  }, []);

  // ── polling: check for new articles ─────────────────────────────
  const pollForNew = useCallback(async (cat: Category) => {
    try {
      const res = await fetch(`/api/news?category=${cat}&page=1`);
      if (!res.ok) return;
      const data = await res.json();
      const incoming: Article[] = data.articles ?? [];

      // keep only articles we haven't seen before
      const fresh = incoming.filter(a => !currentArticleIds.current.has(a.id));
      if (fresh.length > 0) {
        setState(prev => ({ ...prev, pending: fresh }));
      }
    } catch {
      // silent poll failure
    }
  }, []);

  // ── category change: reset & fetch ──────────────────────────────
  useEffect(() => {
    currentArticleIds.current = new Set();
    setState({ articles: [], pending: [], loading: true, error: null, isMock: false, page: 1, lastFetchedAt: 0 });
    fetchNews(category, 1);
  }, [category, fetchNews]);

  // ── start polling after initial load ────────────────────────────
  useEffect(() => {
    if (state.lastFetchedAt === 0) return;
    const id = setInterval(() => pollForNew(category), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [category, state.lastFetchedAt, pollForNew]);

  // ── accept pending articles (user taps the pill) ─────────────────
  const acceptPending = useCallback(() => {
    setState(prev => {
      const merged = [...prev.pending, ...prev.articles];
      currentArticleIds.current = new Set(merged.map(a => a.id));
      return { ...prev, articles: merged, pending: [] };
    });
  }, []);

  const loadMore = useCallback(() => {
    if (!state.loading) fetchNews(category, state.page + 1);
  }, [category, state.page, state.loading, fetchNews]);

  const refresh = useCallback(() => {
    currentArticleIds.current = new Set();
    fetchNews(category, 1);
  }, [category, fetchNews]);

  return { ...state, loadMore, refresh, acceptPending };
}
