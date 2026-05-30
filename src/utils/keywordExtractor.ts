// ── Known phrases / single terms worth highlighting (case-insensitive) ─────
// These fire even when lowercase, covering jargon people likely want to look up.
const KNOWN: readonly string[] = [
  // Places & institutions
  'New York', 'Los Angeles', 'San Francisco', 'Silicon Valley', 'Wall Street',
  'White House', 'Capitol Hill', 'United States', 'United Kingdom',
  'European Union', 'South Korea', 'North Korea', 'Saudi Arabia', 'Middle East',
  'New York Times', 'Wall Street Journal', 'Washington Post', 'Financial Times',
  // Tech concepts
  'artificial intelligence', 'machine learning', 'large language model',
  'generative ai', 'deep learning', 'neural network', 'computer vision',
  'natural language processing', 'reinforcement learning',
  'quantum computing', 'augmented reality', 'virtual reality', 'mixed reality',
  'open source', 'cloud computing', 'edge computing', 'zero-day',
  // Business / finance
  'venture capital', 'private equity', 'initial public offering',
  'central bank', 'interest rate', 'stock market', 'supply chain',
  'hedge fund', 'antitrust', 'class action', 'data privacy',
  // Society / science / other
  'climate change', 'renewable energy', 'electric vehicle', 'self-driving',
  'social media', 'cryptocurrency', 'blockchain', 'non-fungible token',
];

// ALL-CAPS abbreviations that are stop words (don't highlight these)
const ABBREV_STOP = new Set([
  'A','I','AS','BY','AN','AM','AT','OR','AND','THE','FOR','OF','IN','ON',
  'UP','TO','SO','NO','DO','IS','IT','BE','US','WE','HE','SHE','MY','OK',
]);

// Title-Case words that should NOT start a proper-noun phrase
const PROPER_STOP = new Set([
  'The','A','An','This','That','These','Those','Its','Their','Our','Your',
  'His','Her','My','With','From','Into','Over','After','Before','Since',
  'While','About','Above','Below','Under','Between','Among','Through',
  'During','Against','Without','Within','By','To','In','On','At','As','Of',
  'For','Up','Down','Out','Off','Back','Than','Then','There','Here',
  'And','But','Or','Nor','So','Yet','What','When','Where','How','Why','Who',
  'Which','New','Old','Big','Small','High','Low','Long','Short','Good','Bad',
  'Best','Worst','More','Most','Very','Only','Even','Such','Real','Full',
  'Next','Late','Early','Key','Free','Open','Close','Left','Right','Both',
  'Each','Few','Some','Any','All','Major','Global','National','Federal',
  'Former','First','Last','Top','Main','True','False','Live','Large','Huge',
  'Recent','Current','Latest','Official','Public','Local','International',
  'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Now','Also','Just','Much','Many','Day','Days','Week','Month','Year',
  'Time','Today','Annual','Years','Months','Weeks',
  // Verbs (Title-Case mid-headline)
  'Says','Said','Reports','Report','Shows','Show','Plans','Plan',
  'Announces','Announced','Launches','Launch','Launched','Reveals',
  'Reveal','Revealed','Raises','Raise','Raised','Unveils','Unveil',
  'Releases','Release','Released','Cuts','Cut','Buys','Buy','Sells',
  'Sell','Fires','Fire','Hires','Hire','Sues','Sue','Bans','Ban',
  'Blocks','Block','Hits','Hit','Beats','Beat','Wins','Win','Gets',
  'Get','Makes','Make','Takes','Take','Creates','Create','Builds','Build',
  'Signs','Sign','Files','File','Pays','Pay','Faces','Face','Seeks','Seek',
  'Aims','Aim','Warns','Warn','Calls','Call','Joins','Join','Leaves',
  'Leave','Moves','Move','Confirms','Confirm','Denies','Deny','Admits',
  'Admit','Claims','Claim','Argues','Argue','Offers','Offer','Drops',
  'Drop','Adds','Add','Updates','Update','Tests','Test','Reaches','Reach',
  'Rises','Rise','Falls','Fall','Gains','Gain','Asks','Ask','Helps','Help',
  'Finds','Find','Keeps','Keep','Works','Work','Wants','Want','Needs','Need',
  'Becomes','Become','Sets','Set','Surpasses','Marks','Posts','Expands',
  'Grows','Targets','Pushes','Pulls','Enters','Exits','Returns','Continues',
  'Begins','Starts','Ends','Closes','Opens','Delays','Shares','Boosts',
  // Generic nouns
  'Feature','Features','Product','Products','Service','Services',
  'Policy','Policies','Change','Changes','Update','Updates','User','Users',
  'Data','System','Systems','Platform','App','Apps','Tool','Tools',
  'Market','Markets','Industry','Company','Firm','Group','Team','Staff',
  'Issue','Issues','Problem','Problems','Way','Ways','Part','Parts',
  'Type','Kind','Version','Result','Results','Impact','Effect','Effects',
  'Role','Case','Cases','Event','Events','Question','Deal','Deals',
  'Rule','Rules','Law','Laws','Bill','Study','Studies','Statement',
  'Source','Sources','Story','Stories','Move','Moves','Record',
  'Profit','Profits','Revenue','Dollar','Dollars','Funding','Round',
  'Again','Still','Home','Play','Read','Use','Used','Based','Via',
  'Report','Reports','Model','Models','Chip','Chips','Chatbot','Chatbots',
  'Device','Devices','Phone','Tablet','Computer','Server','Servers',
  // Product suffix words — standalone they're not searchable
  'Pro','Lite','Mini','Basic','Standard','Edition','Series','Plus','Next',
]);

