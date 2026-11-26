declare module '@slidev/client/composables/useDrawings.ts' {
  import type { Ref } from 'vue';

  export function useDrawings(): {
    drawingEnabled: Ref<boolean>;
  };
}

declare module '@slidev/client/composables/useClicks.ts' {
  import type { ClicksContext, SlideRoute } from '@slidev/types';

  export function createFixedClicks(
    route?: SlideRoute,
    currentInit?: number,
  ): ClicksContext;
}

declare module '@slidev/client/composables/useNav.ts' {
  import type { SlideRoute } from '@slidev/types';
  import type { Ref } from 'vue';

  export type TNavSlideRoute = SlideRoute & {
    meta: {
      slide: {
        title?: string;
      };
    };
  };

  export function useNav(): {
    slides: Ref<TNavSlideRoute[]>;
  };
}

declare module '@slidev/client/constants.ts' {
  export const CLICKS_MAX: number;
}

declare module '@slidev/client/internals/SlideContainer.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{
    width?: number;
  }>;

  export default component;
}

declare module '@slidev/client/internals/SlideWrapper.vue' {
  import type { ClicksContext, RenderContext, SlideRoute } from '@slidev/types';
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{
    clicksContext: ClicksContext;
    route: SlideRoute;
    renderContext?: RenderContext;
  }>;

  export default component;
}

declare module '@slidev/client/state/storage.ts' {
  import type { ComputedRef, Ref } from 'vue';

  export const isInputting: ComputedRef<boolean>;
  export const showGotoDialog: Ref<boolean>;
  export const showOverview: Ref<boolean>;
}
