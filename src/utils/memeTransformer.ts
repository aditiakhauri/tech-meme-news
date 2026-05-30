import { Article } from '../types/news';

const SENSITIVE = [
  'killed','dead','death','dies','died','attack','war','bomb',
  'shooting','disaster','crash','victims','casualties','tragedy',
  'arrest','murder','violence','riot','crisis','conflict',
];

const TECH = [
  'ai','gpt','openai','google','apple','microsoft','meta',
  'robot','software','app','startup','code','crypto','bitcoin',
  'model','llm','chip','gpu','nvidia','tesla','spacex','github',
  'chatgpt','gemini','claude','deepmind','sam altman','elon',
];

type T = (t: string) => string;

// ── serious / hard news ────────────────────────────────────────────
const seriousTemplates: T[] = [
  t => `found out about "${t}" on a meme app. this is fine. 🙂`,
  t => `"${t}"\n\nnobody:\nme trying to process this:`,
  t => `not me having genuine feelings about "${t}" rn`,
  t => `"${t}" dropped with zero context. just vibes. just chaos.`,
  t => `pov: you have to explain "${t}" to your group chat`,
  t => `"${t}"\n\nfiled under: things i did not have on my 2026 bingo card`,
  t => `the way "${t}" just casually walked into my timeline 💀`,
  t => `"${t}" and we're all supposed to just continue our day. okay bestie.`,
];

// ── general / world — heavy current internet language ──────────────
const hypedTemplates: T[] = [
  t => `okay so... "${t}"\n\nbestie we need to talk`,
  t => `not "${t}" living in my head rent free since 5 minutes ago 🧠`,
  t => `girl in the comments explaining why "${t}" is fine actually: 📖`,
  t => `"${t}"\n\nnobody:\nme at 3am reading this:`,
  t => `the roman empire for people who follow the news: "${t}"`,
  t => `POV: you're the intern who had to write the press release for "${t}"`,
  t => `"${t}" understood the assignment. wrong assignment, but still.`,
  t => `okay but respectfully — "${t}" — WHO ASKED 💀`,
  t => `not me having full opinions about "${t}" at this hour`,
  t => `crying in [current situation]: "${t}"`,
  t => `"${t}"\n\nthe bar got a shovel and kept going`,
  t => `my roman empire is "${t}" and i will not be taking questions`,
  t => `"${t}"\n\nnormalize not reading this and just vibing tbh`,
  t => `slay i guess? "${t}" 🫡`,
  t => `"${t}" — this is so real and so unwell simultaneously`,
  t => `they posted "${t}" and then LOGGED OFF. cowards. legends.`,
  t => `"${t}" and nobody's going to jail. remarkable. unhinged. friday.`,
  t => `the villain arc is REAL: "${t}"`,
  t => `"${t}"\n\nhistorians are going to have so much material from us`,
  t => `iykyk: "${t}" 👀`,
];

// ── tech / silicon valley — savagely relatable ─────────────────────
const techTemplates: T[] = [
  t => `"${t}"\n\nokay so in human english: a guy in a fleece vest made this happen`,
  t => `linkedin: 🤩🤩 GROUNDBREAKING\nme, a normal person: "${t}" ???`,
  t => `POV: the tech bro explaining "${t}" at thanksgiving dinner for 45 minutes`,
  t => `"${t}"\n\n$10 billion raised. zero actual problems solved. we're so back.`,
  t => `girl with a google doc and three highlighters explaining "${t}": 🫡`,
  t => `"${t}" — it's giving "we have AI at home" and the AI at home is: 😐`,
  t => `them: how's the tech industry going\n"${t}"\nthem: ...okay`,
  t => `"${t}"\n\nthe man who built this definitely has a newsletter and a podcast`,
  t => `not "${t}" being the most 2026 sentence i've ever read 💀`,
  t => `"${t}" — said by someone who owns one crewneck and calls it "merch"`,
  t => `POV: you work there and found out about "${t}" on twitter like everyone else`,
  t => `"${t}"\n\nstock up 18%. why. nobody knows. nobody has to know.`,
  t => `they called it a "paradigm shift". it's "${t}". it's not a paradigm shift.`,
  t => `"${t}" — 500 engineers, a ping pong table, and THIS is the output.`,
  t => `the startup that did "${t}" has 4 employees and a $2B valuation. we live here now.`,
  t => `"${t}"\n\nVC twitter is going insane. normal people: 😐`,
];

