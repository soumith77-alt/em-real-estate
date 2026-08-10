import { rng } from "./seed";

/**
 * Simulated latency so the skeletons are actually seen.
 * Every mock read awaits this. Never `Math.random()` at render.
 */
export const mockDelay = (min = 220, max = 640) =>
  new Promise<void>((r) => setTimeout(r, min + rng() * (max - min)));

export const mockStageDelay = (min = 1500, max = 4000) =>
  new Promise<void>((r) => setTimeout(r, min + rng() * (max - min)));
