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
  { id: 'general',    label: 'Trending', emoji: '🔥', color: '#d4a843', glow: '#b85555' },
  { id: 'technology', label: 'Tech',     emoji: '💻', color: '#41b8d0', glow: '#3a78c9' },
  { id: 'world',      label: 'World',    emoji: '🌍', color: '#4db865', glow: '#2a9e75' },
  { id: 'science',    label: 'Science',  emoji: '🔬', color: '#9466c8', glow: '#b85590' },
  { id: 'business',   label: 'Biz',      emoji: '💰', color: '#cc7040', glow: '#b89830' },
  { id: 'gaming',     label: 'Gaming',   emoji: '🎮', color: '#b53878', glow: '#b84848' },
];
