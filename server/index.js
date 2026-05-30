const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Parser = require('rss-parser');
require('dotenv').config({ path: '.env.local' }); // .env.local takes precedence
require('dotenv').config();                        // fallback to .env

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const TENOR_KEY = process.env.TENOR_KEY || 'LIVDSRZULELA';
const rss = new Parser({ timeout: 6000, headers: { 'User-Agent': 'Mozilla/5.0' } });

// Live RSS feeds — no API key needed, all verified working
const RSS_FEEDS = {
  technology: [
    { url: 'https://www.theverge.com/rss/index.xml',           source: 'The Verge',     sourceUrl: 'https://theverge.com' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index',  source: 'Ars Technica',  sourceUrl: 'https://arstechnica.com' },
    { url: 'https://www.wired.com/feed/rss',                   source: 'Wired',         sourceUrl: 'https://wired.com' },
    { url: 'https://techcrunch.com/feed/',                     source: 'TechCrunch',    sourceUrl: 'https://techcrunch.com' },
  ],
  world: [
    { url: 'https://feeds.bbci.co.uk/news/rss.xml',                       source: 'BBC News',   sourceUrl: 'https://bbc.com/news' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',      source: 'NY Times',   sourceUrl: 'https://nytimes.com' },
  ],
  science: [
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',   source: 'NY Times Science',  sourceUrl: 'https://nytimes.com/section/science' },
    { url: 'https://www.sciencedaily.com/rss/all.xml',                    source: 'Science Daily',     sourceUrl: 'https://sciencedaily.com' },
  ],
  business: [
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',  source: 'NY Times Business', sourceUrl: 'https://nytimes.com/section/business' },
    { url: 'https://www.wired.com/feed/rss',                              source: 'Wired',             sourceUrl: 'https://wired.com' },
  ],
  gaming: [
    { url: 'https://www.pcgamer.com/rss/',           source: 'PC Gamer',         sourceUrl: 'https://pcgamer.com' },
    { url: 'https://www.rockpapershotgun.com/feed',  source: 'Rock Paper Shotgun', sourceUrl: 'https://rockpapershotgun.com' },
  ],
  general: [
    { url: 'https://www.theverge.com/rss/index.xml',                      source: 'The Verge',    sourceUrl: 'https://theverge.com' },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml',                       source: 'BBC News',     sourceUrl: 'https://bbc.com/news' },
    { url: 'https://www.wired.com/feed/rss',                              source: 'Wired',        sourceUrl: 'https://wired.com' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',  source: 'NY Times',     sourceUrl: 'https://nytimes.com' },
  ],
};

// Simple in-memory cache so rapid polls don't hammer feeds
const feedCache = new Map(); // url → { items, fetchedAt }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchFeed(feedMeta) {
  const cached = feedCache.get(feedMeta.url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.items;

  try {
    const feed = await rss.parseURL(feedMeta.url);
    const items = (feed.items || []).slice(0, 15).map((item, i) => ({
      id: `${feedMeta.source.replace(/\s/g, '-').toLowerCase()}-${i}-${Date.now()}`,
      title: stripHtml(item.title || ''),
      description: stripHtml(item.contentSnippet || item.summary || item.content || '').slice(0, 200),
      url: item.link || item.guid || '',
      image: extractImage(item),
      source: feedMeta.source,
      sourceUrl: feedMeta.sourceUrl,
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
    })).filter(a => a.title && a.url);

    feedCache.set(feedMeta.url, { items, fetchedAt: Date.now() });
    return items;
  } catch (err) {
    console.warn(`Feed failed: ${feedMeta.url} — ${err.message}`);
    return [];
  }
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#8217;/g,"'").replace(/&#8230;/g,'…').trim();
}

function extractImage(item) {
  if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
  if (item.enclosure?.url) return item.enclosure.url;
  const match = (item.content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: 'rss' }));

app.post('/api/meme', async (req, res) => {
  const { template_id, text0, text1 } = req.body;
  try {
    const params = new URLSearchParams({
      template_id: template_id || '181913649',
      username: process.env.IMGFLIP_USERNAME || 'imgflip_hubot',
      password: process.env.IMGFLIP_PASSWORD || 'imgflip_hubot',
      text0: text0 || '',
      text1: text1 || '',
    });
    const { data } = await axios.post(
      'https://api.imgflip.com/caption_image',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
    );
    res.json(data);
  } catch (err) {
    res.json({ success: false, error_message: err.message });
  }
});

app.get('/api/news', async (req, res) => {
  const { category = 'general', page = 1 } = req.query;
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.general;

  try {
    // Fetch all feeds in parallel
    const allItems = (await Promise.all(feeds.map(fetchFeed))).flat();

    // Deduplicate by URL, sort newest-first
    const seen = new Set();
    const unique = allItems
      .filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Paginate (10 per page)
    const perPage = 10;
    const start = (parseInt(page) - 1) * perPage;
    const articles = unique.slice(start, start + perPage).map((a, i) => ({
      ...a,
      id: `${category}-${start + i}-${a.url.slice(-20).replace(/\W/g,'')}`,
      category,
    }));

    res.json({ articles, mock: false, source: 'rss', total: unique.length });
  } catch (err) {
    console.error('RSS fetch error:', err.message);
    res.json({ articles: [], mock: false, error: err.message });
  }
});

app.get('/api/gif', async (req, res) => {
  const { q = 'meme reaction' } = req.query;
  try {
    const response = await axios.get('https://g.tenor.com/v1/search', {
      params: { q, key: TENOR_KEY, limit: 12, media_filter: 'minimal', contentfilter: 'medium' },
      timeout: 4000,
    });
    const results = response.data.results ?? [];
    if (!results.length) return res.json({ url: null });
    const pick = results[Math.floor(Math.random() * Math.min(10, results.length))];
    res.json({ url: pick.media?.[0]?.gif?.url ?? null });
  } catch {
    res.json({ url: null });
  }
});

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🔥 TechMeme News → http://localhost:${PORT}`);
  console.log('📡 Live RSS feeds — no API key needed\n');
});
