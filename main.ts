// One Word, First Thought — entry program (make.fun program/v1).
// Writes exactly one word to /output/entry.txt and validates it against
// the competition gate: UTF-8 text, 1-24 characters, not only whitespace,
// a single word with no spaces or punctuation.
//
// The word is picked from a small curated shortlist scored on the judge's
// own brief: surprise first, then vividness/specificity, then wit or sound.
// The top scorer is written; the rest stay as documented also-rans.
//
// Revision: added "snollygoster" to the shortlist — it outscores the old
// winner on wit (545 vs 542) — and hardened validation with a round-trip
// read-back of the written file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type Candidate = {
  word: string;
  surprise: number; // 1-5: how unexpected the word is to a reader
  vividness: number; // 1-5: how clear an image or feeling it calls up
  wit: number; // 1-5: sound play, double meaning, spark of wit
  note: string;
};

const CANDIDATES: Candidate[] = [
  {
    word: "defenestration",
    surprise: 4,
    vividness: 5,
    wit: 4,
    note: "The act of throwing someone out of a window: a whole violent, comic scene in one word.",
  },
  {
    word: "petrichor",
    surprise: 2,
    vividness: 4,
    wit: 2,
    note: "The smell of rain on dry earth. Beautiful, but the safe, expected pick in every word list.",
  },
  {
    word: "kerfuffle",
    surprise: 3,
    vividness: 3,
    wit: 4,
    note: "A commotion, with a sound that matches its meaning. Fun, but a little too familiar.",
  },
  {
    word: "psithurism",
    surprise: 5,
    vividness: 4,
    wit: 2,
    note: "The sound of wind moving through trees. Rare and lovely, but quiet where the judge wants a spark.",
  },
  {
    word: "snollygoster",
    surprise: 5,
    vividness: 4,
    wit: 5,
    note: "A shrewd, unprincipled person, especially a politician: rare, funny-sounding, and a jab with a target.",
  },
];

const FILLER = new Set([
  "thing", "stuff", "word", "hello", "the", "a", "an", "it", "this", "that",
]);

function score(c: Candidate): number {
  // Judge's order: surprise, then vividness, then wit.
  return c.surprise * 100 + c.vividness * 10 + c.wit;
}

function pickWord(): string {
  const ranked = [...CANDIDATES].sort((a, b) => score(b) - score(a));
  return ranked[0].word;
}

function validate(word: string): void {
  if (typeof word !== "string" || word.length === 0) {
    throw new Error("entry must not be empty");
  }
  if (word.length > 24) {
    throw new Error(`entry is ${word.length} chars, gate allows at most 24`);
  }
  if (word.trim() !== word || /\s/.test(word)) {
    throw new Error("entry must be exactly one word with no whitespace");
  }
  if (!/^[A-Za-z]+$/.test(word)) {
    throw new Error("entry must be a single alphabetic word");
  }
  if (FILLER.has(word.toLowerCase())) {
    throw new Error("entry must not be a generic filler word");
  }
  if (!CANDIDATES.some((c) => c.word === word)) {
    throw new Error("entry must be a word from the scored shortlist");
  }
}

function main(): void {
  const word = pickWord();
  validate(word);
  const outPath = process.env.OUTPUT_PATH ?? "/output/entry.txt";
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, word, "utf8");
  // Round-trip read-back: the file must read back exactly the picked word.
  const back = readFileSync(outPath, "utf8");
  if (back !== word) {
    throw new Error("Write-back verification failed: entry.txt does not match the picked word.");
  }
  console.log(`wrote ${word.length}-char entry to ${outPath}: ${word}`);
}

main();
