export interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: Category;
}

export type Category = 'general' | 'technology' | 'world' | 'science' | 'business' | 'gaming';

export interface CategoryConfig {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  glow: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'general',    label: 'Trending', emoji: '🔥', color: '#ffd700', glow: '#ff6b6b' },
  { id: 'technology', label: 'Tech',     emoji: '💻', color: '#00f5ff', glow: '#0080ff' },
  { id: 'world',      label: 'World',    emoji: '🌍', color: '#39ff14', glow: '#00ffaa' },
  { id: 'science',    label: 'Science',  emoji: '🔬', color: '#bf5fff', glow: '#ff69b4' },
  { id: 'business',   label: 'Biz',      emoji: '💰', color: '#ff6b35', glow: '#ffd700' },
  { id: 'gaming',     label: 'Gaming',   emoji: '🎮', color: '#ff1493', glow: '#ff6b6b' },
];