function getTone(title: string): 'serious' | 'tech' | 'hyped' {
  const lower = title.toLowerCase();
  if (SENSITIVE.some(k => lower.includes(k))) return 'serious';
  if (TECH.some(k => lower.includes(k))) return 'tech';
  return 'hyped';
}

function stableHash(s: string): number {
  return s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
}

export function getMemeCaption(article: Article): string {
  const tone = getTone(article.title);
  const templates = tone === 'serious' ? seriousTemplates : tone === 'tech' ? techTemplates : hypedTemplates;
  const idx = Math.abs(stableHash(article.id)) % templates.length;
  const shortTitle = article.title.length > 68 ? article.title.slice(0, 65) + '…' : article.title;
  return templates[idx](shortTitle);
}

// ── plain-English "basically:" summary ────────────────────────────
export function getSimpleSummary(article: Article): string {
  const t = article.title.toLowerCase();

  // money / funding
  if (/raises?|funding|valuation|ipo|round/.test(t) && /billion|million|\$/.test(t))
    return `a company just got a massive bag from investors 💰`;
  if (/profit|revenue|earnings|record sales/.test(t))
    return `a company made way more money than usual and is very pleased with itself`;

  // layoffs / hiring
  if (/lays? off|layoffs?|job cuts?|redundanc/.test(t))
    return `a company just fired a bunch of people and called it "restructuring"`;
  if (/hir(es?|ing)|thousands of jobs|workforce/.test(t))
    return `a company is on a hiring spree — suspicious but okay`;

  // AI stuff
  if (/launches?|releases?|unveils?|announces?/.test(t) && /\bai\b|model|gpt|llm/.test(t))
    return `another AI thing got dropped into the world. add it to the pile. 🤖`;
  if (/ai|chatbot|robot/.test(t) && /replac|automat/.test(t))
    return `AI is replacing something humans used to do. classic.`;

  // security / hacks
  if (/hack|breach|leak|expos|vulnerabilit/.test(t))
    return `someone's data got stolen or exposed. again. change your passwords. 🫠`;
  if (/ban|censor|block|restrict/.test(t))
    return `something or someone just got banned somewhere`;

  // product launches
  if (/launches?|releases?|unveils?|announces?|ships?|drops?/.test(t))
    return `something new just dropped and people have opinions`;

  // science / research
  if (/scientists?|researchers?|study|research|discovered?/.test(t))
    return `scientists found something out and now we have to think about it`;
  if (/climate|emissions|carbon|warming|fossil/.test(t))
    return `the earth is having a moment (not a great one) 🌍`;
  if (/space|nasa|mars|moon|orbit|rocket/.test(t))
    return `space stuff happened and it's actually kind of cool`;

  // politics / government
  if (/election|vote|president|government|congress|parliament/.test(t))
    return `politics did a thing. everyone has opinions. nothing is resolved.`;
  if (/law|bill|legislation|regulation|rules?/.test(t))
    return `new rules are coming and someone is already mad about it`;
  if (/sanction|tariff|trade war/.test(t))
    return `countries are having an economic argument again`;

  // crypto
  if (/crypto|bitcoin|ethereum|blockchain/.test(t))
    return `crypto is doing a thing. it went up or down. god knows.`;

  // stocks / markets
  if (/stock|market|nasdaq|s&p|wall street|shares/.test(t))
    return `the stock market had emotions today`;

  // deals / mergers
  if (/acqui|merger|buys?|takeover|deal worth/.test(t))
    return `one big company just ate another company. nom nom.`;

  // category fallbacks
  const fallbacks: Record<string, string> = {
    technology: `the tech industry did something. the world shifted slightly.`,
    world:      `something happened in the world. it's a lot out there.`,
    science:    `scientists are at it again and honestly respect 🔬`,
    business:   `capitalism did a capitalism thing`,
    gaming:     `gamers are either eating good or absolutely losing their minds`,
    general:    `something happened and everyone has very strong opinions about it`,
  };
  return fallbacks[article.category] || `something noteworthy dropped, bestie 👀`;
}

