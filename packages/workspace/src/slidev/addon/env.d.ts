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
