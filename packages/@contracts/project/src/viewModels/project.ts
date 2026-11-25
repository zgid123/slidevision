import type { IDeck } from './deck';

export const projectKind = {
  workspace: 'workspace',
  single: 'single',
} as const;

export type TProject =
  | {
      kind: typeof projectKind.workspace;
      root: string;
      decks: IDeck[];
    }
  | {
      kind: typeof projectKind.single;
      root: string;
      deck: IDeck;
    };
