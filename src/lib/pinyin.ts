const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à", "a"],
  e: ["ē", "é", "ě", "è", "e"],
  i: ["ī", "í", "ǐ", "ì", "i"],
  o: ["ō", "ó", "ǒ", "ò", "o"],
  u: ["ū", "ú", "ǔ", "ù", "u"],
  v: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"], // ü written as v in numeric input
};

function applyTone(syllable: string, tone: number): string {
  const t = tone - 1; // 0-indexed; tone 5 (neutral) = index 4

  // Rule 1: a or e always takes the mark
  for (const v of ["a", "e"]) {
    const i = syllable.indexOf(v);
    if (i !== -1) return syllable.slice(0, i) + TONE_MARKS[v][t] + syllable.slice(i + 1);
  }

  // Rule 2: ou → o takes the mark
  const ouIdx = syllable.indexOf("ou");
  if (ouIdx !== -1) return syllable.slice(0, ouIdx) + TONE_MARKS["o"][t] + syllable.slice(ouIdx + 1);

  // Rule 3: last vowel takes the mark
  const vowels = "aeiouv";
  let lastIdx = -1;
  let lastVowel = "";
  for (let i = 0; i < syllable.length; i++) {
    if (vowels.includes(syllable[i])) { lastIdx = i; lastVowel = syllable[i]; }
  }
  if (lastIdx !== -1 && TONE_MARKS[lastVowel]) {
    return syllable.slice(0, lastIdx) + TONE_MARKS[lastVowel][t] + syllable.slice(lastIdx + 1);
  }

  return syllable;
}

/**
 * Converts numeric-tone pinyin to tone-marked pinyin.
 * Works on single syllables or full sentences.
 * e.g. "Wo3 you3 yi1 zhi1 gou3." → "Wǒ yǒu yī zhī gǒu."
 */
export function toToneMarks(input: string): string {
  if (!input) return input;
  return input.replace(/([a-zA-Zü:v]+)([1-5])/g, (_, syllable, toneNum) => {
    const tone = parseInt(toneNum);
    const lower = syllable.toLowerCase();
    const result = tone === 5 ? lower : applyTone(lower, tone);
    // Preserve original capitalisation on first letter
    return syllable[0] === syllable[0].toUpperCase()
      ? result[0].toUpperCase() + result.slice(1)
      : result;
  });
}