// ── helpers ────────────────────────────────────────────────────────
const CATEGORY_EMOJIS: Record<string, string[]> = {
  technology: ['🤖','💻','⚡','🚀','🧠','🔮','💡','👾','🛸','⚙️'],
  world:      ['🌍','📡','🗞️','🌐','🔥','👁️','🚨','🫡','🌊','⚡'],
  science:    ['🔬','🧬','🌌','⚗️','💫','🔭','🧲','🪐','🧪','✨'],
  business:   ['💰','📈','💸','🤑','💎','🚀','🏦','💼','🦈','🤯'],
  gaming:     ['🎮','🕹️','👾','🏆','💥','🎯','⚔️','🌟','🎲','👑'],
  general:    ['🔥','💀','👀','😭','🤡','💅','⚡','🫡','🤯','🫠'],
};

export function getCardEmoji(category: string, seed: string): string {
  const emojis = CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.general;
  return emojis[Math.abs(stableHash(seed)) % emojis.length];
}

export function getCardRotation(seed: string): number {
  return ((Math.abs(stableHash(seed + 'rot')) % 13) - 6);
}

// ── mascot scene ──────────────────────────────────────────────────
// Animations are named by the ACTION they depict, not a generic motion.
export type MascotAnim =
  | 'wiggle' | 'bounce' | 'spin'  | 'pulse' | 'dance' | 'shake'
  | 'float'  | 'zip'    | 'chop'  | 'pop'
  // new narrative animations:
  | 'jolt'   | 'spurt'  | 'fall'  | 'gavel' | 'sway'
  | 'wave'   | 'rise'   | 'coinflip' | 'appear';

export interface MascotFrame { emoji: string; anim: MascotAnim }

