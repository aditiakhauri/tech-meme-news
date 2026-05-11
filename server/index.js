const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const TENOR_KEY = process.env.TENOR_KEY || 'LIVDSRZULELA';

const CATEGORY_SOURCES = {
  technology: 'techcrunch,the-verge,wired,ars-technica,engadget',
  world: 'reuters,bbc-news,the-guardian-uk,associated-press',
  science: 'new-scientist,national-geographic,wired',
  business: 'bloomberg,the-wall-street-journal',
  gaming: 'ign,polygon,kotaku',
  general: 'techcrunch,the-verge,reuters,bbc-news,bloomberg,engadget',
};

const SOURCE_URLS = {
  'techcrunch': 'https://techcrunch.com',
  'the-verge': 'https://theverge.com',
  'wired': 'https://wired.com',
  'ars-technica': 'https://arstechnica.com',
  'engadget': 'https://engadget.com',
  'reuters': 'https://reuters.com',
  'bbc-news': 'https://bbc.com/news',
  'the-guardian-uk': 'https://theguardian.com',
  'bloomberg': 'https://bloomberg.com',
  'ign': 'https://ign.com',
  'polygon': 'https://polygon.com',
  'kotaku': 'https://kotaku.com',
  'new-scientist': 'https://newscientist.com',
  'national-geographic': 'https://nationalgeographic.com',
  'associated-press': 'https://apnews.com',
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

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
    const url = pick.media?.[0]?.gif?.url ?? null;
    res.json({ url });
  } catch (err) {
    res.json({ url: null });
  }
});

