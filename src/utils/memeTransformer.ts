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

// hard news — still has voice but respectful, no punching down
const seriousTemplates: T[] = [
  t => `not me finding out about "${t}" through a meme app 💀`,
  t => `"${t}" and they really just dropped that mid-week. no follow-up. nothing.`,
  t => `"${t}" — let that one marinate.`,
  t => `nobody:\n…\nthe world, unprompted: ${t}`,
  t => `pov: you have to explain "${t}" to your group chat 😶`,
  t => `they really said "${t}" like it was a casual Tuesday 🚨`,
  t => `${t}. this is not a drill. drink water. call your mum.`,
  t => `"${t}" and we're all supposed to just carry on? okay bestie 🙃`,
];

// general / world — roast-y sarcasm, dry humour
const hypedTemplates: T[] = [
  t => `"${t}" — the bar limbo'd underground and they brought a shovel`,
  t => `breaking: ${t}. experts shocked. everyone else: "yeah that tracks"`,
  t => `they really looked at the situation and said "${t}" and called it a day`,
  t => `"${t}" — groundbreaking stuff. truly. someone give these people a medal 🙄`,
  t => `the audacity of "${t}" delivered with zero self-awareness is actually impressive`,
  t => `${t}. no notes. no accountability. vibes only.`,
  t => `imagine being the person whose job it is to announce "${t}" with a straight face`,
  t => `${t} and they wonder why nobody trusts them anymore 💀`,
  t => `them: "${t}"\nalso them: surprised pikachu face`,
  t => `"${t}" — sir this isn't an achievement, it's a cry for help`,
  t => `${t} and the PR team said "spin it positive, we'll be fine"`,
  t => `"${t}" posted at 11pm on a Friday. cowards.`,
  t => `${t}. we clapped. god help us, we clapped.`,
  t => `not them announcing "${t}" like it's something to be proud of 💅`,
  t => `${t} and nobody's going to jail. remarkable.`,
  t => `they said "${t}", smiled, and walked to their private jet. respect the commitment.`,
];

// tech / silicon valley — savage roasts with comedy roast energy
const techTemplates: T[] = [
  t => `"${t}" — 500 engineers, $10B in compute, and this is what we built. incredible.`,
  t => `${t} and the guy who pitched it definitely owns an NFT`,
  t => `"${t}" — a solution in search of a problem, underwritten by people who've never touched grass`,
  t => `they laid off 3,000 people last quarter and announced "${t}" this quarter. love the pivot.`,
  t => `"${t}" — Y Combinator is already funding 40 clones of it as we speak`,
  t => `big tech looked at all of society's problems and said "${t}". we're in great hands.`,
  t => `"${t}" — five slides, one demo that only works on WiFi, and a $2B valuation. Silicon Valley moment.`,
  t => `the same company that broke your privacy announced "${t}". but this time it's different, they promise.`,
  t => `"${t}" — brought to you by the same geniuses who thought your fridge needed an app`,
  t => `they disrupted the disruptors and the disruption was "${t}". the circle is complete.`,
  t => `"${t}" — the press release was 800 words. the actual benefit to users: unclear.`,
  t => `a man in a black turtleneck rehearsed "${t}" in a mirror for 6 months. and it shows.`,
  t => `"${t}" — congrats on reinventing something that already existed but worse and with a subscription`,
  t => `${t}. the stock is already up 12%. nobody knows why. nobody has to know why.`,
  t => `"${t}" — move fast, break things, and apparently also break: ${t}`,
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