// Patterns are checked in ORDER — more specific compound matches come first.
// Leading \b only (no trailing) so "trains" matches \btrain, "bursts" matches \bburst, etc.
const MASCOT_SCENES: { pattern: RegExp; frames: MascotFrame[] }[] = [

  // ── Tragic / solemn — always wins ─────────────────────────────────────
  { pattern: /\b(died?|death|killed|fatal|passed away|shooting|casualties|victims|murder)/i,
    frames: [{ emoji: '🕯️', anim: 'float' }] },

  // ── Natural disasters (compound) ──────────────────────────────────────
  { pattern: /\bhurricane|\btyphoon|\bcyclone|\btornado/i,
    frames: [{ emoji: '🌪️', anim: 'spin' }, { emoji: '🏠', anim: 'shake' }] },
  { pattern: /\bearthquake|\bseismic|\btremor|\bmagnitude\s+\d/i,
    frames: [{ emoji: '🌍', anim: 'shake' }, { emoji: '🏚️', anim: 'fall' }] },
  { pattern: /\btsunami|\bflash flood|\bstorm surge/i,
    frames: [{ emoji: '🌊', anim: 'wave' }, { emoji: '🏠', anim: 'shake' }] },

  // ── Transport + water/infrastructure (compound: most specific first) ──
  // Train/tube + pipe burst / flood — e.g. "delays to Heathrow trains as pipe bursts"
  { pattern: /(\btrain|\brail|\btube|\bmetro|\bunderground).{0,120}(\bpipe|\bburst|\bflood|\bwater leak)|(\bpipe|\bburst|\bflood).{0,120}(\btrain|\brail|\btube|\bmetro)/i,
    frames: [{ emoji: '🚂', anim: 'jolt' }, { emoji: '💧', anim: 'spurt' }] },
  // Flight + cancellation / grounding
  { pattern: /(\bflight|\bairport|\bplane|\bairline|\bheathrow|\bgatwick|\blax|\bjfk).{0,80}(\bcancel|\bdelay|\bdisrupt|\bground|\bhalt)|(\bcancel|\bdelay|\bground).{0,80}(\bflight|\bairport|\bplane|\bairline)/i,
    frames: [{ emoji: '✈️', anim: 'jolt' }, { emoji: '⏰', anim: 'pulse' }] },
  // Train delay (no water cause — just the train stopping)
  { pattern: /(\btrain|\brail|\btube|\bmetro|\bunderground|\btram|\bsubway).{0,80}(\bdelay|\bcancel|\bhalt|\bdisrupt|\bsuspend|\bclosure)|(\bdelay|\bdisrupt|\bcancel|\bhalt).{0,80}(\btrain|\brail|\btube|\bmetro|\bsubway)/i,
    frames: [{ emoji: '🚂', anim: 'jolt' }, { emoji: '⚠️', anim: 'shake' }] },
  // Pipe burst / flooding standalone
  { pattern: /\bpipe burst|\bburst pipe|\bwater main|\bflooding|\bflood waters/i,
    frames: [{ emoji: '💧', anim: 'spurt' }, { emoji: '🏘️', anim: 'wave' }] },
  // Power outage
  { pattern: /\bpower outage|\bblackout|\bpower cut|\bgrid failure|\belectricity (cut|fail)/i,
    frames: [{ emoji: '⚡', anim: 'shake' }, { emoji: '🕯️', anim: 'float' }] },
  // Workers' strike
  { pattern: /\bstrike|\bwalkout|\bindustrial action|\bunion\b.{0,60}\bwalk/i,
    frames: [{ emoji: '✊', anim: 'pulse' }, { emoji: '🪧', anim: 'wiggle' }] },
  // Car / road accident
  { pattern: /\bcar crash|\bvehicle accident|\broad accident|\bpile.?up|\bcollision|\bpileup/i,
    frames: [{ emoji: '🚗', anim: 'shake' }, { emoji: '💥', anim: 'pop' }] },

  // ── Fire & explosion ──────────────────────────────────────────────────
  { pattern: /\bwildfire|\bforest fire|\bbushfire|\bburning|\bablaze|\bon fire/i,
    frames: [{ emoji: '🔥', anim: 'sway' }, { emoji: '🌲', anim: 'shake' }] },
  { pattern: /\bexplod|\bexplosion|\bdetonation|\bblast kills|\bblast injures/i,
    frames: [{ emoji: '💥', anim: 'pop' }, { emoji: '🔥', anim: 'sway' }] },

  // ── War / conflict ────────────────────────────────────────────────────
  { pattern: /\bwar|\bmilitary attack|\bairstrike|\btroops|\binvasion|\bmissile (hits|strikes|attack)/i,
    frames: [{ emoji: '💣', anim: 'shake' }, { emoji: '💥', anim: 'pop' }] },

  // ── Space ─────────────────────────────────────────────────────────────
  { pattern: /\brocket|\bspacex|\bstarship|\bnasa.{0,40}\blaunch|\blaunch.{0,30}\brocket|\borbit|\bspacecraft|\bastronaut/i,
    frames: [{ emoji: '🚀', anim: 'zip' }, { emoji: '✨', anim: 'pulse' }] },
  { pattern: /\bblack hole|\basteroid|\bgalaxy|\btelescope|\bjames webb|\bhubble|\bexoplanet/i,
    frames: [{ emoji: '🌌', anim: 'float' }, { emoji: '✨', anim: 'pulse' }] },

  // ── AI (compound: AI replacing jobs is distinct from AI launching) ─────
  { pattern: /(\bai|\brobots?|\bautomation).{0,60}(\bfires?|\blays? off|\breplace|\beliminate|\bcut jobs)|(\breplace|\beliminate).{0,50}(\bjobs?|\bworkers?|\bhumans?)/i,
    frames: [{ emoji: '🤖', anim: 'wiggle' }, { emoji: '👤', anim: 'fall' }] },
  { pattern: /\bopenai|\bchatgpt|\bgpt-?\d|\bgemini|\bclaude\b|\banthropic|\bdeepmind|\bllm\b/i,
    frames: [{ emoji: '🤖', anim: 'wiggle' }, { emoji: '✨', anim: 'appear' }] },

  // ── Apple / Tesla ─────────────────────────────────────────────────────
  { pattern: /\biphone|\bmacbook|\bipad|\bapple watch|\bvision pro|\bimac|\bairpods/i,
    frames: [{ emoji: '🍎', anim: 'appear' }, { emoji: '📱', anim: 'bounce' }] },
  { pattern: /\btesla|\belectric vehicle|\bself-driving|\bautopilot|\belon( musk)?/i,
    frames: [{ emoji: '🚗', anim: 'zip' }, { emoji: '⚡', anim: 'pulse' }] },

  // ── Crypto ────────────────────────────────────────────────────────────
  { pattern: /(\bbitcoin|\bethereum|\bcrypto).{0,60}(\bcrash|\bdrop|\bplunge|\bfall|\bsink)/i,
    frames: [{ emoji: '🪙', anim: 'fall' }, { emoji: '📉', anim: 'shake' }] },
  { pattern: /(\bbitcoin|\bethereum|\bcrypto).{0,60}(\bsurge|\bsoar|\brise|\brally|\bhit.{0,10}high)/i,
    frames: [{ emoji: '🪙', anim: 'bounce' }, { emoji: '📈', anim: 'rise' }] },
  { pattern: /\bbitcoin|\bethereum|\bcrypto|\bblockchain|\bnft\b|\bdefi\b|\bbinance|\bcoinbase/i,
    frames: [{ emoji: '🪙', anim: 'coinflip' }] },

  // ── Security / hacking ────────────────────────────────────────────────
  { pattern: /\bhack|\bbreach|\bdata leak|\bvulnerability|\bransomware|\bcyberattack|\bmalware|\bphishing|\bzero.day/i,
    frames: [{ emoji: '🔓', anim: 'shake' }, { emoji: '💀', anim: 'wiggle' }] },

  // ── Business / finance ────────────────────────────────────────────────
  // Layoffs
  { pattern: /\blays? off|\blayoffs?|\bjob cuts?|\bworkforce (cut|reduction|slash)|\bfires? (staff|employees|workers|hundreds|thousands)/i,
    frames: [{ emoji: '✂️', anim: 'chop' }, { emoji: '😭', anim: 'bounce' }] },
  // Bankruptcy
  { pattern: /\bbankrupt|\binsolvency|\bfiles? for chapter|\bgoes? under|\bliquidat/i,
    frames: [{ emoji: '🏦', anim: 'fall' }, { emoji: '💀', anim: 'wiggle' }] },
  // Stock crash
  { pattern: /(\bstock|\bshares?|\bmarket|\bnasdaq|\bs&p).{0,60}(\bcrash|\bplunge|\btank|\bplummet|\btumble|\bdrop)|(\bcrash|\bplunge|\btank).{0,60}(\bstock|\bmarket|\bshares?)/i,
    frames: [{ emoji: '📉', anim: 'fall' }, { emoji: '💸', anim: 'fall' }] },
  // Record profits / rally
  { pattern: /\brecord (high|profit|revenue|earnings)|\ball.time high|\bstock.{0,15}(surge|soar|rally)/i,
    frames: [{ emoji: '📈', anim: 'rise' }, { emoji: '💰', anim: 'bounce' }] },
  // Funding / IPO
  { pattern: /\braises?\s+\$|\bfunding round|\bseries [a-d]\b|\bipo\b|\bvaluation.{0,20}billion/i,
    frames: [{ emoji: '💰', anim: 'bounce' }, { emoji: '🚀', anim: 'zip' }] },
  // Acquisition / merger
  { pattern: /\bacqui|\bmerger|\bbuys?\s+.{0,20}for\s+\$|\btakeover\b/i,
    frames: [{ emoji: '🤝', anim: 'pulse' }, { emoji: '💼', anim: 'appear' }] },
  // Product recall
  { pattern: /\brecall(s|ed)?\b.{0,60}\b(million|thousand|vehicle|phone|device)|\bsafety (issue|defect|risk)/i,
    frames: [{ emoji: '⚠️', anim: 'shake' }, { emoji: '🔧', anim: 'wiggle' }] },
  // Inflation / prices rising
  { pattern: /\binflation|\binterest rate (rise|hike|increase)|\bcost of living|\bprice hike|\bprice rise/i,
    frames: [{ emoji: '💸', anim: 'fall' }, { emoji: '🛒', anim: 'shake' }] },

  // ── Legal / political ─────────────────────────────────────────────────
  { pattern: /\bsues?|\blawsuit|\bfound guilty|\bverdict|\bindicted|\bantitrust ruling/i,
    frames: [{ emoji: '⚖️', anim: 'wiggle' }, { emoji: '🔨', anim: 'gavel' }] },
  { pattern: /\barrested?|\bcharged\b|\bsentenced|\bconvicted|\bjailed/i,
    frames: [{ emoji: '🚔', anim: 'pulse' }, { emoji: '🔒', anim: 'shake' }] },
  { pattern: /\bresigns?|\bsteps? down|\bquits?|\bforced out/i,
    frames: [{ emoji: '👤', anim: 'fall' }, { emoji: '🚪', anim: 'shake' }] },
  { pattern: /\bbans?|\bblocks?|\brestricts?|\bcensors?|\bshuts? down|\btakes? down/i,
    frames: [{ emoji: '🚫', anim: 'shake' }, { emoji: '🔒', anim: 'appear' }] },
  { pattern: /\belection|\bvotes?|\bpolling|\bballot|\bpresident|\bcongress|\bparliament|\bdemocrat|\brepublican/i,
    frames: [{ emoji: '🗳️', anim: 'bounce' }, { emoji: '🏛️', anim: 'pulse' }] },
  { pattern: /\bprotest|\bdemonstration|\bmarch\b|\briot\b|\bunrest|\bclashes?/i,
    frames: [{ emoji: '✊', anim: 'pulse' }, { emoji: '📢', anim: 'wiggle' }] },

  // ── Climate / environment ─────────────────────────────────────────────
  { pattern: /\bclimate|\bcarbon|\bemissions?|\brenewable energy|\bsolar|\bwind energy|\bfossil fuel|\bnet zero/i,
    frames: [{ emoji: '🌱', anim: 'float' }, { emoji: '🌍', anim: 'spin' }] },

  // ── Health / medical ──────────────────────────────────────────────────
  { pattern: /\bvaccine|\bdrug (approved|trial|breakthrough)|\bcancer (cure|treatment|breakthrough)|\bfda approves?/i,
    frames: [{ emoji: '💉', anim: 'appear' }, { emoji: '🔬', anim: 'pulse' }] },
  { pattern: /\bpandemic|\bepidemic|\boutbreak|\bvirus (spreading|surging)|\bcases (surge|rise|spike)/i,
    frames: [{ emoji: '🦠', anim: 'pulse' }, { emoji: '😷', anim: 'shake' }] },

  // ── Gaming ────────────────────────────────────────────────────────────
  { pattern: /\bxbox|\bplaystation|\bnintendo|\bfortnite|\bsteam\b|\besport|\bgta\s*\d|\bgame.{0,20}(launch|release|reveal)/i,
    frames: [{ emoji: '🎮', anim: 'dance' }, { emoji: '🎉', anim: 'pop' }] },

  // ── Social media ──────────────────────────────────────────────────────
  { pattern: /(\btwitter|\btiktok|\binstagram|\bfacebook|\byoutube|\bsnapchat).{0,60}(\bbans?|\bblocks?|\bshut|\bdown|\bsuspend|\bcensor)/i,
    frames: [{ emoji: '📱', anim: 'shake' }, { emoji: '🚫', anim: 'appear' }] },
  { pattern: /\btwitter|\btiktok|\binstagram|\bfacebook|\byoutube|\bsnapchat/i,
    frames: [{ emoji: '📱', anim: 'dance' }] },

  // ── Science discoveries ───────────────────────────────────────────────
  { pattern: /\bdiscovered?|\bbreakthrough|\bfirst (time|ever|human|woman)|\bscientists (find|confirm|prove)|\bnew species/i,
    frames: [{ emoji: '🔬', anim: 'pulse' }, { emoji: '✨', anim: 'appear' }] },

  // ── Records / achievements ────────────────────────────────────────────
  { pattern: /\bsets? (a )?record|\bmilestone|\bfirst ever|\bhistoric(al)?|\bchampionship|\bworld record/i,
    frames: [{ emoji: '🏆', anim: 'bounce' }, { emoji: '🎊', anim: 'pop' }] },

  // ── Announcements / reveals (broad catch-all, must be last) ──────────
  { pattern: /\bunveils?|\breveals?|\bdebuts?|\bintroduces?/i,
    frames: [{ emoji: '🎉', anim: 'pop' }, { emoji: '✨', anim: 'appear' }] },
];

