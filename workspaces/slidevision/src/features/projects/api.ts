import type { TProject } from '@contracts/project';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';

import type { IRecentProject } from './interface';

interface IPathParams {
  path: string;
}

export interface IProjectsApi {
  pickFolder: () => Promise<string | null>;
  openProject: (params: IPathParams) => Promise<TProject>;
  closeProject: () => Promise<void>;
  recentProjects: () => Promise<IRecentProject[]>;
  removeRecentProject: (params: IPathParams) => Promise<IRecentProject[]>;
  onOpenFolderRequested: (listener: () => void) => Promise<() => void>;
}

export const openFolderRequestedEvent = 'open-folder-requested';

export const projectsApi: IProjectsApi = {
  pickFolder: async () => {
    const path = await open({
      directory: true,
      title: 'Open a Slidev project',
    });

    return typeof path === 'string' ? path : null;
  },
  openProject: ({ path }) => {
    return invoke('open_project', {
      path,
    });
  },
  closeProject: () => invoke('close_project'),
  recentProjects: () => invoke('recent_projects'),
  removeRecentProject: ({ path }) => {
    return invoke('remove_recent_project', {
      path,
    });
  },
  onOpenFolderRequested: (listener) => {
    return listen(openFolderRequestedEvent, listener);
  },
};
