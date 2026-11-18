/**
 * Cryptographically strong random utilities with Math.random fallback.
 * Guarantees uniform distribution for coin flips and spin wheel calculations.
 */

export function getRandomFloat(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function getRandomInt(min: number, max: number): number {
  const float = getRandomFloat();
  return Math.floor(float * (max - min + 1)) + min;
}

export function flipCoin(): 'A' | 'B' {
  return getRandomFloat() < 0.5 ? 'A' : 'B';
}
