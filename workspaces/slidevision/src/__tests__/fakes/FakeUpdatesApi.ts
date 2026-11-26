import type { IUpdatesApi } from '#/features/updates/api';
import type { IAvailableUpdate } from '#/features/updates/interface';

export class FakeUpdatesApi implements IUpdatesApi {
  public nextUpdate: IAvailableUpdate | null = null;
  public checkError: unknown = null;
  public relaunchError: unknown = null;
  public checkCalls = 0;
  public relaunchCalls = 0;
  public checkGate: Promise<void> | null = null;
  readonly #listeners = new Set<() => void>();

  public check = async (): Promise<IAvailableUpdate | null> => {
    this.checkCalls += 1;

    if (this.checkGate) {
      await this.checkGate;
    }

    if (this.checkError !== null) {
      throw this.checkError;
    }

    return this.nextUpdate;
  };

  public relaunch = async (): Promise<void> => {
    this.relaunchCalls += 1;

    if (this.relaunchError !== null) {
      throw this.relaunchError;
    }
  };

  public onCheckRequested = async (
    listener: () => void,
  ): Promise<() => void> => {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  };

  public emitCheckRequested = (): void => {
    for (const listener of this.#listeners) {
      listener();
    }
  };
}
