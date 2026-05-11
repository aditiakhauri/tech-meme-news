import { CategoryConfig, Category } from '../types/news';

interface Props {
  categories: CategoryConfig[];
  active: Category;
  onChange: (cat: Category) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="category-filter">
      <div className="app-logo">📰 memenews</div>
      <div className="cat-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cat-btn ${active === cat.id ? 'active' : ''}`}
            style={active === cat.id ? { color: cat.color, borderBottomColor: cat.color } : {}}
            onClick={() => onChange(cat.id)}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
