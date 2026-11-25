import type { TProject } from '@contracts/project';

import type { IProjectsApi } from '#/features/projects/api';
import type { IRecentProject } from '#/features/projects/interface';

interface IPathParams {
  path: string;
}

export class FakeProjectsApi implements IProjectsApi {
  public readonly projects = new Map<string, TProject>();
  public recent: IRecentProject[] = [];
  public pickedFolder: string | null = null;
  public openProjectPath: string | null = null;
  public isClosed = false;

  public pickFolder = async (): Promise<string | null> => {
    return this.pickedFolder;
  };

  public openProject = async ({ path }: IPathParams): Promise<TProject> => {
    const project = this.projects.get(path);

    if (!project) {
      throw `${path} has no slidevision.json or slides.md.`;
    }

    this.openProjectPath = path;
    this.isClosed = false;
    this.recent = [
      {
        path,
        name: path.split('/').at(-1) ?? path,
        openedAt: this.recent.length + 1,
        isAvailable: true,
      },
      ...this.recent.filter((recent) => recent.path !== path),
    ];

    return project;
  };

  public closeProject = async (): Promise<void> => {
    this.openProjectPath = null;
    this.isClosed = true;
  };

  public recentProjects = async (): Promise<IRecentProject[]> => {
    return this.recent;
  };

  public removeRecentProject = async ({
    path,
  }: IPathParams): Promise<IRecentProject[]> => {
    this.recent = this.recent.filter((recent) => recent.path !== path);

    return this.recent;
  };

  public onOpenFolderRequested = async (): Promise<() => void> => {
    return () => {};
  };
}
