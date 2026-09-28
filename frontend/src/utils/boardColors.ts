/**
 * Deterministic gradient palette assignment for boards.
 * Ported from prototypes/boards-3d.html — each board gets a stable
 * two-color gradient derived from a hash of its id, so the same board
 * always renders with the same colors across sessions and views.
 */

export type BoardGradient = readonly [string, string];

export const BOARD_PALETTE: readonly BoardGradient[] = [
  ['#ff7a59', '#ff3d7f'],
  ['#4c9dff', '#7b5cff'],
  ['#22c55e', '#0ea5a4'],
  ['#f5b82e', '#ff7a1a'],
  ['#b05cff', '#ff5ccf'],
  ['#06b6d4', '#3b82f6'],
];

/** Simple deterministic string hash (djb2-like), always returns a non-negative integer. */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Returns the deterministic [color1, color2] gradient for a given board id. */
export function getBoardColors(boardId: string): BoardGradient {
  const index = hashString(boardId) % BOARD_PALETTE.length;
  return BOARD_PALETTE[index];
}
