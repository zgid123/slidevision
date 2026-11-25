import type { TDeckCover } from '@contracts/project';
import { convertFileSrc } from '@tauri-apps/api/core';

export function coverSrc(cover: TDeckCover): string {
  return cover.kind === 'url' ? cover.url : convertFileSrc(cover.path);
}
