import type { IWireContainer } from './wire';

export type TContext = {
  // biome-ignore lint/style/useNamingConvention: Hono's environment key.
  Variables: IWireContainer;
};
