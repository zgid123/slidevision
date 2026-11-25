interface IProjectErrorParams {
  root: string;
}

export class ProjectError extends Error {
  public static missingEntry({ root }: IProjectErrorParams): ProjectError {
    return new ProjectError(
      `${root} has no slidevision.json or slides.md. Open a folder with a slidevision.json that lists your decks, or a deck folder with a slides.md.`,
    );
  }

  private constructor(message: string) {
    super(message);
    this.name = 'ProjectError';
  }
}