app.get('/api/news', async (req, res) => {
  const { category = 'general', page = 1 } = req.query;

  if (!NEWSAPI_KEY || NEWSAPI_KEY === 'your_api_key_here') {
    return res.json({ articles: getMockData(category), mock: true });
  }

  try {
    const sources = CATEGORY_SOURCES[category] || CATEGORY_SOURCES.general;

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        sources,
        pageSize: 10,
        page: parseInt(page),
        apiKey: NEWSAPI_KEY,
      },
      timeout: 5000,
    });

    const articles = response.data.articles
      .filter(a => a.title && a.title !== '[Removed]' && a.description)
      .map((a, i) => ({
        id: `${category}-p${page}-${i}`,
        title: a.title.replace(/\s*[-|]\s*[^-|]*$/, '').trim(),
        description: a.description,
        url: a.url,
        image: a.urlToImage,
        source: a.source.name,
        sourceUrl: SOURCE_URLS[a.source.id] || '#',
        publishedAt: a.publishedAt,
        category,
      }));

    res.json({ articles, mock: false });
  } catch (error) {
    console.error('NewsAPI error:', error.message);
    res.json({ articles: getMockData(category), mock: true, error: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🔥 TechMeme News server → http://localhost:${PORT}`);
  if (!NEWSAPI_KEY || NEWSAPI_KEY === 'your_api_key_here') {
    console.log('⚠️  Demo mode — mock data only.');
    console.log('   Add a real key: cp .env.example .env  →  edit NEWSAPI_KEY');
    console.log('   Get one free at https://newsapi.org/\n');
  }
});

// Rotates every 90s so polls always surface new IDs
function getMockData(category) {
  const slot = Math.floor(Date.now() / 90_000); // changes every 90s

  const POOL = {
    technology: [
      { id: 'tech-a', title: 'OpenAI Unveils GPT-5 With Unprecedented Reasoning Capabilities', description: 'The latest model solves complex math, writes production code, and reasons across hour-long contexts.', url: 'https://techcrunch.com', source: 'TechCrunch', sourceUrl: 'https://techcrunch.com', offset: 0 },
      { id: 'tech-b', title: 'Apple Vision Pro 2 Spotted in FCC Filing — 30% Lighter, Double the Battery', description: 'The second-gen spatial computing headset quietly appeared in regulatory filings overnight.', url: 'https://theverge.com', source: 'The Verge', sourceUrl: 'https://theverge.com', offset: 1 },
      { id: 'tech-c', title: 'Google DeepMind AlphaFold 3 Hits 99.7% Accuracy in Drug Discovery', description: 'Predicts molecular interactions almost perfectly — slashing medicine development time from years to weeks.', url: 'https://wired.com', source: 'Wired', sourceUrl: 'https://wired.com', offset: 2 },
      { id: 'tech-d', title: "Tesla's Full Self-Driving Wins Federal Safety Approval for Public Roads", description: 'NHTSA greenlights Level 4 autonomy. Robotaxi deployments could begin as early as Q3.', url: 'https://arstechnica.com', source: 'Ars Technica', sourceUrl: 'https://arstechnica.com', offset: 3 },
      { id: 'tech-e', title: "Meta's Ray-Ban Smart Glasses Cross 10 Million Users Worldwide", description: 'The fastest-growing wearable AI in Meta history just added real-time language translation.', url: 'https://engadget.com', source: 'Engadget', sourceUrl: 'https://engadget.com', offset: 4 },
      { id: 'tech-f', title: 'GitHub Copilot Agent Mode Builds and Deploys Full Apps Autonomously', description: 'One-line prompt → scaffold, code, test, ship. Engineers are having feelings about this.', url: 'https://theverge.com', source: 'The Verge', sourceUrl: 'https://theverge.com', offset: 5 },
      { id: 'tech-g', title: 'Anthropic Releases Claude 4 Opus With 1M-Token Context Window', description: 'The new frontier model can digest an entire codebase or novel in a single prompt.', url: 'https://techcrunch.com', source: 'TechCrunch', sourceUrl: 'https://techcrunch.com', offset: 0 },
      { id: 'tech-h', title: 'Microsoft Embeds Copilot AI Directly Into Windows 12 Kernel', description: 'The OS now has an AI layer that monitors and optimises system performance in real time.', url: 'https://theverge.com', source: 'The Verge', sourceUrl: 'https://theverge.com', offset: 1 },
      { id: 'tech-i', title: 'Nvidia GB300 GPU Delivers 3× Performance Leap for AI Training', description: 'Jensen Huang called it "the most important chip we have ever made." He says that every year.', url: 'https://arstechnica.com', source: 'Ars Technica', sourceUrl: 'https://arstechnica.com', offset: 2 },
      { id: 'tech-j', title: 'X (Twitter) Launches AI-Generated News Summaries for Every Trending Topic', description: "Grok now writes the headlines. Journalists are not thrilled. Users don't seem to care.", url: 'https://wired.com', source: 'Wired', sourceUrl: 'https://wired.com', offset: 3 },
    ],
    world: [
      { id: 'world-a', title: 'G7 Nations Sign Historic Binding AI Governance Framework', description: 'World leaders agreed to cross-border regulations on frontier AI — the first treaty of its kind.', url: 'https://reuters.com', source: 'Reuters', sourceUrl: 'https://reuters.com', offset: 0 },
      { id: 'world-b', title: 'UN Climate Summit: 150 Nations Commit to Net-Zero by 2050', description: 'The most ambitious climate deal in history, with legally binding targets and an enforcement mechanism.', url: 'https://bbc.com/news', source: 'BBC News', sourceUrl: 'https://bbc.com/news', offset: 1 },
      { id: 'world-c', title: 'SpaceX Launches First Paying Civilian Moon Mission', description: 'Four tourists will orbit the Moon for 72 hours — humanity\'s return to lunar space after 50+ years.', url: 'https://theguardian.com', source: 'The Guardian', sourceUrl: 'https://theguardian.com', offset: 2 },
      { id: 'world-d', title: 'NASA Confirms Liquid Water Reservoirs Beneath Mars Surface', description: "The discovery transforms colonization planning. We've been sitting on the answer for years.", url: 'https://reuters.com', source: 'Reuters', sourceUrl: 'https://reuters.com', offset: 3 },
      { id: 'world-e', title: 'WHO Declares Global Public Health Emergency Over New Respiratory Virus', description: 'Early data suggests high transmissibility but low severity. Governments are monitoring closely.', url: 'https://bbc.com/news', source: 'BBC News', sourceUrl: 'https://bbc.com/news', offset: 0 },
      { id: 'world-f', title: 'European Parliament Passes Landmark Digital Rights Act', description: 'Citizens gain new rights over personal data and algorithmic decisions — enforceable from January.', url: 'https://theguardian.com', source: 'The Guardian', sourceUrl: 'https://theguardian.com', offset: 1 },
      { id: 'world-g', title: 'India Surpasses China as World\'s Largest Economy by GDP', description: 'The milestone, long predicted, arrived two years ahead of IMF forecasts.', url: 'https://reuters.com', source: 'Reuters', sourceUrl: 'https://reuters.com', offset: 2 },
      { id: 'world-h', title: 'Global Plastic Pollution Treaty Signed by 175 Countries', description: 'The landmark accord mandates 80% reduction in plastic production by 2040.', url: 'https://apnews.com', source: 'AP News', sourceUrl: 'https://apnews.com', offset: 3 },
    ],
    science: [
      { id: 'sci-a', title: 'Scientists Build First Fully Synthetic Human Cell Nucleus in Lab', description: 'The breakthrough could enable on-demand lab-grown organs within the decade.', url: 'https://wired.com', source: 'Wired', sourceUrl: 'https://wired.com', offset: 0 },
      { id: 'sci-b', title: 'James Webb Telescope Detects Life Signatures on Exoplanet K2-18b', description: 'Dimethyl sulfide — only made by living organisms on Earth — found 120 light-years away.', url: 'https://nationalgeographic.com', source: 'National Geographic', sourceUrl: 'https://nationalgeographic.com', offset: 1 },
      { id: 'sci-c', title: "Alzheimer's Vaccine Enters Phase 3 Trials With 87% Efficacy in Early Tests", description: "Preventive mRNA vaccine stops amyloid plaques forming. Researchers call it 'a moonshot that worked'.", url: 'https://newscientist.com', source: 'New Scientist', sourceUrl: 'https://newscientist.com', offset: 2 },
      { id: 'sci-d', title: 'Fusion Reactor Achieves Net Energy Gain for Third Consecutive Month', description: 'ITER announces a sustained surplus — the threshold that transforms fusion from experiment to power source.', url: 'https://wired.com', source: 'Wired', sourceUrl: 'https://wired.com', offset: 3 },
      { id: 'sci-e', title: 'Scientists Reverse Ageing in Human Cells by 30 Years Using Gene Therapy', description: 'Early clinical results show the therapy is safe and durable — peer review pending.', url: 'https://newscientist.com', source: 'New Scientist', sourceUrl: 'https://newscientist.com', offset: 0 },
      { id: 'sci-f', title: 'Quantum Computer Breaks RSA Encryption in Under 10 Minutes', description: 'The milestone that cryptographers have feared for decades just arrived. Security teams are not sleeping.', url: 'https://wired.com', source: 'Wired', sourceUrl: 'https://wired.com', offset: 1 },
    ],
    business: [
      { id: 'biz-a', title: "Nvidia Becomes World's First $5 Trillion Company", description: "AI chip demand shows no signs of slowing. Jensen Huang is now the world's richest person.", url: 'https://bloomberg.com', source: 'Bloomberg', sourceUrl: 'https://bloomberg.com', offset: 0 },
      { id: 'biz-b', title: 'Amazon Deploying 200,000 Humanoid Robots in Warehouses by Year End', description: 'Next-gen bots handle picking, packing, and last-mile sorting inside fulfillment centers.', url: 'https://wsj.com', source: 'Wall Street Journal', sourceUrl: 'https://wsj.com', offset: 1 },
      { id: 'biz-c', title: 'OpenAI Raises $10B at $300B Valuation — Most Valuable Startup Ever', description: "SoftBank leads the round. Sam Altman says it'll fund 'the final stretch to AGI'. Okay.", url: 'https://bloomberg.com', source: 'Bloomberg', sourceUrl: 'https://bloomberg.com', offset: 2 },
      { id: 'biz-d', title: 'Apple Hits $4 Trillion Market Cap — Again — on AI Hardware Cycle', description: 'The iPhone supercycle powered by on-device AI is doing numbers. Analysts are stunned.', url: 'https://bloomberg.com', source: 'Bloomberg', sourceUrl: 'https://bloomberg.com', offset: 3 },
      { id: 'biz-e', title: 'Elon Musk\'s xAI Valuation Surpasses $100B After Grok 3 Launch', description: 'The third-party benchmark scores are contested. The valuation is not.', url: 'https://wsj.com', source: 'Wall Street Journal', sourceUrl: 'https://wsj.com', offset: 0 },
      { id: 'biz-f', title: 'S&P 500 Hits 7,000 for the First Time as AI Rally Continues', description: 'Every AI-adjacent stock is up. Everything else is a rounding error.', url: 'https://bloomberg.com', source: 'Bloomberg', sourceUrl: 'https://bloomberg.com', offset: 1 },
    ],
    gaming: [
      { id: 'game-a', title: 'GTA VI Breaks All Records With 50 Million Pre-Orders — Ships This Fall', description: 'Rockstar confirms Vice City, two protagonists, and the biggest open world ever made.', url: 'https://ign.com', source: 'IGN', sourceUrl: 'https://ign.com', offset: 0 },
      { id: 'game-b', title: 'Nintendo Switch 2 Sells 3 Million Units in Opening Weekend', description: "Follows the best-selling console of all time and somehow surpasses its own launch-day records.", url: 'https://polygon.com', source: 'Polygon', sourceUrl: 'https://polygon.com', offset: 1 },
      { id: 'game-c', title: 'Valve Announces Half-Life 3 — For Real This Time', description: "After 17 years of memes and prayers, Gabe Newell said the three words. Gordon Freeman is back.", url: 'https://kotaku.com', source: 'Kotaku', sourceUrl: 'https://kotaku.com', offset: 2 },
      { id: 'game-d', title: 'Xbox Game Pass Hits 100 Million Subscribers — Bigger Than Netflix', description: "Microsoft's bet that games-as-a-service would win is paying off harder than anyone expected.", url: 'https://ign.com', source: 'IGN', sourceUrl: 'https://ign.com', offset: 3 },
      { id: 'game-e', title: 'Baldur\'s Gate 4 Announced — Larian Studios Returns for One More Arc', description: 'The studio behind BG3 is back. Fans who said they were done are already preordering.', url: 'https://polygon.com', source: 'Polygon', sourceUrl: 'https://polygon.com', offset: 0 },
      { id: 'game-f', title: "Sony's PSVR 3 Ships With AI-Generated Worlds — No Two Players See the Same Map", description: 'Generative AI baked into the headset means infinite procedural worlds. Speedrunners are alarmed.', url: 'https://kotaku.com', source: 'Kotaku', sourceUrl: 'https://kotaku.com', offset: 1 },
    ],
  };

  function buildArticles(pool, cat) {
    // Use slot to rotate which items lead the feed, giving polls new IDs
    const rotated = [...pool.slice(slot % pool.length), ...pool.slice(0, slot % pool.length)];
    return rotated.map((a, i) => ({
      id: `${a.id}-s${slot % 8}`,     // ID includes slot → fresh on each rotation
      category: cat,
      title: a.title,
      description: a.description,
      url: a.url,
      image: null,
      source: a.source,
      sourceUrl: a.sourceUrl,
      publishedAt: new Date(Date.now() - (a.offset + i * 0.5) * 3.6e6).toISOString(),
    }));
  }

  if (category === 'general') {
    return [
      ...buildArticles(POOL.technology.slice(0, 4), 'technology'),
      ...buildArticles(POOL.world.slice(0, 3), 'world'),
      ...buildArticles(POOL.business.slice(0, 2), 'business'),
      ...buildArticles(POOL.science.slice(0, 2), 'science'),
      ...buildArticles(POOL.gaming.slice(0, 2), 'gaming'),
    ];
  }

  return buildArticles(POOL[category] || POOL.technology, category);
}
