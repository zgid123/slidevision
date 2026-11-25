import { projectKind, type TProject } from '@contracts/project';
import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import { openFolderRequestedEvent, projectsApi } from '#/features/projects/api';

import { deckFactory } from '../../factories/DeckFactory';
import { recentProjectFactory } from '../../factories/RecentProjectFactory';

interface IInvocation {
  command: string;
  args: unknown;
}

describe('#projectsApi', () => {
  let invocations: IInvocation[];

  const mockCommand = (expected: string | null, result: unknown): void => {
    mockIPC(
      (command, args) => {
        invocations.push({
          command,
          args,
        });

        if (command !== expected) {
          throw new Error(`Unexpected command ${command}`);
        }

        return result;
      },
      {
        shouldMockEvents: true,
      },
    );
  };

  beforeEach(() => {
    invocations = [];
  });

  afterEach(() => {
    clearMocks();
  });

  describe('.openProject', () => {
    it('invokes open_project with the path and returns the project', async () => {
      const project: TProject = {
        kind: projectKind.single,
        root: '/talks/solo',
        deck: deckFactory.build(),
      };

      mockCommand('open_project', project);

      const result = await projectsApi.openProject({
        path: '/talks/solo',
      });

      expect(result).toEqual(project);
      expect(invocations).toEqual([
        {
          command: 'open_project',
          args: {
            path: '/talks/solo',
          },
        },
      ]);
    });

    suite('when the command fails', () => {
      it('rejects with the message', async () => {
        mockIPC(() => {
          throw '/empty has no slidevision.json or slides.md.';
        });

        const result = projectsApi.openProject({
          path: '/empty',
        });

        await expect(result).rejects.toBe(
          '/empty has no slidevision.json or slides.md.',
        );
      });
    });
  });

  describe('.closeProject', () => {
    it('invokes close_project', async () => {
      mockCommand('close_project', null);

      await projectsApi.closeProject();

      expect(invocations.map((invocation) => invocation.command)).toEqual([
        'close_project',
      ]);
    });
  });

  describe('.recentProjects', () => {
    it('returns the recent projects', async () => {
      const recent = recentProjectFactory.buildList(2);

      mockCommand('recent_projects', recent);

      expect(await projectsApi.recentProjects()).toEqual(recent);
    });
  });

  describe('.removeRecentProject', () => {
    it('invokes remove_recent_project with the path and returns the list', async () => {
      const remaining = recentProjectFactory.buildList(1);

      mockCommand('remove_recent_project', remaining);

      const result = await projectsApi.removeRecentProject({
        path: '/gone',
      });

      expect(result).toEqual(remaining);
      expect(invocations).toEqual([
        {
          command: 'remove_recent_project',
          args: {
            path: '/gone',
          },
        },
      ]);
    });
  });

  describe('.pickFolder', () => {
    suite('when a folder is chosen', () => {
      it('asks the dialog for a directory and returns its path', async () => {
        mockCommand('plugin:dialog|open', '/talks');

        const path = await projectsApi.pickFolder();

        expect(path).toBe('/talks');
        expect(invocations[0]?.args).toEqual({
          options: expect.objectContaining({
            directory: true,
          }),
        });
      });
    });

    suite('when the dialog is cancelled', () => {
      it('returns null', async () => {
        mockCommand('plugin:dialog|open', null);

        expect(await projectsApi.pickFolder()).toBeNull();
      });
    });
  });

  describe('.onOpenFolderRequested', () => {
    it('calls the listener when the menu event arrives', async () => {
      const listener = vi.fn();

      mockCommand(null, null);

      const stop = await projectsApi.onOpenFolderRequested(listener);

      await emit(openFolderRequestedEvent);

      expect(listener).toHaveBeenCalledTimes(1);

      stop();
    });
  });
});