export function extractKeywords(text: string): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  const push = (w: string) => {
    const key = w.toLowerCase();
    if (!seen.has(key) && w.length >= 2) { seen.add(key); results.push(w); }
  };

  const lower = text.toLowerCase();

  // ── 1. Known important phrases / jargon ──────────────────────────────
  for (const phrase of KNOWN) {
    const idx = lower.indexOf(phrase.toLowerCase());
    if (idx !== -1) push(text.slice(idx, idx + phrase.length));
  }

  // ── 2. ALL-CAPS abbreviations  (AI, LLM, GPT, FBI, FDA, AGI, etc.) ───
  const abbrevs = text.match(/\b[A-Z]{2,6}\b/g) ?? [];
  for (const a of abbrevs) {
    if (!ABBREV_STOP.has(a)) push(a);
  }

  // ── 3. Hyphenated technical terms starting with capital  (USB-C, GPT-4o, Wi-Fi) ──
  // Lowercase-start hyphens like "all-time" are excluded; those in KNOWN are caught above.
  const hyphenated = text.match(/\b[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b/g) ?? [];
  for (const h of hyphenated) {
    if (h.length >= 3 && !PROPER_STOP.has(h)) push(h);
  }

  // ── 4. CamelCase brand names  (iPhone, macOS, YouTube, ChatGPT) ──────
  const camel = text.match(/\b[a-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]+\b/g) ?? [];
  for (const c of camel) {
    if (c.length >= 4) push(c);
  }

  // ── 5. Title-Case proper noun phrases  (max 2 words, no stop words) ──
  const wordRe = /\b[A-Z][A-Za-z0-9]*\b/g;
  type Tok = { w: string; s: number; e: number };
  const tokens: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(text)) !== null) {
    if (m[0].length >= 2) tokens.push({ w: m[0], s: m.index, e: m.index + m[0].length });
  }

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (PROPER_STOP.has(tok.w)) { i++; continue; }

    let phrase = tok.w;
    const j = i + 1;
    if (j < tokens.length) {
      const gap = text.slice(tok.e, tokens[j].s);
      const nextAlreadyCaptured = seen.has(tokens[j].w.toLowerCase());
      if (/^\s{1,2}$/.test(gap) && !PROPER_STOP.has(tokens[j].w) && !nextAlreadyCaptured) {
        phrase += ' ' + tokens[j].w;
        i = j + 1;
      } else {
        i++;
      }
    } else {
      i++;
    }

    if (phrase.length >= 2) push(phrase);
  }

  // Prefer longer phrases — remove substrings already covered by a longer match
  const unique = [...new Set(results)];
  return unique
    .filter(kw => !unique.some(
      o => o !== kw && o.toLowerCase().includes(kw.toLowerCase()) && o.length > kw.length
    ))
    .slice(0, 9);
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
