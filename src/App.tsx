import { useState, useRef, useEffect, useCallback } from 'react';
import { Category, CATEGORIES } from './types/news';
import { useNews } from './hooks/useNews';
import NewsCard from './components/NewsCard';
import CategoryFilter from './components/CategoryFilter';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [category, setCategory] = useState<Category>('general');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { articles, pending, loading, isMock, loadMore, error, acceptPending } = useNews(category);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setCurrentIndex(idx);
    if (idx >= articles.length - 3) loadMore();
  }, [articles.length, loadMore]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setCurrentIndex(0);
    containerRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleAcceptPending = () => {
    acceptPending();
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentIndex(0);
  };

  const progress = articles.length > 1 ? (currentIndex / (articles.length - 1)) * 100 : 0;
  const activeCat = CATEGORIES.find(c => c.id === category) ?? CATEGORIES[0];

  if (loading && articles.length === 0) return <LoadingScreen />;

  return (
    <div className="app">
      <CategoryFilter categories={CATEGORIES} active={category} onChange={handleCategoryChange} />

      {/* ── new stories pill ── */}
      {pending.length > 0 && (
        <button
          className="new-pill"
          style={{ '--pill-color': activeCat.color, '--pill-glow': activeCat.glow } as React.CSSProperties}
          onClick={handleAcceptPending}
        >
          <span className="new-pill-arrow">↑</span>
          <span>{pending.length} new {pending.length === 1 ? 'story' : 'stories'}</span>
          <span className="new-pill-dot" style={{ background: activeCat.color }} />
        </button>
      )}

      {isMock && (
        <div className="demo-pill">
          📰 Demo mode —{' '}
          <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer">add API key</a>
          {' '}for live news
        </div>
      )}

      {error && <div className="error-pill">⚠️ {error}</div>}

      {/* progress rail */}
      <div className="progress-rail">
        <div className="progress-fill" style={{ height: `${progress}%` }} />
      </div>

      <div className="reel-container" ref={containerRef}>
        {articles.map((article, i) => (
          <NewsCard key={article.id} article={article} isActive={i === currentIndex} index={i} />
        ))}
        {loading && articles.length > 0 && (
          <div className="load-more-row"><div className="spinner" /></div>
        )}
      </div>
    </div>
  );
}
