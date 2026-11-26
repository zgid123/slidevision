import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface IPlayParams {
  url: string;
  slide: number;
}

export interface IPresentationApi {
  play: (params: IPlayParams) => Promise<void>;
  onPresentationChanged: (
    listener: (isPresenting: boolean) => void,
  ) => Promise<() => void>;
}

export const presentationChangedEvent = 'presentation-changed';

export const presentationApi: IPresentationApi = {
  play: ({ url, slide }) => {
    return invoke('play', {
      url,
      slide,
    });
  },
  onPresentationChanged: (listener) => {
    return listen<boolean>(presentationChangedEvent, (event) => {
      listener(event.payload);
    });
  },
};
