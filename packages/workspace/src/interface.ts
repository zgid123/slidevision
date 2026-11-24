export type TDeckCover =
  | {
      kind: 'file';
      path: string;
    }
  | {
      kind: 'url';
      url: string;
    };

export interface IDeck {
  id: string;
  name: string;
  dir: string;
  entry: string;
  cover?: TDeckCover;
}
