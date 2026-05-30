import { useState, useEffect } from 'react';
import { Article, CATEGORIES } from '../types/news';
import { getMemeCaption, getSimpleSummary, getCardEmoji, getCardRotation, getGiphyQuery } from '../utils/memeTransformer';
import { useGiphy } from '../hooks/useGiphy';
import { useImgflipMeme } from '../hooks/useImgflipMeme';
import { extractKeywords, escapeRegex } from '../utils/keywordExtractor';
import WikiPanel from './WikiPanel';

interface Props {
  article: Article;
  isActive: boolean;
  index: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 6e4);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function stableNum(seed: string, max: number): number {
  const h = seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  return Math.abs(h) % max;
}

const STICKERS = ['✦','★','✶','◆','✸','❋','⬡','◉'];
const TAG_LINES = [
  'BREAKING', 'JUST IN', 'DEVELOPING', 'EXCLUSIVE', 'TOP STORY',
  'ANALYSIS', 'TRENDING', 'MUST READ', 'LATEST', 'IN FOCUS',
];

function HighlightedText({ text, keywords, onKeyword, className }: {
  text: string;
  keywords: string[];
  onKeyword: (kw: string) => void;
  className?: string;
}) {
  if (keywords.length === 0) return <>{text}</>;
  try {
    const pattern = new RegExp(`\\b(${keywords.map(escapeRegex).join('|')})\\b`, 'gi');
    const parts = text.split(pattern);
    const kwSet = new Set(keywords);
    return (
      <>
        {parts.map((part, i) =>
          kwSet.has(part) ? (
            <span
              key={i}
              className={`keyword-chip${className ? ' ' + className : ''}`}
              onClick={e => { e.stopPropagation(); onKeyword(part); }}
            >
              {part}
            </span>
          ) : part
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

export default function NewsCard({ article, isActive, index }: Props) {
  const [liked, setLiked] = useState(false);
  const [wikiTerm, setWikiTerm] = useState<string | null>(null);
  const cat = CATEGORIES.find(c => c.id === article.category) ?? CATEGORIES[0];

  useEffect(() => {
    if (!isActive) setWikiTerm(null);
  }, [isActive]);
  const meme = getMemeCaption(article);
  const tldr = getSimpleSummary(article);
  const decorEmoji = getCardEmoji(article.category, article.id);
  const gifRotation = getCardRotation(article.id);
  const giphyQuery = getGiphyQuery(article);
  const { gifUrl, loading: gifLoading } = useGiphy(giphyQuery, isActive);
  const { memeUrl, loading: memeLoading } = useImgflipMeme(article);

  const keywords = extractKeywords(article.title + (article.description ? ' ' + article.description : ''));

  const likeCount = 1000 + stableNum(article.id + 'l', 8999);
  const shareCount = 200 + stableNum(article.id + 's', 2800);

  const stickerA = STICKERS[stableNum(article.id + 'sa', STICKERS.length)];
  const stickerB = STICKERS[stableNum(article.id + 'sb', STICKERS.length)];
  const tagLine = TAG_LINES[stableNum(article.id + 'tag', TAG_LINES.length)];

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: article.title, url: article.url }).catch(() => {});
    else navigator.clipboard?.writeText(article.url).catch(() => {});
  };

  return (
    <div
      className={`news-card nc-${article.category} ${isActive ? 'is-active' : ''}`}
      style={{ '--cat-color': cat.color, '--cat-glow': cat.glow } as React.CSSProperties}
    >
      {/* animated blob background */}
      <div className="blob-bg" />
      {/* noise grain */}
      <div className="grain" />

      {/* article image as blurred bg if no gif */}
      {article.image && !gifUrl && (
        <div className="card-img-bg" style={{ backgroundImage: `url(${article.image})` }} />
      )}
      <div className="card-overlay" />

      {/* ── TOP BAR ── */}
      <div className="card-topbar">
        <span className="cat-badge" style={{ color: cat.color, borderColor: cat.color, boxShadow: `0 0 10px ${cat.color}44` }}>
          {cat.emoji} {cat.label.toUpperCase()}
        </span>
        <span className="tag-line">{tagLine}</span>
        <span className="card-time">{timeAgo(article.publishedAt)}</span>
      </div>

      {/* ── GIF STICKER ── */}
      <div className="gif-zone">
        <div
          className="gif-frame"
          style={{ '--rot': `${gifRotation}deg`, '--shadow-color': cat.color } as React.CSSProperties}
        >
          {gifLoading && <div className="gif-shimmer" />}
          {gifUrl && !gifLoading && (
            <img
              src={gifUrl}
              alt="reaction gif"
              className="gif-img"
              loading="lazy"
            />
          )}
          {!gifUrl && !gifLoading && (
            <div className="gif-placeholder">
              <span className="gif-emoji">{decorEmoji}</span>
            </div>
          )}
          <div className="gif-label">GIPHY</div>
        </div>

        {/* floating sticker decorations */}
        <span className="sticker stk-a" style={{ color: cat.color }}>{stickerA}</span>
        <span className="sticker stk-b" style={{ color: cat.glow }}>{stickerB}</span>
        <span className="sticker stk-c">{decorEmoji}</span>
      </div>

      {/* ── MEME TEXT ── */}
      <div className="card-content">
        <p
          className="meme-caption"
          style={{ '--g1': cat.color, '--g2': cat.glow } as React.CSSProperties}
        >
          <HighlightedText text={meme} keywords={keywords} onKeyword={setWikiTerm} className="kw-in-caption" />
        </p>

        <div className="tldr-row">
          <span className="tldr-label">basically:</span>
          <span className="tldr-text">{tldr}</span>
        </div>

        <div className="divider-line" style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

        <p className="real-headline">
          <HighlightedText text={article.title} keywords={keywords} onKeyword={setWikiTerm} />
        </p>

        {(memeLoading || memeUrl) && (
          <div className="imgflip-meme">
            {memeLoading && <div className="imgflip-meme-shimmer" />}
            {memeUrl && !memeLoading && (
              <img src={memeUrl} alt="meme" loading="lazy" />
            )}
          </div>
        )}

        {article.description && (
          <p className="card-desc">
            <HighlightedText
              text={article.description.length > 110 ? article.description.slice(0, 107) + '…' : article.description}
              keywords={keywords}
              onKeyword={setWikiTerm}
            />
          </p>
        )}

        {keywords.length > 0 && (
          <div className="keyword-hint">tap highlighted terms to explore</div>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="source-pill"
          style={{ borderColor: `${cat.color}44` }}
        >
          <span className="source-dot" style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
          <span className="source-name">{article.source}</span>
          <span className="source-arrow">↗</span>
        </a>
      </div>

      {/* ── RIGHT ACTION BAR ── */}
      <div className="action-bar">
        <button
          className={`act-btn ${liked ? 'act-liked' : ''}`}
          onClick={() => setLiked(p => !p)}
          aria-label="like"
        >
          <span className="act-icon">{liked ? '❤️' : '🤍'}</span>
          <span className="act-count">{(liked ? likeCount + 1 : likeCount).toLocaleString()}</span>
        </button>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="act-btn"
          aria-label="read full article"
        >
          <span className="act-icon">📖</span>
          <span className="act-count">Read</span>
        </a>

        <button className="act-btn" onClick={handleShare} aria-label="share">
          <span className="act-icon">🔗</span>
          <span className="act-count">{shareCount.toLocaleString()}</span>
        </button>
      </div>

      {index === 0 && (
        <div className="scroll-nudge" aria-hidden>
          <span>scroll</span>
          <span className="nudge-arrow">↑</span>
        </div>
      )}

      {wikiTerm && (
        <WikiPanel term={wikiTerm} catColor={cat.color} headline={article.title} onClose={() => setWikiTerm(null)} />
      )}
    </div>
  );
}
