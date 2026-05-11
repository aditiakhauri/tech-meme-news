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

// serious/hard news — voice but no punching down
const seriousTemplates: T[] = [
  t => `found out about "${t}" here. on a meme app. we live in a society.`,
  t => `"${t}" posted at an ungodly hour with zero follow-up. cowards.`,
  t => `"${t}" — dropped it, walked away. no context. just vibes.`,
  t => `nobody asked. the universe: "${t}". okay then.`,
  t => `pov: explaining "${t}" to your group chat at 2am 💀`,
  t => `"${t}". they said it with their whole chest.`,
  t => `${t}. filed under: things i did not need to know today.`,
  t => `not them making "${t}" everyone's problem. bold strategy.`,
];

// general news — completely unhinged commentary
const hypedTemplates: T[] = [
  t => `"${t}" — THE BAR. IS. UNDERGROUND. they brought a jackhammer.`,
  t => `they woke up, chose chaos, and released: "${t}". respect the commitment.`,
  t => `"${t}"\n\nbabe wake up new reason to lose faith in everything just dropped`,
  t => `breaking: ${t}\n\nalso breaking: my will to live`,
  t => `them: "${t}"\nalso them: 🙂\nme: 🙂🔪`,
  t => `"${t}" and they want a standing ovation for this. audacity of the century.`,
  t => `${t} — i'm not saying it's a cry for help but i'm also not NOT saying that`,
  t => `"${t}" said with zero self-awareness and a straight face. iconic in the worst way.`,
  t => `they held a meeting. paid consultants. hired a PR team. and landed on: "${t}"`,
  t => `${t}\n\ngovernments have fallen for less`,
  t => `the villain arc is REAL: "${t}"`,
  t => `"${t}" — not a parody. genuinely happened. we're in the timeline.`,
  t => `${t} and the PR statement was 6 paragraphs of nothing. masterclass.`,
  t => `they said "${t}" and i need someone to hold my hand rn`,
  t => `"${t}"\n\nhistorians will have a field day with us. an absolute field day.`,
  t => `log off. touch grass. delete the app. also: "${t}". have a great day!`,
  t => `${t} and nobody is going to jail. this is fine. everything is fine. 🙃🔥`,
  t => `"${t}" — my therapist is going to hear about this`,
];

// tech/silicon valley — absolutely savage roasts
const techTemplates: T[] = [
  t => `"${t}"\n\n500 engineers. $10 billion in compute. an army of interns.\nand THIS is what we built.`,
  t => `they fired 4,000 people last quarter and announced "${t}" this quarter. the pivot. the audacity.`,
  t => `"${t}" — some guy in a $300 hoodie pitched this with a straight face and VCs cried actual tears`,
  t => `big tech looked at ALL of civilisation's problems and said "${t}" is the hill they want to die on`,
  t => `"${t}"\n\ncongrats on reinventing something that already existed but worse, slower, and $99/month`,
  t => `they put AI in it: "${t}"\n\nof course they did. of COURSE they did.`,
  t => `"${t}" — five slides, one demo that only works on ethernet, $2B valuation. silicon valley normal.`,
  t => `the startup: "${t}"\nthe app store description: "revolutionise your life"\nthe reality: ????`,
  t => `"${t}"\n\nbrought to you by the same geniuses who thought your fridge needed a subscription`,
  t => `a man in a black turtleneck rehearsed "${t}" in a mirror for six months. the hubris. the HUBRIS.`,
  t => `"${t}" — move fast, break things, break: ${t}, and call it disruption`,
  t => `the press release for "${t}" was 900 words. the actual product benefit: vibes, mostly.`,
  t => `them: "${t}"\nalso them: surprised when it doesn't work\nalso also them: blamed the users`,
  t => `"${t}"\n\nstock is up 18%. nobody understands why. nobody has to. we just live here.`,
  t => `they called it a "paradigm shift". it's "${t}". it's not a paradigm shift.`,
  t => `"${t}" — first principles thinking has left the chat. and the building. and the city.`,
  t => `linkedin when this drops: 🤩🤩🤩\nactual engineers reading "${t}": 😶😶😶`,
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
  const shortTitle = article.title.length > 72 ? article.title.slice(0, 69) + '…' : article.title;
  return templates[idx](shortTitle);
}

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

export function getGiphyQuery(article: Article): string {
  const lower = article.title.toLowerCase();
  if (lower.includes('openai') || lower.includes('gpt') || lower.includes('chatgpt')) return 'ai robot mind blown meme';
  if (lower.includes('apple') || lower.includes('iphone')) return 'apple fan excited meme';
  if (lower.includes('elon') || lower.includes('tesla')) return 'mind blown reaction meme';
  if (lower.includes('crypto') || lower.includes('bitcoin')) return 'stonks meme crypto';
  if (lower.includes('google') || lower.includes('deepmind')) return 'google meme surprised';
  if (lower.includes('meta') || lower.includes('zuckerberg')) return 'robot meme funny';
  if (lower.includes('space') || lower.includes('nasa') || lower.includes('mars')) return 'space explosion wow meme';
  if (lower.includes('climate') || lower.includes('earth')) return 'this is fine meme fire';
  if (lower.includes('nintendo') || lower.includes('gta') || lower.includes('game')) return 'gaming victory meme';
  if (lower.includes('money') || lower.includes('billion') || lower.includes('trillion')) return 'money rain meme';
  if (lower.includes('war') || lower.includes('crisis')) return 'shocked reaction meme';
  if (lower.includes('science') || lower.includes('discovery') || lower.includes('found')) return 'science mind blown meme';

  const categoryQueries: Record<string, string[]> = {
    technology: ['mind blown tech meme','robot surprised meme','nerd celebration meme','tech bro meme'],
    world:      ['shocked news reaction meme','omg meme','this is fine meme','global chaos meme'],
    science:    ['science mind blown meme','eureka meme','scientist excited meme'],
    business:   ['stonks meme','money printer meme','corporate meme funny'],
    gaming:     ['gaming victory meme','gamer reaction meme','victory royale meme'],
    general:    ['shocked meme','omg what meme','mind blown meme','bruh moment meme','wait what meme'],
  };

  const queries = categoryQueries[article.category] || categoryQueries.general;
  return queries[Math.abs(stableHash(article.id)) % queries.length];
}
