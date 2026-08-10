import seedrandom from "seedrandom";

// The prototype must be byte-identical on every reload for the demo.
// Every time we need randomness we use this single RNG instance.
export const rng = seedrandom("em-2026");

export const pick = <T>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];

export const pickN = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  const take = Math.min(n, copy.length);
  for (let i = 0; i < take; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

export const range = (min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const rangeF = (min: number, max: number) => min + rng() * (max - min);

export const chance = (p: number) => rng() < p;
