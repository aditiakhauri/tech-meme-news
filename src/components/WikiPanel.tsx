import { useWiki } from '../hooks/useWiki';

interface Props {
  term: string;
  catColor: string;
  headline: string;
  onClose: () => void;
}

export default function WikiPanel({ term, catColor, headline, onClose }: Props) {
  const { info, loading, error } = useWiki(term, headline);

  return (
    <div className="wiki-overlay" onClick={onClose}>
      <div
        className="wiki-panel"
        style={{ '--cat-color': catColor } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="wiki-drag-handle" />
        <div className="wiki-inner">
          {loading && (
            <div className="wiki-loading-state">
              <div className="wiki-spinner" />
              <span>looking up <em>{term}</em>…</span>
            </div>
          )}
          {error && !loading && (
            <div className="wiki-error-state">
              <span className="wiki-err-icon">🤷</span>
              <p>couldn't find anything on <strong>{term}</strong></p>
            </div>
          )}
          {info && !loading && (
            <>
              <div className="wiki-header">
                {info.thumbnail && (
                  <img src={info.thumbnail} alt={info.title} className="wiki-thumb" />
                )}
                <div className="wiki-header-text">
                  <span className="wiki-searched-term">{term}</span>
                  <h3 className="wiki-title">{info.title}</h3>
                  {info.description && (
                    <span className="wiki-short-desc">{info.description}</span>
                  )}
                </div>
              </div>
              <p className="wiki-extract">{info.extract}</p>
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(info.title.replace(/\s+/g, '_'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wiki-readmore"
                onClick={e => e.stopPropagation()}
              >
                full article on Wikipedia ↗
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
