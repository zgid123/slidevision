import type { IDeck } from '@contracts/project';
import { projectKind, type TProject } from '@contracts/project';
import { reactive } from 'vue';

import type { IProjectsApi } from '../api';
import type { IRecentProject } from '../interface';

export const screenName = {
  welcome: 'welcome',
  opening: 'opening',
  decks: 'decks',
  deck: 'deck',
} as const;

type TWorkspaceProject = Extract<
  TProject,
  {
    kind: typeof projectKind.workspace;
  }
>;

export type TScreen =
  | {
      name: typeof screenName.welcome;
    }
  | {
      name: typeof screenName.opening;
      path: string;
    }
  | {
      name: typeof screenName.decks;
      project: TWorkspaceProject;
    }
  | {
      name: typeof screenName.deck;
      project: TProject;
      deck: IDeck;
    };

interface IPathParams {
  path: string;
}

interface IOpenDeckParams {
  deck: IDeck;
}

export interface IProjectSession {
  readonly screen: TScreen;
  readonly recent: IRecentProject[];
  readonly error: string | null;
  load: () => Promise<void>;
  openFolder: () => Promise<void>;
  open: (params: IPathParams) => Promise<void>;
  openDeck: (params: IOpenDeckParams) => void;
  back: () => void;
  close: () => Promise<void>;
  removeRecent: (params: IPathParams) => Promise<void>;
}

interface IUseProjectSessionParams {
  api: IProjectsApi;
}

interface ISessionState {
  screen: TScreen;
  recent: IRecentProject[];
  error: string | null;
}

export function useProjectSession({
  api,
}: IUseProjectSessionParams): IProjectSession {
  const state = reactive<ISessionState>({
    screen: {
      name: screenName.welcome,
    },
    recent: [],
    error: null,
  });

  const showProject = (project: TProject): void => {
    if (project.kind === projectKind.single) {
      state.screen = {
        name: screenName.deck,
        project,
        deck: project.deck,
      };

      return;
    }

    state.screen = {
      name: screenName.decks,
      project,
    };
  };

  const load = async (): Promise<void> => {
    state.recent = await api.recentProjects();
  };

  const open = async ({ path }: IPathParams): Promise<void> => {
    state.error = null;
    state.screen = {
      name: screenName.opening,
      path,
    };

    try {
      const project = await api.openProject({
        path,
      });

      showProject(project);
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
      state.screen = {
        name: screenName.welcome,
      };
    }

    await load();
  };

  return {
    get screen() {
      return state.screen;
    },
    get recent() {
      return state.recent;
    },
    get error() {
      return state.error;
    },
    load,
    open,
    openFolder: async () => {
      const path = await api.pickFolder();

      if (path) {
        await open({
          path,
        });
      }
    },
    openDeck: ({ deck }) => {
      if (state.screen.name !== screenName.decks) {
        return;
      }

      state.screen = {
        name: screenName.deck,
        project: state.screen.project,
        deck,
      };
    },
    back: () => {
      const { screen } = state;

      if (
        screen.name !== screenName.deck ||
        screen.project.kind !== projectKind.workspace
      ) {
        return;
      }

      state.screen = {
        name: screenName.decks,
        project: screen.project,
      };
    },
    close: async () => {
      await api.closeProject();

      state.error = null;
      state.screen = {
        name: screenName.welcome,
      };

      await load();
    },
    removeRecent: async ({ path }) => {
      state.recent = await api.removeRecentProject({
        path,
      });
    },
  };
}