const CATEGORY_MASCOT_FALLBACKS: Record<string, MascotFrame[]> = {
  technology: [{ emoji: '💻', anim: 'pulse'  }],
  world:      [{ emoji: '🌐', anim: 'spin'   }],
  science:    [{ emoji: '🧬', anim: 'spin'   }],
  business:   [{ emoji: '💼', anim: 'bounce' }],
  gaming:     [{ emoji: '👾', anim: 'dance'  }],
  general:    [{ emoji: '📰', anim: 'wiggle' }],
};

export function getMascotScene(article: Article): MascotFrame[] {
  const text = article.title + ' ' + (article.description ?? '');
  for (const { pattern, frames } of MASCOT_SCENES) {
    if (pattern.test(text)) return frames;
  }
  return CATEGORY_MASCOT_FALLBACKS[article.category] ?? [{ emoji: '✨', anim: 'pulse' }];
}

export function getGiphyQuery(article: Article): string {
  const lower = article.title.toLowerCase();
  if (lower.includes('openai') || lower.includes('gpt')) return 'ai robot mind blown meme';
  if (lower.includes('apple') || lower.includes('iphone')) return 'apple fan excited meme';
  if (lower.includes('elon') || lower.includes('tesla')) return 'mind blown reaction meme';
  if (lower.includes('crypto') || lower.includes('bitcoin')) return 'stonks meme crypto';
  if (lower.includes('google') || lower.includes('deepmind')) return 'google meme surprised';
  if (lower.includes('meta') || lower.includes('zuckerberg')) return 'robot meme funny';
  if (lower.includes('space') || lower.includes('nasa')) return 'space explosion wow meme';
  if (lower.includes('climate') || lower.includes('earth')) return 'this is fine meme fire';
  if (lower.includes('game') || lower.includes('nintendo') || lower.includes('gta')) return 'gaming victory meme';
  if (lower.includes('money') || lower.includes('billion')) return 'money rain meme';
  if (lower.includes('war') || lower.includes('crisis')) return 'shocked reaction meme';
  if (lower.includes('science') || lower.includes('discovery')) return 'science mind blown meme';

  const q: Record<string, string[]> = {
    technology: ['mind blown tech meme','robot surprised meme','tech bro meme'],
    world:      ['shocked news reaction meme','this is fine meme','omg meme'],
    science:    ['science mind blown meme','eureka meme'],
    business:   ['stonks meme','money printer meme'],
    gaming:     ['gaming victory meme','gamer reaction meme'],
    general:    ['shocked meme','mind blown meme','bruh moment meme'],
  };
  const queries = q[article.category] || q.general;
  return queries[Math.abs(stableHash(article.id)) % queries.length];
}
